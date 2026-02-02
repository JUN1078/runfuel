import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Upload, Loader2, ArrowLeft, Sparkles } from 'lucide-react';
import { foodApi } from '../../api/food';
import { useFoodLogStore } from '../../store/foodLogStore';
import type { MealType } from '../../types/food';

const mealOptions: { type: MealType; emoji: string; label: string }[] = [
  { type: 'breakfast', emoji: '🌅', label: 'Breakfast' },
  { type: 'lunch', emoji: '☀️', label: 'Lunch' },
  { type: 'dinner', emoji: '🌙', label: 'Dinner' },
  { type: 'snack', emoji: '🍎', label: 'Snack' },
];

export function PhotoCapturePage() {
  const navigate = useNavigate();
  const { setAnalysisResult, setSelectedPhoto, setAnalyzing, isAnalyzing } = useFoodLogStore();
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [textInput, setTextInput] = useState('');
  const [mealType, setMealType] = useState<MealType>('lunch');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setSelectedPhoto(file);
    setPreview(URL.createObjectURL(file));
  }, [setSelectedPhoto]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const handleAnalyze = async () => {
    const { selectedPhoto } = useFoodLogStore.getState();
    const hasPhoto = !!selectedPhoto;
    const hasText = textInput.trim().length >= 3;

    if (!hasPhoto && !hasText) {
      setError('Please add a photo or describe your food.');
      return;
    }

    setError('');
    setAnalyzing(true);
    try {
      let data;
      if (hasPhoto && hasText) {
        const res = await foodApi.analyzePhotoWithText(selectedPhoto!, textInput.trim());
        data = res.data;
      } else if (hasPhoto) {
        const res = await foodApi.analyzePhoto(selectedPhoto!);
        data = res.data;
      } else {
        const res = await foodApi.analyzeText(textInput.trim());
        data = res.data;
      }
      setAnalysisResult({ ...data, _mealType: mealType } as any);
      navigate('/log/photo/review');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Analysis failed. Try again or log manually.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/dashboard')} className="rounded-lg p-1.5 hover:bg-white/5 transition-colors">
          <ArrowLeft size={20} className="text-[var(--color-text-muted)]" />
        </button>
        <h1 className="text-2xl font-light tracking-tight">Log Food</h1>
      </div>

      {/* Meal type selector */}
      <div>
        <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">Meal Type</label>
        <div className="grid grid-cols-4 gap-2">
          {mealOptions.map(({ type, emoji, label }) => (
            <button
              key={type}
              onClick={() => setMealType(type)}
              className={`rounded-xl py-2.5 text-xs font-medium transition-all ${
                mealType === type
                  ? 'bg-[var(--color-primary)] text-[#0B1C22] shadow-[0_2px_8px_rgba(94,212,198,0.25)]'
                  : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]'
              }`}
            >
              <span className="block text-base">{emoji}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Photo section */}
      <div>
        <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
          Photo
        </label>
        {!preview ? (
          <div
            {...getRootProps()}
            className={`glass-card flex h-48 sm:h-64 cursor-pointer flex-col items-center justify-center transition-all ${
              isDragActive ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 pulse-border' : ''
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10 mb-3">
              <Upload size={24} className="text-[var(--color-primary)]" />
            </div>
            <p className="font-normal text-sm">Drop a food photo here</p>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">or tap to take a photo / choose from gallery</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="glass-card overflow-hidden">
              <img src={preview} alt="Food" className="h-48 sm:h-64 w-full object-cover" />
            </div>
            <button
              onClick={() => {
                setPreview(null);
                useFoodLogStore.getState().setSelectedPhoto(null);
              }}
              className="btn-secondary w-full py-2 text-xs"
            >
              Remove photo
            </button>
          </div>
        )}
      </div>

      {/* Text description */}
      <div className="glass-card p-4">
        <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
          Describe your food {preview ? '(strengthens photo analysis)' : '(or use text only)'}
        </label>
        <textarea
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="e.g. 2 eggs, toast with butter, and a glass of orange juice"
          rows={3}
          className="w-full resize-none"
        />
        <p className="mt-1.5 text-[11px] text-[var(--color-text-muted)]">
          Be specific about portions, cooking methods, and ingredients for accurate estimates.
        </p>
      </div>

      {/* Analyze button */}
      <button
        onClick={handleAnalyze}
        disabled={isAnalyzing || (!preview && textInput.trim().length < 3)}
        className="btn-primary flex w-full items-center justify-center gap-2 py-3.5 text-sm"
      >
        {isAnalyzing ? (
          <>
            <Loader2 size={18} className="animate-spin" /> Analyzing...
          </>
        ) : (
          <>
            <Sparkles size={18} /> Analyze Food
          </>
        )}
      </button>

      {error && (
        <div className="glass-card border-[var(--color-danger)]/20 p-4 text-sm text-[var(--color-danger)]">
          {error}
        </div>
      )}
    </div>
  );
}

import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Camera, Upload, Loader2, ArrowLeft, Type } from 'lucide-react';
import { foodApi } from '../../api/food';
import { useFoodLogStore } from '../../store/foodLogStore';

type InputMode = 'photo' | 'text';

export function PhotoCapturePage() {
  const navigate = useNavigate();
  const { setAnalysisResult, setSelectedPhoto, setAnalyzing, isAnalyzing } = useFoodLogStore();
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<InputMode>('photo');
  const [textInput, setTextInput] = useState('');

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

  const handleAnalyzePhoto = async () => {
    const { selectedPhoto } = useFoodLogStore.getState();
    if (!selectedPhoto) return;

    setError('');
    setAnalyzing(true);
    try {
      const { data } = await foodApi.analyzePhoto(selectedPhoto);
      setAnalysisResult(data);
      navigate('/log/photo/review');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Analysis failed. Try again or log manually.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAnalyzeText = async () => {
    if (!textInput.trim() || textInput.trim().length < 3) {
      setError('Please describe your food (at least 3 characters).');
      return;
    }

    setError('');
    setAnalyzing(true);
    try {
      const { data } = await foodApi.analyzeText(textInput.trim());
      setAnalysisResult(data);
      navigate('/log/photo/review');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Analysis failed. Try again or log manually.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/dashboard')} className="rounded-lg p-1.5 hover:bg-white/5 transition-colors">
          <ArrowLeft size={20} className="text-[var(--color-text-muted)]" />
        </button>
        <h1 className="text-2xl font-bold tracking-tight">Log Food</h1>
      </div>

      {/* Mode toggle */}
      <div className="tab-group">
        <button
          onClick={() => setMode('photo')}
          className={mode === 'photo' ? 'tab-item-active' : 'tab-item'}
        >
          <span className="flex items-center justify-center gap-1.5">
            <Camera size={15} /> Photo
          </span>
        </button>
        <button
          onClick={() => setMode('text')}
          className={mode === 'text' ? 'tab-item-active' : 'tab-item'}
        >
          <span className="flex items-center justify-center gap-1.5">
            <Type size={15} /> Describe
          </span>
        </button>
      </div>

      {mode === 'photo' ? (
        <>
          {!preview ? (
            <div
              {...getRootProps()}
              className={`glass-card flex h-64 cursor-pointer flex-col items-center justify-center transition-all ${
                isDragActive
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 pulse-border'
                  : ''
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10 mb-4">
                <Upload size={28} className="text-[var(--color-primary)]" />
              </div>
              <p className="font-semibold">Drop a food photo here</p>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">or tap to take a photo / choose from gallery</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="glass-card overflow-hidden">
                <img src={preview} alt="Food" className="h-64 w-full object-cover" />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setPreview(null);
                    useFoodLogStore.getState().setSelectedPhoto(null);
                  }}
                  className="btn-secondary flex-1 py-3 text-sm"
                >
                  Retake
                </button>
                <button
                  onClick={handleAnalyzePhoto}
                  disabled={isAnalyzing}
                  className="btn-primary flex flex-1 items-center justify-center gap-2 py-3 text-sm"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Analyzing...
                    </>
                  ) : (
                    <>
                      <Camera size={18} /> Analyze
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-4">
          <div className="glass-card p-4">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Describe your food
            </label>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="e.g. 2 eggs, toast with butter, and a glass of orange juice"
              rows={4}
              className="w-full resize-none"
            />
            <p className="mt-2 text-[11px] text-[var(--color-text-muted)]">
              Be specific about portions, cooking methods, and ingredients for accurate estimates.
            </p>
          </div>
          <button
            onClick={handleAnalyzeText}
            disabled={isAnalyzing || textInput.trim().length < 3}
            className="btn-primary flex w-full items-center justify-center gap-2 py-3 text-sm"
          >
            {isAnalyzing ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Analyzing...
              </>
            ) : (
              <>
                <Type size={18} /> Analyze Food
              </>
            )}
          </button>
        </div>
      )}

      {error && (
        <div className="glass-card border-[var(--color-danger)]/20 p-4 text-sm text-[var(--color-danger)]">
          {error}
        </div>
      )}
    </div>
  );
}

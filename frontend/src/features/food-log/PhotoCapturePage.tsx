import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Camera, Upload, Loader2 } from 'lucide-react';
import { foodApi } from '../../api/food';
import { useFoodLogStore } from '../../store/foodLogStore';

export function PhotoCapturePage() {
  const navigate = useNavigate();
  const { setAnalysisResult, setSelectedPhoto, setAnalyzing, isAnalyzing } = useFoodLogStore();
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState('');

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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Log Food with Photo</h1>

      {!preview ? (
        <div
          {...getRootProps()}
          className={`flex h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-colors ${
            isDragActive
              ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
              : 'border-[var(--color-surface-light)] bg-[var(--color-surface)]'
          }`}
        >
          <input {...getInputProps()} />
          <Upload size={40} className="mb-3 text-[var(--color-text-muted)]" />
          <p className="font-medium">Drop a food photo here</p>
          <p className="text-sm text-[var(--color-text-muted)]">or tap to take a photo / choose from gallery</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl">
            <img src={preview} alt="Food" className="h-64 w-full object-cover" />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setPreview(null);
                useFoodLogStore.getState().setSelectedPhoto(null);
              }}
              className="flex-1 rounded-xl border border-[var(--color-surface-light)] py-3 font-semibold"
            >
              Retake
            </button>
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] py-3 font-semibold text-white disabled:opacity-50"
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

      {error && (
        <div className="rounded-xl bg-red-500/10 p-4 text-sm text-[var(--color-danger)]">
          {error}
        </div>
      )}
    </div>
  );
}

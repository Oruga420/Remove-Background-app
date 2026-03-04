import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon, Download, RefreshCw, X, Check, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { removeBackground } from './services/gemini.ts';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setMimeType(file.type);
    const reader = new FileReader();
    reader.onload = () => {
      setOriginalImage(reader.result as string);
      setProcessedImage(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] } as any,
    multiple: false,
  } as any);

  const handleProcess = async () => {
    if (!originalImage) return;

    setIsProcessing(true);
    setError(null);

    try {
      const base64Data = originalImage.split(',')[1];
      const result = await removeBackground(base64Data, mimeType);
      setProcessedImage(result);
    } catch (err) {
      console.error(err);
      setError('Failed to process image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!processedImage) return;
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = 'clearcut-result.png';
    link.click();
  };

  const reset = () => {
    setOriginalImage(null);
    setProcessedImage(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-[#141414] font-sans selection:bg-emerald-200">
      {/* Header */}
      <header className="border-b border-[#141414]/10 bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#141414] rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">ClearCut AI</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono uppercase tracking-widest opacity-50 hidden sm:block">
              Powered by Gemini 2.5
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-medium tracking-tight mb-4"
          >
            Remove backgrounds <br />
            <span className="italic font-serif">in seconds.</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-[#141414]/60"
          >
            Upload any photo and let our AI handle the rest. 
            Perfect for products, portraits, and more.
          </motion.p>
        </div>

        <div className="max-w-5xl mx-auto">
          {!originalImage ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              {...getRootProps()}
              className={cn(
                "relative group cursor-pointer",
                "border-2 border-dashed border-[#141414]/10 rounded-3xl p-12 transition-all duration-300",
                "hover:border-[#141414]/30 hover:bg-white/50",
                isDragActive && "border-emerald-500 bg-emerald-50/50"
              )}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-6">
                <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Upload className="w-8 h-8 text-[#141414]/40" />
                </div>
                <div className="text-center">
                  <p className="text-xl font-medium mb-2">
                    {isDragActive ? "Drop it here" : "Click or drag image to upload"}
                  </p>
                  <p className="text-sm text-[#141414]/40">
                    Supports PNG, JPG, JPEG
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Original Image Card */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-3xl p-4 shadow-sm border border-[#141414]/5"
              >
                <div className="flex items-center justify-between mb-4 px-2">
                  <span className="text-xs font-mono uppercase tracking-widest opacity-50">Original</span>
                  <button 
                    onClick={reset}
                    className="p-2 hover:bg-red-50 text-red-500 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="aspect-square rounded-2xl overflow-hidden bg-[#F5F5F0] relative group">
                  <img 
                    src={originalImage} 
                    alt="Original" 
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </motion.div>

              {/* Processed Image Card */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-3xl p-4 shadow-sm border border-[#141414]/5 flex flex-col"
              >
                <div className="flex items-center justify-between mb-4 px-2">
                  <span className="text-xs font-mono uppercase tracking-widest opacity-50">Result</span>
                  {processedImage && (
                    <div className="flex items-center gap-1 text-emerald-500 text-xs font-medium">
                      <Check className="w-3 h-3" />
                      Ready
                    </div>
                  )}
                </div>
                
                <div className="aspect-square rounded-2xl overflow-hidden bg-[#F5F5F0] relative flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    {!processedImage && !isProcessing ? (
                      <motion.div 
                        key="placeholder"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center p-8"
                      >
                        <ImageIcon className="w-12 h-12 text-[#141414]/10 mx-auto mb-4" />
                        <p className="text-sm text-[#141414]/40">Click process to remove background</p>
                      </motion.div>
                    ) : isProcessing ? (
                      <motion.div 
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center gap-4"
                      >
                        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                        <p className="text-sm font-medium animate-pulse">AI is working its magic...</p>
                      </motion.div>
                    ) : (
                      <motion.img 
                        key="result"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        src={processedImage!} 
                        alt="Processed" 
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    )}
                  </AnimatePresence>
                </div>

                <div className="mt-6 flex gap-3">
                  {!processedImage ? (
                    <button
                      onClick={handleProcess}
                      disabled={isProcessing}
                      className={cn(
                        "flex-1 h-14 rounded-2xl font-medium transition-all flex items-center justify-center gap-2",
                        "bg-[#141414] text-white hover:bg-[#141414]/90 disabled:opacity-50"
                      )}
                    >
                      {isProcessing ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <RefreshCw className="w-5 h-5" />
                          Process Image
                        </>
                      )}
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleDownload}
                        className="flex-1 h-14 rounded-2xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                      >
                        <Download className="w-5 h-5" />
                        Download
                      </button>
                      <button
                        onClick={handleProcess}
                        disabled={isProcessing}
                        className="w-14 h-14 rounded-2xl border border-[#141414]/10 flex items-center justify-center hover:bg-white transition-all"
                        title="Retry"
                      >
                        <RefreshCw className={cn("w-5 h-5", isProcessing && "animate-spin")} />
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            </div>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-center text-sm font-medium"
            >
              {error}
            </motion.div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-24 border-t border-[#141414]/5 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm text-[#141414]/40">
            © 2026 ClearCut AI. No images are stored on our servers.
          </p>
          <div className="flex items-center gap-8">
            <a href="#" className="text-xs font-mono uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">Privacy</a>
            <a href="#" className="text-xs font-mono uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">Terms</a>
            <a href="#" className="text-xs font-mono uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">API</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

import React, { useState } from 'react';
import { generateCleanBackground, generateLifestyleImage } from '../services/geminiService';
import { PhotoIcon, SparklesIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

interface ImageGeneratorProps {
  originalFile: File;
}

export const ImageGenerator: React.FC<ImageGeneratorProps> = ({ originalFile }) => {
  const [mode, setMode] = useState<'WHITE' | 'LIFESTYLE'>('WHITE');
  const [lifestylePrompt, setLifestylePrompt] = useState("On a modern wooden table with warm sunlight");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setGeneratedImage(null);
    try {
      let resultUrl = '';
      if (mode === 'WHITE') {
        resultUrl = await generateCleanBackground(originalFile);
      } else {
        resultUrl = await generateLifestyleImage(originalFile, lifestylePrompt);
      }
      setGeneratedImage(resultUrl);
    } catch (error) {
      alert("Failed to generate image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `souq-seo-${mode.toLowerCase()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-lg mb-4 text-slate-800">AI Studio</h3>
        
        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-slate-100 rounded-lg mb-4">
          <button
            onClick={() => setMode('WHITE')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${mode === 'WHITE' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            E-Commerce (White BG)
          </button>
          <button
            onClick={() => setMode('LIFESTYLE')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${mode === 'LIFESTYLE' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Lifestyle (Social Media)
          </button>
        </div>

        {/* Controls */}
        {mode === 'LIFESTYLE' && (
          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-500 mb-1">Scene Context</label>
            <input
              type="text"
              value={lifestylePrompt}
              onChange={(e) => setLifestylePrompt(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="e.g., On a marble counter..."
            />
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-xl font-medium hover:bg-slate-800 transition disabled:opacity-70"
        >
          {loading ? (
            <span className="animate-pulse">Processing Image...</span>
          ) : (
            <>
              <SparklesIcon className="h-4 w-4" />
              Generate {mode === 'WHITE' ? 'Standard' : 'Creative'}
            </>
          )}
        </button>
      </div>

      {/* Result Area */}
      {generatedImage && (
        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-md">
           <div className="relative rounded-lg overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/checkerboard.png')]">
              <img src={generatedImage} alt="Generated" className="w-full h-auto object-contain" />
           </div>
           <button 
            onClick={downloadImage}
            className="mt-3 w-full py-2 border border-slate-300 rounded-lg text-slate-700 font-medium text-sm hover:bg-slate-50 flex items-center justify-center gap-2"
           >
             <ArrowDownTrayIcon className="h-4 w-4" />
             Download Image
           </button>
        </div>
      )}
    </div>
  );
};
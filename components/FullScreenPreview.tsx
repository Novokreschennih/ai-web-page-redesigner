import React, { useState, useEffect, useCallback } from 'react';
import { Icon } from './Icon';
import { Loader } from './Loader';
import type { DesignVariation, GeminiModel } from '../types';
import { refineDesign, downloadHtml } from '../services/geminiService';

interface FullScreenPreviewProps {
  design: DesignVariation;
  onClose: () => void;
  model: GeminiModel;
  apiKey: string | null;
}

export const FullScreenPreview: React.FC<FullScreenPreviewProps> = ({ design, onClose, model, apiKey }) => {
  const [currentDesign, setCurrentDesign] = useState<DesignVariation>(design);
  const [isCopied, setIsCopied] = useState(false);
  const [view, setView] = useState<'desktop' | 'mobile'>('desktop');
  const [isIframeLoading, setIsIframeLoading] = useState(true);
  const [refinement, setRefinement] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [refineError, setRefineError] = useState<string | null>(null);

  useEffect(() => {
    setCurrentDesign(design);
  }, [design]);

  useEffect(() => {
    setIsIframeLoading(true);
  }, [currentDesign.html]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentDesign.html).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }).catch(err => console.error('Failed to copy code: ', err));
  };

  const handleRefine = useCallback(async () => {
    if (!refinement.trim()) return;
    if (!apiKey) {
      setRefineError("Ключ API не найден.");
      return;
    }
    setIsRefining(true);
    setRefineError(null);
    try {
      const newDesign = await refineDesign(currentDesign.html, refinement, model, apiKey);
      setCurrentDesign(newDesign);
      setRefinement('');
    } catch (err) {
      setRefineError("Не удалось улучшить дизайн. Попробуйте еще раз.");
      console.error(err);
    } finally {
      setIsRefining(false);
    }
  }, [refinement, currentDesign.html, model, apiKey]);

  const isDesktop = view === 'desktop';
  const mobileIframeClasses = "w-[375px] h-[812px] max-w-full max-h-full border-none bg-white rounded-xl shadow-2xl border-2 border-gray-600";
  const mainClasses = isDesktop 
    ? "flex-grow bg-gray-800 rounded-lg overflow-hidden relative" 
    : "flex-grow flex justify-center items-center py-4 relative";

  return (
    <div
      className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex flex-col p-4 sm:p-6 lg:p-8 transition-opacity duration-300"
      aria-modal="true"
      role="dialog"
    >
      <header className="flex-shrink-0 flex items-center justify-between pb-4 mb-4 border-b border-gray-700 gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white truncate">{currentDesign.name}</h2>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden md:flex items-center gap-1 bg-gray-700/50 p-1 rounded-md">
            <button onClick={() => setView('desktop')} aria-label="Desktop view" className={`p-1.5 rounded-md transition-colors ${view === 'desktop' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-600'}`}><Icon name="desktop" className="w-5 h-5" /></button>
            <button onClick={() => setView('mobile')} aria-label="Mobile view" className={`p-1.5 rounded-md transition-colors ${view === 'mobile' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-600'}`}><Icon name="mobile" className="w-5 h-5" /></button>
          </div>
           <button onClick={() => downloadHtml(currentDesign.html, currentDesign.name)} className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg shadow-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 bg-gray-600 hover:bg-gray-500 text-white focus:ring-gray-400"><Icon name="download" className="w-5 h-5" /><span className="hidden sm:inline">Скачать</span></button>
          <button onClick={handleCopyCode} className={`flex items-center justify-center gap-2 px-3 py-2 w-32 text-sm font-semibold rounded-lg shadow-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 ${isCopied ? 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500' : 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500'}`}><Icon name={isCopied ? 'check' : 'copy'} className="w-5 h-5" />{isCopied ? 'Скопировано!' : 'Копировать'}</button>
          <button onClick={onClose} aria-label="Закрыть предпросмотр" className="p-2 rounded-full text-gray-400 bg-gray-800 hover:bg-gray-700 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white"><Icon name="close" className="w-6 h-6" /></button>
        </div>
      </header>
      <main className={`${mainClasses} flex flex-col`}>
        <div className="flex-grow relative">
            {isIframeLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 text-gray-400 z-10">
                <Loader />
                <p className="mt-4">Подождите, страница загружается...</p>
            </div>
            )}
            <iframe
            key={currentDesign.html}
            srcDoc={currentDesign.html}
            title={currentDesign.name}
            onLoad={() => setIsIframeLoading(false)}
            className={`${isDesktop ? "w-full h-full border-none" : mobileIframeClasses} ${isDesktop ? '' : 'mx-auto'} bg-white transition-opacity duration-500 ${isIframeLoading ? 'opacity-0' : 'opacity-100'}`}
            sandbox="allow-scripts"
            />
        </div>
        <div className="flex-shrink-0 pt-4 mt-4 border-t border-gray-700">
            <div className="flex gap-4">
                <input 
                    type="text"
                    value={refinement}
                    onChange={(e) => setRefinement(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
                    placeholder="Например: 'Сделай кнопки круглыми' или 'Используй более теплую цветовую гамму'"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                />
                <button onClick={handleRefine} disabled={isRefining || !refinement.trim() || !apiKey} className="flex items-center justify-center gap-2 px-4 py-2 w-40 text-sm font-semibold rounded-lg shadow-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed">
                    {isRefining ? <Loader/> : <Icon name="rocket" className="w-5 h-5" />}
                    {isRefining ? 'Улучшаю...' : 'Улучшить'}
                </button>
            </div>
            {refineError && <p className="text-red-400 text-sm mt-2">{refineError}</p>}
        </div>
      </main>
    </div>
  );
};

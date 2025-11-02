import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';
import type { DesignVariation } from '../types';

interface FullScreenPreviewProps {
  design: DesignVariation;
  onClose: () => void;
}

export const FullScreenPreview: React.FC<FullScreenPreviewProps> = ({ design, onClose }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [view, setView] = useState<'desktop' | 'mobile'>('desktop');

  useEffect(() => {
    // Prevent background scrolling
    document.body.style.overflow = 'hidden';
    // Close on escape key press
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(design.html).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }).catch(err => {
      console.error('Failed to copy code: ', err);
      alert('Не удалось скопировать код.');
    });
  };

  const isDesktop = view === 'desktop';
  const mobileIframeClasses = "w-[375px] h-[812px] max-w-full max-h-full border-none bg-white rounded-xl shadow-2xl border-2 border-gray-600 transition-all duration-300";

  return (
    <div
      className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex flex-col p-4 sm:p-6 lg:p-8 transition-opacity duration-300"
      aria-modal="true"
      role="dialog"
    >
      <header className="flex-shrink-0 flex items-center justify-between pb-4 mb-4 border-b border-gray-700">
        <h2 className="text-xl sm:text-2xl font-bold text-white">{design.name}</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-gray-700/50 p-1 rounded-md">
            <button
              onClick={() => setView('desktop')}
              aria-label="Desktop view"
              className={`p-1.5 rounded-md transition-colors ${view === 'desktop' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-600'}`}
            >
              <Icon name="desktop" className="w-5 h-5" />
            </button>
            <button
              onClick={() => setView('mobile')}
              aria-label="Mobile view"
              className={`p-1.5 rounded-md transition-colors ${view === 'mobile' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-600'}`}
            >
              <Icon name="mobile" className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={handleCopyCode}
            className={`flex items-center justify-center gap-2 px-4 py-2 w-36 text-sm font-semibold rounded-lg shadow-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 ${
              isCopied
                ? 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500'
            }`}
          >
            <Icon name={isCopied ? 'check' : 'copy'} className="w-5 h-5" />
            {isCopied ? 'Скопировано!' : 'Копировать код'}
          </button>
          <button
            onClick={onClose}
            aria-label="Закрыть предпросмотр"
            className="p-2 rounded-full text-gray-400 bg-gray-800 hover:bg-gray-700 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white"
          >
            <Icon name="close" className="w-6 h-6" />
          </button>
        </div>
      </header>
      <main className={isDesktop ? "flex-grow bg-white rounded-lg overflow-hidden" : "flex-grow flex justify-center items-center py-4"}>
        <iframe
          srcDoc={design.html}
          title={design.name}
          className={isDesktop ? "w-full h-full border-none" : mobileIframeClasses}
          sandbox="allow-scripts"
        />
      </main>
    </div>
  );
};
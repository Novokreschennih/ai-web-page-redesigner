import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';
import { Loader } from './Loader';
import type { DesignVariation } from '../types';
import { downloadHtml } from '../services/geminiService';

interface AppliedPreviewProps {
  design: DesignVariation;
  referenceHtml: string;
  targetHtml: string;
  onRegenerate: () => void;
  isRegenerating: boolean;
}

interface PreviewPaneProps {
  title: string;
  htmlContent: string;
}

const PreviewPane: React.FC<PreviewPaneProps> = ({ title, htmlContent }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
  }, [htmlContent]);
  
  return (
    <div className="flex flex-col bg-gray-800 p-3 rounded-lg border border-gray-700/70 h-full">
      <h4 className="text-sm font-semibold text-indigo-300 mb-3 text-center flex-shrink-0">{title}</h4>
      <div className="flex-grow bg-gray-900 rounded-md overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-xs">
            Загрузка...
          </div>
        )}
        <iframe
          srcDoc={htmlContent}
          title={title}
          onLoad={() => setIsLoading(false)}
          className={`w-full h-full border-none bg-white transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          sandbox="allow-scripts"
        />
      </div>
    </div>
  );
};


export const AppliedPreview: React.FC<AppliedPreviewProps> = ({ design, referenceHtml, targetHtml, onRegenerate, isRegenerating }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(design.html).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }).catch(err => {
      console.error('Failed to copy code: ', err);
      alert('Не удалось скопировать код.');
    });
  };

  return (
    <div className="w-full h-full flex flex-col">
      <header className="flex-shrink-0 flex items-center justify-between pb-4 mb-4 border-b border-gray-700">
        <h3 className="text-lg font-bold text-white">{design.name}</h3>
        <div className="flex items-center gap-4">
          <button
            onClick={() => downloadHtml(design.html, design.name)}
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg shadow-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 bg-gray-600 hover:bg-gray-500 text-white focus:ring-gray-400"
          >
             <Icon name="download" className="w-5 h-5" />
             Скачать
          </button>
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
        </div>
      </header>
      <main className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-4">
        <PreviewPane title="Эталонный Дизайн" htmlContent={referenceHtml} />
        <PreviewPane title="Целевая Страница (Оригинал)" htmlContent={targetHtml} />
        <PreviewPane title="Результат" htmlContent={design.html} />
      </main>
    </div>
  );
};

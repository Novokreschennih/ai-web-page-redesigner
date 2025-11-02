import React, { useState } from 'react';
import { Icon } from './Icon';
import { Loader } from './Loader';
import type { DesignVariation } from '../types';

interface AppliedPreviewProps {
  design: DesignVariation;
  onRegenerate: () => void;
  isRegenerating: boolean;
}

export const AppliedPreview: React.FC<AppliedPreviewProps> = ({ design, onRegenerate, isRegenerating }) => {
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
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg shadow-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 bg-gray-600 hover:bg-gray-500 text-white focus:ring-gray-400 disabled:bg-gray-500 disabled:cursor-not-allowed w-36"
          >
            {isRegenerating ? <Loader /> : <Icon name="wand" className="w-5 h-5" />}
            {isRegenerating ? 'В работе...' : 'Перегенерировать'}
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
      <main className="flex-grow bg-white rounded-lg overflow-hidden">
        <iframe
          srcDoc={design.html}
          title={design.name}
          className="w-full h-full border-none"
          sandbox="allow-scripts"
        />
      </main>
    </div>
  );
};
import React, { useState } from 'react';
import { Icon } from './Icon';

interface PreviewCardProps {
  title: string;
  htmlContent: string;
  onClick: () => void;
}

export const PreviewCard: React.FC<PreviewCardProps> = ({ title, htmlContent, onClick }) => {
  const [view, setView] = useState<'desktop' | 'mobile'>('desktop');

  const isDesktop = view === 'desktop';
  const paddingTop = isDesktop ? '75%' : '177.77%'; // 4:3 vs 9:16 portrait
  const scale = isDesktop ? 0.25 : 0.6;
  const iframeStyle = {
    width: `${100 / scale}%`,
    height: `${100 / scale}%`,
    transform: `scale(${scale})`,
  };

  return (
    <div
      onClick={onClick}
      className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700/70 cursor-pointer group transition-all duration-300 hover:border-indigo-500 hover:shadow-indigo-500/20 hover:-translate-y-1 flex flex-col"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
    >
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <h3 className="font-semibold text-lg text-indigo-300 transition-colors group-hover:text-indigo-200 flex-grow pr-2">{title}</h3>
        <div className="flex items-center gap-1 bg-gray-700/50 p-1 rounded-md" onClick={(e) => e.stopPropagation()}>
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
      </div>
      <div className="w-full bg-gray-900 rounded-md overflow-hidden pointer-events-none">
        <div className="w-full relative transition-all duration-300" style={{ paddingTop }}>
           <iframe
            srcDoc={htmlContent}
            title={title}
            className="absolute top-0 left-0 border-none bg-white transform origin-top-left"
            style={iframeStyle}
            sandbox="allow-scripts"
          />
        </div>
      </div>
    </div>
  );
};
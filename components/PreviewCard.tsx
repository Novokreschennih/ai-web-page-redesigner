import React from 'react';

interface PreviewCardProps {
  title: string;
  htmlContent: string;
  onClick: () => void;
}

export const PreviewCard: React.FC<PreviewCardProps> = ({ title, htmlContent, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700/70 cursor-pointer group transition-all duration-300 hover:border-indigo-500 hover:shadow-indigo-500/20 hover:-translate-y-1 flex flex-col"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
    >
      <h3 className="font-semibold text-lg mb-4 text-indigo-300 transition-colors group-hover:text-indigo-200 flex-shrink-0">{title}</h3>
      <div className="flex-grow w-full bg-gray-900 rounded-md overflow-hidden pointer-events-none flex items-center justify-center">
        <div className="w-[1280px] h-[960px] transform scale-[0.25] sm:scale-[0.3] md:scale-[0.35] lg:scale-[0.25] xl:scale-[0.22] 2xl:scale-[0.28]">
           <iframe
            srcDoc={htmlContent}
            title={title}
            className="w-full h-full border-none bg-white"
            sandbox="allow-scripts"
          />
        </div>
      </div>
    </div>
  );
};
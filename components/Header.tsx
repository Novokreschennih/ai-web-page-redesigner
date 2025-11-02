
import React from 'react';
import { Icon } from './Icon';

export const Header: React.FC = () => {
  return (
    <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-10">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon name="logo" className="w-8 h-8 text-indigo-400" />
          <h1 className="text-2xl font-bold tracking-tight text-white">
            AI Web Page Redesigner
          </h1>
        </div>
      </div>
    </header>
  );
};

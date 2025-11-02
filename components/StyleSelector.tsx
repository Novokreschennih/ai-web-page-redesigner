
import React from 'react';
import { DESIGN_STYLES } from '../constants';
import { Icon } from './Icon';

interface StyleSelectorProps {
  selectedStyle: string;
  onStyleChange: (style: string) => void;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({ selectedStyle, onStyleChange }) => {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="styleSelector" className="font-medium text-gray-400">
        Choose a Design Style
      </label>
      <div className="relative">
        <select
          id="styleSelector"
          value={selectedStyle}
          onChange={(e) => onStyleChange(e.target.value)}
          className="w-full appearance-none bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
        >
          {DESIGN_STYLES.map((style) => (
            <option key={style} value={style}>
              {style}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
          <Icon name="chevron-down" />
        </div>
      </div>
    </div>
  );
};

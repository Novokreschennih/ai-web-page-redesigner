
import React from 'react';

interface CodeInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const CodeInput: React.FC<CodeInputProps> = ({ value, onChange }) => {
  return (
    <div className="flex flex-col gap-2 h-full">
      <label htmlFor="codeInput" className="font-medium text-gray-400">
        Paste Your HTML Code
      </label>
      <textarea
        id="codeInput"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="<!DOCTYPE html>..."
        className="w-full h-full flex-grow p-4 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 min-h-[250px] lg:min-h-0 resize-y"
      />
    </div>
  );
};

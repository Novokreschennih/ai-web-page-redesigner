import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { CodeInput } from './components/CodeInput';
import { StyleSelector } from './components/StyleSelector';
import { PreviewCard } from './components/PreviewCard';
import { FullScreenPreview } from './components/FullScreenPreview';
import { Loader } from './components/Loader';
import { Icon } from './components/Icon';
import { generateDesigns } from './services/geminiService';
import { DESIGN_STYLES, INITIAL_CODE } from './constants';
import type { DesignVariation } from './types';

const App: React.FC = () => {
  const [code, setCode] = useState<string>(INITIAL_CODE);
  const [style, setStyle] = useState<string>(DESIGN_STYLES[0]);
  const [generatedDesigns, setGeneratedDesigns] = useState<DesignVariation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDesign, setSelectedDesign] = useState<DesignVariation | null>(null);

  const handleGenerateClick = useCallback(async () => {
    if (!code.trim()) {
      setError("Please provide some HTML code.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedDesigns([]);

    try {
      const designs = await generateDesigns(code, style);
      setGeneratedDesigns(designs);
    } catch (err) {
      console.error(err);
      setError("Failed to generate designs. The model might be overloaded. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [code, style]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-1/3 xl:w-1/4 flex flex-col gap-6">
          <h2 className="text-xl font-bold text-gray-300">Controls</h2>
          <StyleSelector selectedStyle={style} onStyleChange={setStyle} />
          <CodeInput value={code} onChange={setCode} />
          <button
            onClick={handleGenerateClick}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500"
          >
            {isLoading ? (
              <>
                <Loader />
                Generating...
              </>
            ) : (
              <>
                <Icon name="sparkles" />
                Generate Designs
              </>
            )}
          </button>
        </aside>

        <section className="w-full lg:w-2/3 xl:w-3/4 flex-1 flex flex-col">
          <h2 className="text-xl font-bold text-gray-300 mb-6">Generated Previews</h2>
          <div className="flex-grow p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 min-h-[60vh]">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full">
                <Loader />
                <p className="mt-4 text-gray-400">AI is redesigning your page...</p>
                <p className="text-sm text-gray-500">This may take a moment.</p>
              </div>
            )}
            {error && (
              <div className="flex flex-col items-center justify-center h-full text-center text-red-400">
                <Icon name="error" className="w-12 h-12 mb-4" />
                <p className="font-semibold">An Error Occurred</p>
                <p className="text-sm">{error}</p>
              </div>
            )}
            {!isLoading && !error && generatedDesigns.length === 0 && (
               <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                 <Icon name="palette" className="w-16 h-16 mb-4" />
                 <p className="font-semibold text-lg">Your new designs will appear here</p>
                 <p>Paste your HTML, choose a style, and click 'Generate'.</p>
               </div>
            )}
            {generatedDesigns.length > 0 && (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full">
                {generatedDesigns.map((design, index) => (
                  <PreviewCard
                    key={index}
                    title={design.name || `Variation ${index + 1}`}
                    htmlContent={design.html}
                    onClick={() => setSelectedDesign(design)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {selectedDesign && (
        <FullScreenPreview
          design={selectedDesign}
          onClose={() => setSelectedDesign(null)}
        />
      )}
    </div>
  );
};

export default App;
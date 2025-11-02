import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { CodeInput } from './components/CodeInput';
import { StyleSelector } from './components/StyleSelector';
import { PreviewCard } from './components/PreviewCard';
import { FullScreenPreview } from './components/FullScreenPreview';
import { Loader } from './components/Loader';
import { Icon } from './components/Icon';
import { AppliedPreview } from './components/AppliedPreview';
import { generateDesigns, applyDesign } from './services/geminiService';
import { DESIGN_STYLES, INITIAL_CODE, INITIAL_TARGET_CODE } from './constants';
import type { DesignVariation } from './types';

type Tab = 'redesign' | 'apply';

const App: React.FC = () => {
  const [code, setCode] = useState<string>(INITIAL_CODE);
  const [targetCode, setTargetCode] = useState<string>(INITIAL_TARGET_CODE);
  const [style, setStyle] = useState<string>(DESIGN_STYLES[0]);
  const [generatedDesigns, setGeneratedDesigns] = useState<DesignVariation[]>([]);
  const [appliedDesign, setAppliedDesign] = useState<DesignVariation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDesign, setSelectedDesign] = useState<DesignVariation | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('redesign');

  const handleGenerateClick = useCallback(async () => {
    if (!code.trim()) {
      setError("Пожалуйста, вставьте HTML-код.");
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
      setError("Не удалось сгенерировать дизайны. Модель может быть перегружена. Пожалуйста, попробуйте еще раз.");
    } finally {
      setIsLoading(false);
    }
  }, [code, style]);
  
  const handleApplyDesignClick = useCallback(async () => {
    if (!code.trim() || !targetCode.trim()) {
      setError("Пожалуйста, предоставьте HTML-код для эталона и для цели.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setAppliedDesign(null);

    try {
      const design = await applyDesign(code, targetCode);
      setAppliedDesign(design);
    } catch (err) {
      console.error(err);
      setError("Не удалось применить дизайн. Пожалуйста, попробуйте еще раз.");
    } finally {
      setIsLoading(false);
    }
  }, [code, targetCode]);

  const handlePrimaryAction = () => {
    if (activeTab === 'redesign') {
      handleGenerateClick();
    } else {
      handleApplyDesignClick();
    }
  };

  const primaryButtonText = activeTab === 'redesign' ? 'Сгенерировать Дизайны' : 'Применить Дизайн';
  const primaryButtonIcon = activeTab === 'redesign' ? 'sparkles' : 'wand';

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-1/3 xl:w-1/4 flex flex-col gap-6">
          <div className="flex border-b border-gray-700">
            <button 
              onClick={() => setActiveTab('redesign')}
              className={`px-4 py-3 font-semibold text-sm w-1/2 rounded-t-lg transition-colors ${activeTab === 'redesign' ? 'bg-gray-800 text-white border-b-2 border-indigo-500' : 'text-gray-400 hover:bg-gray-800/50'}`}
            >
              Редизайн Страницы
            </button>
            <button 
              onClick={() => setActiveTab('apply')}
              className={`px-4 py-3 font-semibold text-sm w-1/2 rounded-t-lg transition-colors ${activeTab === 'apply' ? 'bg-gray-800 text-white border-b-2 border-indigo-500' : 'text-gray-400 hover:bg-gray-800/50'}`}
            >
              Применить Дизайн
            </button>
          </div>

          {activeTab === 'redesign' ? (
            <>
              <h2 className="text-xl font-bold text-gray-300">Управление</h2>
              <StyleSelector selectedStyle={style} onStyleChange={setStyle} />
              <CodeInput label="Вставьте ваш HTML-код" id="sourceCode" value={code} onChange={setCode} />
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-300">Входные данные</h2>
              <CodeInput label="HTML эталонного дизайна" id="referenceCode" value={code} onChange={setCode} />
              <CodeInput label="HTML целевой страницы" id="targetCode" value={targetCode} onChange={setTargetCode} />
            </>
          )}

          <button
            onClick={handlePrimaryAction}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500"
          >
            {isLoading ? (
              <>
                <Loader />
                Обработка...
              </>
            ) : (
              <>
                <Icon name={primaryButtonIcon} />
                {primaryButtonText}
              </>
            )}
          </button>
        </aside>

        <section className="w-full lg:w-2/3 xl:w-3/4 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-300">
              {activeTab === 'redesign' ? 'Сгенерированные превью' : 'Превью примененного дизайна'}
            </h2>
            {activeTab === 'redesign' && !isLoading && generatedDesigns.length > 0 && (
              <button
                onClick={handleGenerateClick}
                className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg shadow-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 bg-gray-600 hover:bg-gray-500 text-white focus:ring-gray-400"
              >
                <Icon name="refresh" className="w-5 h-5" />
                Перегенерировать
              </button>
            )}
          </div>
          <div className="flex-grow p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 min-h-[60vh]">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full">
                <Loader />
                <p className="mt-4 text-gray-400">ИИ творит свою магию...</p>
                <p className="text-sm text-gray-500">Это может занять некоторое время.</p>
              </div>
            )}
            {error && (
              <div className="flex flex-col items-center justify-center h-full text-center text-red-400">
                <Icon name="error" className="w-12 h-12 mb-4" />
                <p className="font-semibold">Произошла ошибка</p>
                <p className="text-sm">{error}</p>
              </div>
            )}
            
            {activeTab === 'redesign' && !isLoading && !error && (
              <>
                {generatedDesigns.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                    <Icon name="palette" className="w-16 h-16 mb-4" />
                    <p className="font-semibold text-lg">Ваши новые дизайны появятся здесь</p>
                    <p>Вставьте HTML, выберите стиль и нажмите 'Сгенерировать'.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full">
                    {generatedDesigns.map((design, index) => (
                      <PreviewCard
                        key={index}
                        title={design.name || `Вариант ${index + 1}`}
                        htmlContent={design.html}
                        onClick={() => setSelectedDesign(design)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === 'apply' && !isLoading && !error && (
              <>
                {!appliedDesign ? (
                   <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                     <Icon name="wand" className="w-16 h-16 mb-4" />
                     <p className="font-semibold text-lg">Результат появится здесь</p>
                     <p>Предоставьте эталонный дизайн и целевую страницу, затем нажмите 'Применить Дизайн'.</p>
                   </div>
                ) : (
                  <AppliedPreview 
                    design={appliedDesign}
                    onRegenerate={handleApplyDesignClick}
                    isRegenerating={isLoading}
                  />
                )}
              </>
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
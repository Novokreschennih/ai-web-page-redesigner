import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { CodeInput } from './components/CodeInput';
import { StyleSelector } from './components/StyleSelector';
import { PreviewCard } from './components/PreviewCard';
import { FullScreenPreview } from './components/FullScreenPreview';
import { Loader } from './components/Loader';
import { Icon } from './components/Icon';
import { AppliedPreview } from './components/AppliedPreview';
import { generateSingleDesign, applyDesign } from './services/geminiService';
import { DESIGN_STYLES, INITIAL_CODE, INITIAL_TARGET_CODE, GEMINI_MODELS } from './constants';
import type { DesignVariation, GeminiModel, HistoryItem } from './types';

type Tab = 'redesign' | 'apply';
type AsideTab = 'controls' | 'history';

// INLINED COMPONENT: ModelSelector
const ModelSelector: React.FC<{ selectedModel: GeminiModel; onModelChange: (model: GeminiModel) => void; }> = ({ selectedModel, onModelChange }) => (
  <div className="flex flex-col gap-2">
    <label htmlFor="modelSelector" className="font-medium text-gray-400">Модель ИИ</label>
    <div className="relative">
      <select id="modelSelector" value={selectedModel} onChange={(e) => onModelChange(e.target.value as GeminiModel)} className="w-full appearance-none bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200">
        {GEMINI_MODELS.map((model) => <option key={model} value={model}>{model}</option>)}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400"><Icon name="chevron-down" /></div>
    </div>
  </div>
);

// INLINED COMPONENT: HistoryPanel
const HistoryPanel: React.FC<{ history: HistoryItem[], onRestore: (item: HistoryItem) => void }> = ({ history, onRestore }) => (
  <div className="flex flex-col gap-4">
    <h2 className="text-xl font-bold text-gray-300">История</h2>
    {history.length === 0 ? (
      <p className="text-gray-500 text-sm">Ваши предыдущие генерации появятся здесь.</p>
    ) : (
      <ul className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
        {history.map(item => (
          <li key={item.id}>
            <button onClick={() => onRestore(item)} className="w-full text-left p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:bg-gray-700/70 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <p className="font-semibold text-indigo-300">{item.style}</p>
              <p className="text-xs text-gray-400">{new Date(item.timestamp).toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Модель: {item.model}</p>
            </button>
          </li>
        ))}
      </ul>
    )}
  </div>
);


const App: React.FC = () => {
  const [code, setCode] = useState<string>(INITIAL_CODE);
  const [targetCode, setTargetCode] = useState<string>(INITIAL_TARGET_CODE);
  const [style, setStyle] = useState<string>(DESIGN_STYLES[0]);
  const [selectedModel, setSelectedModel] = useState<GeminiModel>(GEMINI_MODELS[0]);
  const [generatedDesigns, setGeneratedDesigns] = useState<DesignVariation[]>([]);
  const [appliedDesign, setAppliedDesign] = useState<DesignVariation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDesign, setSelectedDesign] = useState<DesignVariation | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('redesign');
  const [asideTab, setAsideTab] = useState<AsideTab>('controls');
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('designHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Failed to load history from localStorage", e);
      setHistory([]);
    }
  }, []);

  const saveHistory = (newHistory: HistoryItem[]) => {
    try {
      localStorage.setItem('designHistory', JSON.stringify(newHistory));
    } catch (e) {
      console.error("Failed to save history to localStorage", e);
    }
  };

  const handleGenerateClick = useCallback(async () => {
    if (!code.trim()) {
      setError("Пожалуйста, вставьте HTML-код.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedDesigns([]);

    const designPromises = [1, 2, 3].map(i => generateSingleDesign(code, style, i, selectedModel));
    
    const successfulDesigns: DesignVariation[] = [];

    designPromises.forEach(promise => {
      promise.then(design => {
        setGeneratedDesigns(prev => [...prev, design].sort((a,b) => a.name.localeCompare(b.name)));
        successfulDesigns.push(design);
      }).catch(err => {
         console.error("A design generation failed:", err);
      });
    });

    const results = await Promise.allSettled(designPromises);

    setIsLoading(false);

    const failedCount = results.filter(r => r.status === 'rejected').length;
    if (failedCount > 0) {
      setError(`Не удалось сгенерировать ${failedCount} из 3 дизайнов. Попробуйте снова.`);
    }

    if (successfulDesigns.length > 0) {
      const newHistoryItem: HistoryItem = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        originalCode: code,
        style: style,
        model: selectedModel,
        designs: successfulDesigns.sort((a, b) => a.name.localeCompare(b.name)),
      };
      const updatedHistory = [newHistoryItem, ...history].slice(0, 20); // Keep last 20
      setHistory(updatedHistory);
      saveHistory(updatedHistory);
    }
  }, [code, style, selectedModel, history]);
  
  const handleApplyDesignClick = useCallback(async () => {
    if (!code.trim() || !targetCode.trim()) {
      setError("Пожалуйста, предоставьте HTML-код для эталона и для цели.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setAppliedDesign(null);

    try {
      const design = await applyDesign(code, targetCode, selectedModel);
      setAppliedDesign(design);
    } catch (err) {
      console.error(err);
      setError("Не удалось применить дизайн. Пожалуйста, попробуйте еще раз.");
    } finally {
      setIsLoading(false);
    }
  }, [code, targetCode, selectedModel]);

  const handlePrimaryAction = () => {
    if (activeTab === 'redesign') {
      handleGenerateClick();
    } else {
      handleApplyDesignClick();
    }
  };

  const handleRestoreHistory = (item: HistoryItem) => {
    setCode(item.originalCode);
    setStyle(item.style);
    setSelectedModel(item.model);
    setGeneratedDesigns(item.designs);
    setActiveTab('redesign');
    setAsideTab('controls');
    setError(null);
  };

  const primaryButtonText = activeTab === 'redesign' ? 'Сгенерировать Дизайны' : 'Применить Дизайн';
  const primaryButtonIcon = activeTab === 'redesign' ? 'sparkles' : 'wand';

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-1/3 xl:w-1/4 flex flex-col gap-6">
          <div className="flex border-b border-gray-700">
            <button onClick={() => setActiveTab('redesign')} className={`px-4 py-3 font-semibold text-sm w-1/2 rounded-t-lg transition-colors ${activeTab === 'redesign' ? 'bg-gray-800 text-white border-b-2 border-indigo-500' : 'text-gray-400 hover:bg-gray-800/50'}`}>Редизайн Страницы</button>
            <button onClick={() => setActiveTab('apply')} className={`px-4 py-3 font-semibold text-sm w-1/2 rounded-t-lg transition-colors ${activeTab === 'apply' ? 'bg-gray-800 text-white border-b-2 border-indigo-500' : 'text-gray-400 hover:bg-gray-800/50'}`}>Применить Дизайн</button>
          </div>
          
          {activeTab === 'redesign' && (
            <div className="flex border-b border-gray-700">
              <button onClick={() => setAsideTab('controls')} className={`px-4 py-2 font-medium text-xs w-1/2 transition-colors ${asideTab === 'controls' ? 'text-white' : 'text-gray-400 hover:text-white'}`}><Icon name="palette" className="w-4 h-4 mr-2 inline-block"/>Управление</button>
              <button onClick={() => setAsideTab('history')} className={`px-4 py-2 font-medium text-xs w-1/2 transition-colors ${asideTab === 'history' ? 'text-white' : 'text-gray-400 hover:text-white'}`}><Icon name="history" className="w-4 h-4 mr-2 inline-block"/>История</button>
            </div>
          )}

          {asideTab === 'controls' ? (
            <>
              {activeTab === 'redesign' ? (
                <>
                  <h2 className="text-xl font-bold text-gray-300">Управление</h2>
                  <ModelSelector selectedModel={selectedModel} onModelChange={setSelectedModel} />
                  <StyleSelector selectedStyle={style} onStyleChange={setStyle} />
                  <CodeInput label="Вставьте ваш HTML-код" id="sourceCode" value={code} onChange={setCode} />
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-gray-300">Входные данные</h2>
                  <ModelSelector selectedModel={selectedModel} onModelChange={setSelectedModel} />
                  <CodeInput label="HTML эталонного дизайна" id="referenceCode" value={code} onChange={setCode} />
                  <CodeInput label="HTML целевой страницы" id="targetCode" value={targetCode} onChange={setTargetCode} />
                </>
              )}
               <button onClick={handlePrimaryAction} disabled={isLoading} className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500">
                {isLoading ? (<><Loader />Обработка...</>) : (<><Icon name={primaryButtonIcon} />{primaryButtonText}</>)}
              </button>
            </>
          ) : (
            <HistoryPanel history={history} onRestore={handleRestoreHistory} />
          )}
        </aside>

        <section className="w-full lg:w-2/3 xl:w-3/4 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-300">{activeTab === 'redesign' ? 'Сгенерированные превью' : 'Превью примененного дизайна'}</h2>
            {activeTab === 'redesign' && !isLoading && generatedDesigns.length > 0 && (
              <button onClick={handleGenerateClick} className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg shadow-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 bg-gray-600 hover:bg-gray-500 text-white focus:ring-gray-400"><Icon name="refresh" className="w-5 h-5" />Перегенерировать</button>
            )}
          </div>
          <div className="flex-grow p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 min-h-[60vh]">
            {isLoading && generatedDesigns.length === 0 && !appliedDesign && (
              <div className="flex flex-col items-center justify-center h-full"><Loader /><p className="mt-4 text-gray-400">ИИ творит свою магию...</p><p className="text-sm text-gray-500">Это может занять некоторое время.</p></div>
            )}
            {error && (<div className="flex flex-col items-center justify-center h-full text-center text-red-400"><Icon name="error" className="w-12 h-12 mb-4" /><p className="font-semibold">Произошла ошибка</p><p className="text-sm">{error}</p></div>)}
            
            {activeTab === 'redesign' && !error && (
              <>
                {(generatedDesigns.length === 0 && !isLoading) ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-gray-500"><Icon name="palette" className="w-16 h-16 mb-4" /><p className="font-semibold text-lg">Ваши новые дизайны появятся здесь</p><p>Вставьте HTML, выберите стиль и нажмите 'Сгенерировать'.</p></div>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full">
                    {generatedDesigns.map((design, index) => (<PreviewCard key={index} title={design.name} htmlContent={design.html} onClick={() => setSelectedDesign(design)}/>))}
                    {isLoading && generatedDesigns.length < 3 && Array.from({ length: 3 - generatedDesigns.length }).map((_, i) => (
                      <div key={i} className="bg-gray-800 p-4 rounded-lg border border-gray-700/70 flex flex-col items-center justify-center"><Loader /><p className="mt-2 text-sm text-gray-400">Генерация...</p></div>
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === 'apply' && !isLoading && !error && (
              <>
                {!appliedDesign ? (
                   <div className="flex flex-col items-center justify-center h-full text-center text-gray-500"><Icon name="wand" className="w-16 h-16 mb-4" /><p className="font-semibold text-lg">Результат появится здесь</p><p>Предоставьте эталонный дизайн и целевую страницу, затем нажмите 'Применить Дизайн'.</p></div>
                ) : (
                  <AppliedPreview design={appliedDesign} referenceHtml={code} targetHtml={targetCode} onRegenerate={handleApplyDesignClick} isRegenerating={isLoading}/>
                )}
              </>
            )}

          </div>
        </section>
      </main>

      {selectedDesign && (
        <FullScreenPreview design={selectedDesign} onClose={() => setSelectedDesign(null)} model={selectedModel}/>
      )}
    </div>
  );
};

export default App;

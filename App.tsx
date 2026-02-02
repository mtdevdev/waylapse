
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import RoutePlanner from './components/RoutePlanner';
import InlineMap from './components/InlineMap';
import SettingsPanel from './components/SettingsPanel';
import { AppState, RouteDetails, DEFAULT_CONFIG, MapConfig, Language } from './types';
import { translations } from './services/translations';

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.PLANNING);
  const [route, setRoute] = useState<RouteDetails | null>(null);
  const [mapConfig, setMapConfig] = useState<MapConfig>(DEFAULT_CONFIG);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Auto-detect language: if browser is any 'pt' variant, use 'pt-BR', otherwise default to 'en'
  const [language, setLanguage] = useState<Language>(() => {
      if (typeof navigator !== 'undefined' && navigator.language) {
          return navigator.language.toLowerCase().startsWith('pt') ? 'pt-BR' : 'en';
      }
      return 'en';
  });

  const t = translations[language];

  const handleRouteFound = (details: RouteDetails) => {
    setRoute(details);
    setAppState(AppState.VISUALIZING);
  };

  const handleReset = () => {
      setAppState(AppState.PLANNING);
      setRoute(null);
  };

  return (
    <div className="min-h-[100dvh] bg-black text-white relative overflow-hidden font-sans selection:bg-white/20">
      
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-neutral-900/50 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neutral-900/30 rounded-full blur-[100px] pointer-events-none" />

      {/* Global Settings Panel */}
      <SettingsPanel 
        config={mapConfig} 
        onChange={setMapConfig} 
        onReset={() => setMapConfig(DEFAULT_CONFIG)}
        onClose={() => setIsSettingsOpen(false)} 
        isOpen={isSettingsOpen} 
        t={t.settings}
      />

      {/* Language Toggle - Top Right (Visible only in Planning) */}
      <div className={`absolute top-6 right-6 z-50 flex items-center gap-2 transition-opacity duration-500 ${appState === AppState.PLANNING ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
         <button
            onClick={() => setLanguage('en')}
            className={`text-xs font-bold px-2 py-1 rounded transition-colors ${language === 'en' ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'}`}
         >
            EN
         </button>
         <div className="w-px h-3 bg-neutral-800"></div>
         <button
            onClick={() => setLanguage('pt-BR')}
             className={`text-xs font-bold px-2 py-1 rounded transition-colors ${language === 'pt-BR' ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'}`}
         >
            BR
         </button>
      </div>

      <main className="relative w-full h-[100dvh] flex flex-col">
        
        {/* Stage 1: Planning */}
        <div className={`flex-1 flex flex-col justify-center items-center p-6 transition-all duration-700 ease-in-out absolute inset-0 z-40 ${appState === AppState.VISUALIZING ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 scale-100'}`}>
            <div className="max-w-md w-full relative flex flex-col max-h-full">
                 <div className="mb-8 md:mb-12 text-center space-y-4 shrink-0">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-white">
                        {t.appTitle}
                    </h1>
                    <p className="text-sm text-neutral-500 max-w-xs mx-auto uppercase tracking-widest font-medium">
                        {t.appSubtitle}
                    </p>
                </div>
                
                <div className="flex-1 min-h-0 flex flex-col justify-center">
                    <RoutePlanner 
                        onRouteFound={handleRouteFound} 
                        appState={appState} 
                        onOpenSettings={() => setIsSettingsOpen(true)}
                        t={t.planner}
                        language={language}
                    />
                </div>
            </div>
        </div>

        {/* Stage 2: Visualizing */}
        <div className={`absolute inset-0 z-0 transition-opacity duration-1000 ${appState === AppState.VISUALIZING ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            {route && appState === AppState.VISUALIZING && (
                <InlineMap 
                    route={route} 
                    config={mapConfig} 
                    t={t.map}
                    language={language}
                />
            )}
        </div>

        {/* Consistent UI Controls Layer */}
        <div className="absolute inset-0 pointer-events-none z-50">
            {/* Back Button - Top Left (Only in Visualizing) */}
            {appState === AppState.VISUALIZING && (
                <div className="absolute top-4 left-4 md:top-6 md:left-6 animate-fade-in pointer-events-auto">
                    <button 
                        onClick={handleReset}
                        className="w-10 h-10 flex items-center justify-center bg-black/40 backdrop-blur-xl border border-white/10 rounded-full hover:bg-white hover:text-black transition-all group"
                    >
                        <ArrowLeft size={16} />
                    </button>
                </div>
            )}
        </div>

      </main>
    </div>
  );
}

export default App;


/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import RoutePlanner from './components/RoutePlanner';
import InlineMap from './components/InlineMap';
import SettingsPanel from './components/SettingsPanel';
import { AppState, RouteDetails, DEFAULT_CONFIG, MapConfig, Language, PointState } from './types';
import { translations } from './services/translations';
import { parseStateFromUrl } from './services/urlUtils';

// Helper to load only the user's persistent config from localStorage
const loadUserConfig = (): MapConfig => {
    let baseConfig = DEFAULT_CONFIG;
    try {
        const saved = localStorage.getItem('waylapse_config');
        if (saved) {
            baseConfig = { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
        }
    } catch (e) {
        console.warn('Failed to load config from storage:', e);
    }
    return baseConfig;
};

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.PLANNING);
  const [route, setRoute] = useState<RouteDetails | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // Shared state hydrated from URL
  const [initialStart, setInitialStart] = useState<PointState>();
  const [initialEnd, setInitialEnd] = useState<PointState>();

  // Track if current session is a shared session (loaded from URL)
  // We use a ref so we can update it immediately during init without re-renders, 
  // but we also need it for the useEffect dependency.
  const isSharedSessionRef = useRef(false);

  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Detect mobile device
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    setIsMobile(mobileRegex.test(navigator.userAgent));

    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };
  
  // Initialize config
  const [mapConfig, setMapConfig] = useState<MapConfig>(() => {
    // Start with user's saved config
    const userConfig = loadUserConfig();
    
    // Check URL params and merge immediately for the initial render
    const { configPartial, start } = parseStateFromUrl();
    
    // If we have URL params that imply a shared route (start point or specific config), merge them
    if (start || Object.keys(configPartial || {}).length > 0) {
        isSharedSessionRef.current = true;
        return { ...userConfig, ...configPartial };
    }
    return userConfig;
  });

  // Hydrate Points from URL on Mount
  useEffect(() => {
    const { start, end } = parseStateFromUrl();
    if (start) setInitialStart(start);
    if (end) setInitialEnd(end);
  }, []);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Persist config changes (Excluding Audio to save space)
  useEffect(() => {
    // CRITICAL: Do NOT save to localStorage if we are in a shared session.
    // This prevents the viewer's personal defaults from being overwritten by the shared route's settings.
    if (isSharedSessionRef.current) return;

    try {
        // Only save to localStorage if we are in PLANNING mode or if the change was explicitly made via settings
        // However, standard behavior is usually to save what you see. 
        // We exclude large data like audio urls if they are blobs
        const configToSave = {
            ...mapConfig,
            customAudioUrl: null, // Don't persist blobs or temp URLs
            customAudioName: null
        };
        localStorage.setItem('waylapse_config', JSON.stringify(configToSave));
    } catch (e) {
        console.warn('Failed to save config to storage:', e);
    }
  }, [mapConfig]);

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
      
      // Clear shared session flag
      isSharedSessionRef.current = false;

      // Remove URL parameters (Clear shared state)
      window.history.pushState({}, '', window.location.pathname);
      
      // Revert to user's saved config (ignoring the shared params that were previously merged)
      const userConfig = loadUserConfig();
      setMapConfig(userConfig);
      
      // Clear hydration points so the planner is empty for a fresh start
      setInitialStart(undefined);
      setInitialEnd(undefined);
  };

  return (
    <div className="min-h-[100dvh] bg-black text-white relative overflow-hidden font-sans selection:bg-white/20">
      
      {/* Micro-grain Texture Overlay */}
      <div className="fixed inset-0 z-[100] pointer-events-none opacity-[0.035] mix-blend-overlay bg-grain select-none"></div>

      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-neutral-900/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neutral-900/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Global Settings Panel */}
      <SettingsPanel 
        config={mapConfig} 
        onChange={setMapConfig} 
        onReset={() => setMapConfig(DEFAULT_CONFIG)}
        onClose={() => setIsSettingsOpen(false)} 
        isOpen={isSettingsOpen} 
        t={t.settings}
        onInstallApp={handleInstallApp}
        canInstall={!!deferredPrompt}
        isMobile={isMobile}
      />

      {/* Language Toggle - Top Right (Visible only in Planning) */}
      <div className={`absolute top-6 right-6 z-50 flex items-center gap-2 transition-opacity duration-500 ${appState === AppState.PLANNING ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
         <button
            onClick={() => setLanguage('en')}
            className={`text-[10px] font-bold px-2 py-1 rounded transition-colors tracking-wider ${language === 'en' ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'}`}
         >
            EN
         </button>
         <div className="w-px h-3 bg-neutral-800"></div>
         <button
            onClick={() => setLanguage('pt-BR')}
             className={`text-[10px] font-bold px-2 py-1 rounded transition-colors tracking-wider ${language === 'pt-BR' ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'}`}
         >
            BR
         </button>
      </div>

      <main className="relative w-full h-[100dvh] flex flex-col">
        
        {/* Stage 1: Planning */}
        <div className={`flex-1 flex flex-col justify-center items-center p-6 transition-all duration-700 ease-in-out absolute inset-0 z-40 ${appState === AppState.VISUALIZING ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 scale-100'}`}>
            <div className="max-w-2xl w-full relative flex flex-col max-h-full">
                 <div className="mb-8 md:mb-12 text-center space-y-4 shrink-0">
                    <h1 className="text-6xl md:text-8xl font-black font-montserrat tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-neutral-200 via-white to-neutral-200 animate-text-shimmer animate-slide-in-down drop-shadow-sm select-none pb-2 px-4" style={{ animationDelay: '0ms' }}>
                        {t.appTitle}
                    </h1>
                    <p className="text-xs md:text-sm text-neutral-500 max-w-xs mx-auto uppercase tracking-[0.2em] font-medium animate-slide-in-down" style={{ animationDelay: '100ms' }}>
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
                        initialStart={initialStart}
                        initialEnd={initialEnd}
                        config={mapConfig}
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
                        className="w-10 h-10 flex items-center justify-center bg-black/40 backdrop-blur-xl border border-white/10 rounded-full hover:bg-white hover:text-black hover:border-white transition-all group"
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

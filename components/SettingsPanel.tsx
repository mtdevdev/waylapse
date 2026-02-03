
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { X, RotateCw, Check, Zap, Target, Plane, ZoomOut, ZoomIn, Map, Video, Palette, Sliders, Layers, AtSign, Music, Upload, Users } from 'lucide-react';
import { MapConfig, COLOR_OPTIONS, AnimationType } from '../types';
import { Translation } from '../services/translations';

interface Props {
    config: MapConfig;
    onChange: (c: MapConfig) => void;
    onReset: () => void;
    onClose: () => void;
    isOpen: boolean;
    t: Translation['settings'];
}

// Extracted components to prevent re-mounting on parent render
const Section = ({ title, icon: Icon, children }: { title: string, icon: any, children?: React.ReactNode }) => (
    <div className="space-y-4">
         <div className="flex items-center gap-2 pb-2 border-b border-white/5">
            <Icon size={14} className="text-neutral-500" />
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">{title}</h3>
        </div>
        <div className="space-y-5">
            {children}
        </div>
    </div>
);

const ToggleRow = ({ label, checked, onChange, description, disabled = false }: { label: string, checked: boolean, onChange: (v: boolean) => void, description?: string, disabled?: boolean }) => (
    <div 
        className={`flex items-center justify-between cursor-pointer group select-none py-2 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
        onClick={() => !disabled && onChange(!checked)}
    >
        <div className="pr-4 flex-1">
            <span className="text-sm font-medium text-neutral-300 group-hover:text-white transition-colors block">{label}</span>
            {description && <p className="text-[10px] text-neutral-500 mt-0.5 leading-tight">{description}</p>}
        </div>
        
        {/* Refined Toggle Switch with Flex Alignment */}
        <div 
            className={`w-11 h-6 rounded-full transition-colors duration-300 ease-in-out shrink-0 border flex items-center ${
                checked 
                ? 'bg-white border-transparent' 
                : 'bg-neutral-800 border-neutral-700 group-hover:border-neutral-600'
            }`}
        >
            <div 
                className={`w-5 h-5 rounded-full shadow-sm transition-transform duration-300 cubic-bezier(0.4, 0.0, 0.2, 1) ml-0.5 ${
                    checked 
                    ? 'translate-x-[18px] bg-black' 
                    : 'translate-x-0 bg-neutral-400 group-hover:bg-neutral-300'
                }`} 
            />
        </div>
    </div>
);

type SettingsTab = 'MOTION' | 'STYLE' | 'SOCIAL';

const SettingsPanel: React.FC<Props> = ({ config, onChange, onReset, onClose, isOpen, t }) => {
    
    // Default to MOTION now that SOCIAL is last
    const [activeTab, setActiveTab] = useState<SettingsTab>('MOTION');

    const animationOptions: { id: AnimationType; label: string; icon: any; desc: string }[] = [
        { id: 'CINEMATIC', label: t.animations.cinematic.label, icon: Zap, desc: t.animations.cinematic.desc },
        { id: 'FOCUS', label: t.animations.focus.label, icon: Target, desc: t.animations.focus.desc },
        { id: 'GLIDE', label: t.animations.glide.label, icon: Plane, desc: t.animations.glide.desc },
        { id: 'TAKEOFF', label: t.animations.takeoff.label, icon: ZoomOut, desc: t.animations.takeoff.desc },
        { id: 'LANDING', label: t.animations.landing.label, icon: ZoomIn, desc: t.animations.landing.desc },
        { id: 'OVERVIEW', label: t.animations.static.label, icon: Map, desc: t.animations.static.desc },
    ];

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            // Remove file extension for cleaner display
            const cleanName = file.name.replace(/\.[^/.]+$/, "");
            onChange({ 
                ...config, 
                customAudioUrl: url, 
                customAudioName: cleanName, 
                musicEnabled: true 
            });
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            onChange({ ...config, userImage: url });
        }
    };

    return (
        <div 
            className={`fixed inset-0 z-[60] flex items-center justify-center md:p-6 transition-all duration-500 ${
                isOpen ? 'pointer-events-auto visible' : 'pointer-events-none invisible delay-200'
            }`}
        >
            {/* Backdrop */}
            <div 
                className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500 ease-out ${
                    isOpen ? 'opacity-100' : 'opacity-0'
                }`} 
                onClick={onClose}
            />
            
            {/* Panel */}
            <div 
                className={`
                    relative w-full h-[100dvh] md:w-[500px] md:h-auto md:max-h-[85vh] 
                    bg-neutral-900 border-l md:border border-white/10 shadow-2xl flex flex-col overflow-hidden md:rounded-2xl
                    transition-all duration-500 cubic-bezier(0.2, 0.8, 0.2, 1)
                    ${isOpen 
                        ? 'translate-x-0 translate-y-0 opacity-100 scale-100' 
                        : 'translate-x-[40px] md:translate-x-0 md:translate-y-[20px] opacity-0 scale-[0.96]'
                    }
                `}
            >
                
                {/* Header */}
                <div className="flex flex-col bg-neutral-900/95 backdrop-blur-xl shrink-0 z-10 border-b border-white/10">
                    <div className="flex items-center justify-between p-5 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/5 rounded-full border border-white/5 shadow-inner">
                                <Sliders size={16} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold uppercase tracking-widest text-white">{t.title}</h2>
                                <p className="text-[10px] text-neutral-400 font-medium">{t.subtitle}</p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="p-2 hover:bg-white/10 rounded-full transition-colors text-neutral-400 hover:text-white active:scale-95"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex px-5 pb-0 gap-6">
                        {[
                            { id: 'MOTION', label: t.tabs.motion },
                            { id: 'STYLE', label: t.tabs.style },
                            { id: 'SOCIAL', label: t.tabs.social },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as SettingsTab)}
                                className={`pb-3 text-[11px] font-bold uppercase tracking-widest border-b-2 transition-colors ${
                                    activeTab === tab.id 
                                    ? 'text-white border-white' 
                                    : 'text-neutral-500 border-transparent hover:text-neutral-300'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
                
                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 no-scrollbar overscroll-contain">
                    
                    {/* TAB: SOCIAL */}
                    {activeTab === 'SOCIAL' && (
                        <div className="space-y-8 animate-fade-in">
                            <Section title={t.socialFeatures} icon={Users}>
                                <div className="bg-neutral-800/30 rounded-xl border border-white/5 p-4 space-y-5">
                                    
                                    {/* Master Switch */}
                                    <div className="pb-4 border-b border-white/5">
                                        <ToggleRow 
                                            label={t.enableSocial} 
                                            description={t.enableSocialDesc}
                                            checked={config.socialEnabled} 
                                            onChange={(v) => onChange({...config, socialEnabled: v})} 
                                        />
                                    </div>

                                    {/* Sub-settings (Disabled if Master is OFF) */}
                                    <div className={`space-y-5 transition-opacity duration-300 ${config.socialEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                                        
                                        {/* Social Handle */}
                                        <div className="space-y-3">
                                             <div className="flex items-center gap-2 mb-2">
                                                <AtSign size={12} className="text-neutral-500" />
                                                <span className="text-xs font-medium text-neutral-400">{t.socialHandle}</span>
                                            </div>
                                            <input 
                                                type="text" 
                                                value={config.socialHandle}
                                                onChange={(e) => onChange({...config, socialHandle: e.target.value})}
                                                disabled={!config.socialEnabled}
                                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30 transition-all font-mono placeholder-neutral-700"
                                                placeholder="@username"
                                            />
                                        </div>

                                        {/* Profile Image */}
                                        <div className="space-y-3">
                                             <div className="flex items-center gap-2 mb-2">
                                                <Users size={12} className="text-neutral-500" />
                                                <span className="text-xs font-medium text-neutral-400">{t.profileImage}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                 <div className="w-10 h-10 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                                                    {config.userImage ? (
                                                        <img src={config.userImage} alt="Profile" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Users size={18} className="text-neutral-600" />
                                                    )}
                                                 </div>
                                                 <div className="flex-1 space-y-1">
                                                    <div className="relative group">
                                                        <input 
                                                            type="file" 
                                                            accept="image/*"
                                                            onChange={handleImageUpload}
                                                            disabled={!config.socialEnabled}
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                        />
                                                        <div className="w-full bg-black/40 border border-white/10 border-dashed rounded-lg px-3 py-2 text-xs text-neutral-400 group-hover:bg-white/5 group-hover:border-white/30 transition-all text-center">
                                                            {t.uploadImage}
                                                        </div>
                                                    </div>
                                                    {config.userImage && (
                                                        <button 
                                                            onClick={() => onChange({...config, userImage: null})}
                                                            className="text-[10px] text-red-400 hover:text-red-300 hover:underline block w-full text-right"
                                                        >
                                                            {t.resetImage}
                                                        </button>
                                                    )}
                                                 </div>
                                            </div>
                                        </div>

                                        <div className="h-px bg-white/5 w-full" />

                                        {/* Toggles */}
                                        <ToggleRow 
                                            label={t.showSocialOverlay}
                                            checked={config.showSocialOverlay} 
                                            onChange={(v) => onChange({...config, showSocialOverlay: v})}
                                            disabled={!config.socialEnabled}
                                        />
                                        
                                        <ToggleRow 
                                            label={t.showMusicOverlay}
                                            checked={config.showMusicOverlay} 
                                            onChange={(v) => onChange({...config, showMusicOverlay: v})}
                                            disabled={!config.socialEnabled}
                                        />

                                        <div className="h-px bg-white/5 w-full" />

                                        {/* Music Settings */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-neutral-400">
                                                <Music size={12} />
                                                <span className="text-xs font-bold uppercase tracking-widest">{t.audio}</span>
                                            </div>

                                            <ToggleRow 
                                                label={t.enableMusic} 
                                                checked={config.musicEnabled} 
                                                onChange={(v) => onChange({...config, musicEnabled: v})}
                                                disabled={!config.socialEnabled}
                                            />
                                            
                                            <div className={`transition-all duration-300 overflow-hidden ${config.musicEnabled && config.socialEnabled ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'}`}>
                                                <div className="space-y-3">
                                                    <div className="relative group">
                                                        <input 
                                                            type="file" 
                                                            accept="audio/*"
                                                            onChange={handleFileUpload}
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                        />
                                                        <div className="w-full bg-black/40 border border-white/10 border-dashed rounded-lg px-3 py-3 text-xs text-neutral-400 group-hover:bg-white/5 group-hover:border-white/30 transition-all truncate flex items-center gap-2">
                                                            <Upload size={12} className="shrink-0" />
                                                            {config.customAudioName || t.uploadPlaceholder}
                                                        </div>
                                                    </div>
                                                    {config.customAudioUrl && (
                                                        <button 
                                                            onClick={() => onChange({...config, customAudioUrl: null, customAudioName: null})}
                                                            className="text-[10px] text-red-400 hover:text-red-300 hover:underline"
                                                        >
                                                            {t.resetAudio}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </Section>
                        </div>
                    )}
                    
                    {/* TAB: MOTION (Camera, Intro, Duration) */}
                    {activeTab === 'MOTION' && (
                        <div className="space-y-8 animate-fade-in">
                            <Section title={t.cameraMotion} icon={Video}>
                                <div className="grid grid-cols-2 gap-2">
                                    {animationOptions.map((opt) => (
                                        <button
                                            key={opt.id}
                                            onClick={() => onChange({...config, animationType: opt.id})}
                                            className={`flex flex-col items-start gap-1 p-3 rounded-lg border transition-all duration-200 text-left active:scale-[0.98] ${
                                                config.animationType === opt.id
                                                    ? 'bg-white text-black border-white shadow-lg scale-[1.02] z-10'
                                                    : 'bg-black/20 border-white/5 text-neutral-400 hover:bg-white/5 hover:border-white/20 hover:text-white'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 w-full">
                                                <opt.icon size={14} className={config.animationType === opt.id ? 'text-black' : 'text-neutral-500'} />
                                                <span className="text-xs font-bold">{opt.label}</span>
                                            </div>
                                            <span className={`text-[9px] leading-tight mt-0.5 ${config.animationType === opt.id ? 'text-black/60' : 'text-neutral-600'}`}>{opt.desc}</span>
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-4 pt-4 px-1">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-medium text-neutral-300">{t.flightDuration}</span>
                                        <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded text-white min-w-[3rem] text-center border border-white/5">{config.duration}s</span>
                                    </div>
                                    <div className="relative w-full h-6 flex items-center">
                                        <input 
                                            type="range" min="10" max="120" step="5"
                                            value={config.duration}
                                            onChange={(e) => onChange({...config, duration: parseInt(e.target.value)})}
                                            className="w-full cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </Section>

                            <Section title={t.presentation} icon={Layers}>
                                <div className="bg-neutral-800/30 rounded-xl border border-white/5 p-4 space-y-5">
                                    {/* Intro */}
                                    <div className="space-y-4">
                                        <ToggleRow 
                                            label={t.introSequence} 
                                            description={t.introDescription}
                                            checked={config.showIntro} 
                                            onChange={(v) => onChange({...config, showIntro: v})} 
                                        />
                                        
                                        <div className={`transition-all duration-300 overflow-hidden ease-in-out ${config.showIntro ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
                                            <div className="bg-black/40 rounded-lg p-1 flex border border-white/5">
                                                {['SLOW', 'NORMAL', 'FAST'].map((speed) => (
                                                    <button
                                                        key={speed}
                                                        onClick={() => onChange({...config, introSpeed: speed as any})}
                                                        className={`flex-1 py-1.5 rounded-md text-[10px] font-bold transition-all ${
                                                            config.introSpeed === speed 
                                                            ? 'bg-white text-black shadow-sm' 
                                                            : 'text-neutral-500 hover:text-white hover:bg-white/5'
                                                        }`}
                                                    >
                                                        {speed === 'SLOW' ? t.speeds.slow : speed === 'FAST' ? t.speeds.fast : t.speeds.normal}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Section>
                        </div>
                    )}

                    {/* TAB: STYLE (Map, Color, Brightness, Stats) */}
                    {activeTab === 'STYLE' && (
                        <div className="space-y-8 animate-fade-in">
                             <Section title={t.mapStyle} icon={Palette}>
                                <div className="bg-neutral-800/30 rounded-xl border border-white/5 p-4 space-y-6">
                                    <ToggleRow 
                                        label={t.showMapTiles} 
                                        checked={config.showMap} 
                                        onChange={(v) => onChange({...config, showMap: v})} 
                                    />

                                    {/* Filters - Only visible if map is on */}
                                    <div className={`space-y-5 transition-all duration-500 ease-in-out ${config.showMap ? 'opacity-100 max-h-96' : 'opacity-30 max-h-0 overflow-hidden'}`}>
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                                                <span>{t.brightness}</span>
                                                <span>{(config.brightness * 100).toFixed(0)}%</span>
                                            </div>
                                            <div className="relative w-full h-6 flex items-center">
                                                <input 
                                                    type="range" min="0.5" max="2.0" step="0.1"
                                                    value={config.brightness}
                                                    onChange={(e) => onChange({...config, brightness: parseFloat(e.target.value)})}
                                                    className="w-full cursor-pointer"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                                                <span>{t.contrast}</span>
                                                <span>{(config.contrast * 100).toFixed(0)}%</span>
                                            </div>
                                            <div className="relative w-full h-6 flex items-center">
                                                <input 
                                                    type="range" min="0.5" max="2.0" step="0.1"
                                                    value={config.contrast}
                                                    onChange={(e) => onChange({...config, contrast: parseFloat(e.target.value)})}
                                                    className="w-full cursor-pointer"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="h-px bg-white/5 w-full" />

                                    {/* Route Style */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-xs font-medium text-neutral-300">
                                            <span>{t.routeWidth}</span>
                                            <span className="text-white/60">{config.lineWidth}px</span>
                                        </div>
                                        <div className="relative w-full h-6 flex items-center">
                                            <input 
                                                type="range" min="1" max="10" step="1"
                                                value={config.lineWidth}
                                                onChange={(e) => onChange({...config, lineWidth: parseInt(e.target.value)})}
                                                className="w-full cursor-pointer"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <span className="text-xs font-medium text-neutral-300">{t.routeColor}</span>
                                        <div className="flex gap-3">
                                            {COLOR_OPTIONS.map(color => (
                                                <button
                                                    key={color}
                                                    onClick={() => onChange({...config, lineColor: color})}
                                                    className={`w-9 h-9 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${config.lineColor === color ? 'border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'border-transparent hover:border-white/30 hover:scale-105'}`}
                                                    style={{ backgroundColor: color }}
                                                >
                                                    {config.lineColor === color && <Check size={16} className="text-black/60" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                     <div className="h-px bg-white/5 w-full" />

                                    {/* Stats */}
                                    <ToggleRow 
                                        label={t.statsOverlay} 
                                        description={t.statsDescription}
                                        checked={config.showStats} 
                                        onChange={(v) => onChange({...config, showStats: v})} 
                                    />
                                </div>
                            </Section>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-white/10 bg-neutral-900/95 backdrop-blur-md shrink-0 pb-safe z-10">
                    <button 
                        onClick={onReset}
                        className="w-full py-3 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg transition-all border border-transparent hover:border-white/10 active:scale-[0.98]"
                    >
                        <RotateCw size={14} />
                        {t.resetDefaults}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsPanel;

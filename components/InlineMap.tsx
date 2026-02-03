
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect, useRef, useState } from 'react';
import { RouteDetails, LocationLabel, MapConfig, Language } from '../types';
import * as L from 'leaflet';
import { computeLength, getPointAtDistance, formatDuration, formatDistance } from '../services/mapUtils';
import { Play, Pause, RotateCcw, MapPin, Clock, Route as RouteIcon, ArrowDown, Music, User, Video, Loader2 } from 'lucide-react';
import { Translation } from '../services/translations';

interface Props {
  route: RouteDetails;
  config: MapConfig;
  t: Translation['map'];
  language: Language;
}

enum IntroStage {
    NONE,
    INITIAL_OVERLAY,
    FOCUS_START,
    PAN_TO_DEST,
    HIGHLIGHT_DEST,
    STATS_CUT,
    FADE_OUT_STATS,
    COMPLETED
}

// Easing functions
const easeInOutCubic = (t: number): number => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const linear = (t: number): number => t;

// CountUp Component for statistical reveal
const CountUp = ({ value, duration = 2500, delay = 0 }: { value: string, duration?: number, delay?: number }) => {
    const [count, setCount] = useState(0);
    
    // Attempt to parse number at start of string
    const match = value.match(/^([\d.]+)(.*)$/);
    const target = match ? parseFloat(match[1]) : 0;
    const suffix = match ? match[2] : '';

    useEffect(() => {
        let startTimestamp: number | null = null;
        let frameId: number;
        let timeoutId: number;

        const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            setCount(easedProgress * target);
            if (progress < 1) {
                frameId = window.requestAnimationFrame(step);
            }
        };

        timeoutId = window.setTimeout(() => {
             frameId = window.requestAnimationFrame(step);
        }, delay);

        return () => {
            window.clearTimeout(timeoutId);
            window.cancelAnimationFrame(frameId);
        };
    }, [target, duration, delay]);

    return (
        <span className="font-mono tabular-nums">
            {target % 1 === 0 ? Math.floor(count) : count.toFixed(1)}
            <span className="text-sm ml-2 text-neutral-500 font-sans font-normal uppercase tracking-widest">{suffix.trim()}</span>
        </span>
    );
};

// Updated Label Creator - Destination label NO LONGER shows user info below it
const createLabelIcon = (label: LocationLabel, align: 'start' | 'end') => {
    let subtitleHtml = '';
    
    if (label.subtitle) {
        subtitleHtml = `<span class="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80 shadow-black drop-shadow-md whitespace-nowrap mb-0.5 bg-black/40 px-2 rounded-full backdrop-blur-[2px]">${label.subtitle}</span>`;
    }

    return L.divIcon({
        className: 'custom-label-icon transition-opacity duration-500',
        html: `
            <div class="flex flex-col items-center pointer-events-none transform -translate-y-full pb-4">
                ${subtitleHtml}
                <span class="text-lg md:text-xl font-bold text-white shadow-black drop-shadow-xl whitespace-nowrap px-3 py-1 bg-black/30 rounded-lg backdrop-blur-[2px] border border-white/5">${label.title}</span>
                <div class="h-6 w-px bg-gradient-to-b from-white/80 to-transparent mt-1"></div>
                <div class="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_white]"></div>
            </div>
        `,
        iconSize: [0, 0], 
        iconAnchor: [0, 0] 
    });
};

const InlineMap: React.FC<Props> = ({ route, config, t, language }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const configRef = useRef(config);

  // Layers
  const basePolylineRef = useRef<L.Polyline | null>(null);
  const activePolylineRef = useRef<L.Polyline | null>(null);
  const markerRef = useRef<L.CircleMarker | null>(null);
  const introLayersRef = useRef<L.LayerGroup>(L.layerGroup());
  const labelsLayerRef = useRef<L.LayerGroup>(L.layerGroup()); 

  // Intro State
  const [introStage, setIntroStage] = useState<IntroStage>(IntroStage.NONE);
  
  // Animation State
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const progressRef = useRef(0);

  // UI State for immersive mode
  const [showControls, setShowControls] = useState(true);
  const idleTimeoutRef = useRef<number | null>(null);
  
  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Hack to trigger full intro restart: Toggle a dummy state included in the useEffect dependency
  const [restartTrigger, setRestartTrigger] = useState(0);

  // Dynamic values
  const formattedDuration = formatDuration(route.durationSeconds, language);
  const formattedDistance = formatDistance(route.distanceMeters, language);

  // Determine which handle to use: Global Settings
  const displayHandle = config.socialHandle;

  // Sync Ref with prop
  useEffect(() => {
      configRef.current = config;
  }, [config]);

  // Derived state for audio to ensure it plays during intro OR route animation
  const isIntroActive = introStage !== IntroStage.NONE && introStage !== IntroStage.COMPLETED;
  const shouldPlayAudio = config.socialEnabled && config.musicEnabled && (isIntroActive || isPlaying);

  // Audio Playback Logic
  useEffect(() => {
      if (!audioRef.current) return;

      if (shouldPlayAudio) {
          if (audioRef.current.paused) {
              audioRef.current.play().catch(e => console.log("Audio play failed (interaction needed)", e));
          }
      } else {
          if (!audioRef.current.paused) {
              audioRef.current.pause();
          }
      }
  }, [shouldPlayAudio, config.musicEnabled, config.socialEnabled, config.customAudioUrl]);

  // Handle map visibility changes
  useEffect(() => {
      const map = mapInstanceRef.current;
      const tileLayer = tileLayerRef.current;
      
      if (!map || !tileLayer) return;

      if (config.showMap) {
          if (!map.hasLayer(tileLayer)) {
              tileLayer.addTo(map);
          }
      } else {
          if (map.hasLayer(tileLayer)) {
              tileLayer.remove();
          }
      }
  }, [config.showMap]);

  // Apply style updates that don't need restart
  useEffect(() => {
    if (activePolylineRef.current) {
        activePolylineRef.current.setStyle({ 
            weight: config.lineWidth,
            color: config.lineColor 
        });
    }
    if (markerRef.current) {
        markerRef.current.setStyle({
            fillColor: config.lineColor
        });
    }
  }, [config.lineWidth, config.lineColor]);


  // --- Initialize Map ---
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
            zoomControl: false,
            attributionControl: false,
            dragging: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            boxZoom: false,
            keyboard: false,
            zoomAnimation: true,
            fadeAnimation: true,
            inertia: true
        });

        const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 20,
            subdomains: 'abcd',
            opacity: 1,
            crossOrigin: 'anonymous' // Important for recording
        });
        
        tileLayerRef.current = tileLayer;

        if (configRef.current.showMap) {
            tileLayer.addTo(map);
        }

        mapInstanceRef.current = map;
        introLayersRef.current.addTo(map);
        labelsLayerRef.current.addTo(map);
    }

    return () => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
        }
    };
  }, []);

  // --- Intro Sequence Orchestration ---
  useEffect(() => {
    if (!route || !mapInstanceRef.current) return;
    
    const map = mapInstanceRef.current;
    const path = route.pathCoordinates;

    const runCinematicIntro = async () => {
        // RESET
        setIntroStage(IntroStage.NONE);
        setIsPlaying(false);
        progressRef.current = 0;
        if (progressBarRef.current) progressBarRef.current.style.width = '0%';
        
        startTimeRef.current = null;
        pausedTimeRef.current = 0;
        introLayersRef.current.clearLayers();
        labelsLayerRef.current.clearLayers(); 

        // Setup base path layers
        if (basePolylineRef.current) basePolylineRef.current.remove();
        if (activePolylineRef.current) activePolylineRef.current.remove();
        if (markerRef.current) markerRef.current.remove();

        basePolylineRef.current = L.polyline(path, {
            color: '#FFFFFF', 
            weight: 3,
            opacity: 0.1,
            smoothFactor: 1
        }).addTo(map);

        activePolylineRef.current = L.polyline([], {
            color: configRef.current.lineColor,
            weight: configRef.current.lineWidth,
            opacity: 1,
            lineCap: 'round',
            lineJoin: 'round',
        }).addTo(map);

        markerRef.current = L.circleMarker(path[0], {
            radius: 3,
            fillColor: configRef.current.lineColor,
            fillOpacity: 0,
            stroke: false
        }).addTo(map);

        // Check if intro is disabled in config
        if (!configRef.current.showIntro) {
             if (configRef.current.animationType === 'OVERVIEW') {
                 map.fitBounds(L.latLngBounds(path), { paddingTopLeft: [40, 40], paddingBottomRight: [40, 160], animate: false });
             } else {
                 const startZoom = configRef.current.animationType === 'FOCUS' ? 16 : 14;
                 map.setView(path[0], startZoom, { animate: false });
             }
             markerRef.current.setStyle({ fillOpacity: 1 });
             
             // Add labels immediately
             L.marker(path[0], { 
                icon: createLabelIcon(route.startLabel, 'start'),
                zIndexOffset: 1000
            }).addTo(labelsLayerRef.current);
            L.marker(path[path.length - 1], { 
                icon: createLabelIcon(route.endLabel, 'end'),
                zIndexOffset: 1000
            }).addTo(labelsLayerRef.current);

            setIntroStage(IntroStage.COMPLETED);
            setIsPlaying(true);
            
            // Auto hide controls start
            if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
            idleTimeoutRef.current = window.setTimeout(() => setShowControls(false), 2500);
            return;
        }

        // --- SEQUENCE START ---
        
        // Speed Multiplier logic
        // Slow = 1.5x slower, Fast = 0.6x faster (but wait times are adjusted to not clip)
        let speedMult = 1.0;
        if (configRef.current.introSpeed === 'FAST') speedMult = 0.6;
        if (configRef.current.introSpeed === 'SLOW') speedMult = 1.5;

        const delay = (ms: number) => new Promise(r => setTimeout(r, ms * speedMult));

        setIntroStage(IntroStage.INITIAL_OVERLAY);
        map.setView(path[0], 11, { animate: false });
        await delay(800);

        // Step 1: Focus Start
        setIntroStage(IntroStage.FOCUS_START);
        // Duration of flyTo scales with speedMult
        map.flyTo(path[0], 13, { duration: 2.5 * speedMult, easeLinearity: 0.2 });
        
        // Add Start Label
        L.marker(path[0], { 
            icon: createLabelIcon(route.startLabel, 'start'),
            zIndexOffset: 1000
        }).addTo(labelsLayerRef.current);

        const startIcon = L.divIcon({
            className: 'custom-intro-icon transition-opacity duration-1000',
            html: `
                <div class="relative flex items-center justify-center w-full h-full">
                    <div class="absolute w-8 h-8 bg-white/20 rounded-full animate-intro-pulse"></div>
                    <div class="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.9)]"></div>
                </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16] 
        });
        L.marker(path[0], { icon: startIcon }).addTo(introLayersRef.current);
        
        // Base delay increased to 2600 to ensure 2.5s animation completes even at fast speeds 
        // (logic: 2600 * 0.6 = 1560ms wait vs 2.5 * 0.6 = 1.5s animation)
        await delay(2600); 

        // Step 2: Pan to Dest
        setIntroStage(IntroStage.PAN_TO_DEST);
        map.flyTo(path[path.length - 1], 13, { duration: 4.0 * speedMult, easeLinearity: 0.1 });
        await delay(4200); // 4.2s wait for 4.0s animation

        // Step 3: Highlight Dest
        setIntroStage(IntroStage.HIGHLIGHT_DEST);
        map.flyTo(path[path.length - 1], 14.5, { duration: 1.5 * speedMult });
        
        // Add End Label
        L.marker(path[path.length - 1], { 
            icon: createLabelIcon(route.endLabel, 'end'),
            zIndexOffset: 1000
        }).addTo(labelsLayerRef.current);

        const endIcon = L.divIcon({
            className: 'custom-intro-icon transition-opacity duration-1000',
            html: `
                <div class="relative flex items-center justify-center w-full h-full">
                    <div class="absolute w-20 h-20 bg-white/15 rounded-full animate-intro-pulse-large"></div>
                    <div class="w-4 h-4 bg-white rounded-full shadow-[0_0_20px_white] border-2 border-black"></div>
                </div>
            `,
            iconSize: [60, 60],
            iconAnchor: [30, 30] 
        });
        L.marker(path[path.length - 1], { icon: endIcon }).addTo(introLayersRef.current);
        await delay(2000); // 2.0s wait for 1.5s animation

        setIntroStage(IntroStage.STATS_CUT);

        // Hide map labels to clear clutter for text overlay
        labelsLayerRef.current.eachLayer((layer) => {
             if (layer instanceof L.Marker) {
                 const el = layer.getElement();
                 if (el) el.style.opacity = '0';
             }
        });
        
        // Use flyToBounds for smoother, slower zoom out with BOTTOM PADDING
        map.flyToBounds(L.latLngBounds(path), { 
            paddingTopLeft: [40, 40],
            paddingBottomRight: [40, 160], // Extra padding for bottom controls
            animate: true, 
            duration: 3.5 * speedMult, // Increased duration for smoothness
            easeLinearity: 0.2
        });

        const statsDuration = configRef.current.showStats ? 8500 : 1500;
        await delay(statsDuration); 

        setIntroStage(IntroStage.FADE_OUT_STATS);
        
        introLayersRef.current.eachLayer((layer) => {
             if (layer instanceof L.Marker) {
                 const el = layer.getElement();
                 if (el) el.classList.add('opacity-0');
             }
        });

        // Hide trajectory and marker during the final zoom back to avoid artifacts
        if (basePolylineRef.current) basePolylineRef.current.setStyle({ opacity: 0 });
        if (markerRef.current) markerRef.current.setStyle({ fillOpacity: 0 });

        // Start zoom immediately to overlap with fade
        let zoomPromise: Promise<any> = Promise.resolve();
        
        if (configRef.current.animationType !== 'OVERVIEW') {
            const startZoom = configRef.current.animationType === 'FOCUS' ? 16 : 14;
            
            map.flyTo(path[0], startZoom, {
                duration: 2.0 * speedMult,
                easeLinearity: 0.2
            });
            zoomPromise = delay(2200);
        }

        // Wait for CSS opacity transition (1100ms)
        await new Promise(r => setTimeout(r, 1100));

        // Clear pulse icons
        introLayersRef.current.clearLayers();

        // Bring back map labels
        labelsLayerRef.current.eachLayer((layer) => {
             if (layer instanceof L.Marker) {
                 const el = layer.getElement();
                 if (el) el.style.opacity = '1';
             }
        });
        
        // Finish waiting for zoom
        await zoomPromise;

        // Restore trajectory and marker visibility just before animation starts
        if (basePolylineRef.current) basePolylineRef.current.setStyle({ opacity: 0.1 });
        if (markerRef.current) markerRef.current.setStyle({ fillOpacity: 1 });

        setIntroStage(IntroStage.COMPLETED);
        setIsPlaying(true);
        
        // Auto hide controls start
        if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
        idleTimeoutRef.current = window.setTimeout(() => setShowControls(false), 2500);
    };

    runCinematicIntro();
  }, [route, restartTrigger]); 

  // --- Main Animation Loop ---
  useEffect(() => {
    if (!route || !mapInstanceRef.current || introStage !== IntroStage.COMPLETED) return;
    
    if (!isPlaying) {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        // Check if we just finished recording and the animation stopped naturally
        if (isRecording && progressRef.current >= 1) {
            handleStopRecording();
        }
        return;
    }

    const map = mapInstanceRef.current;
    const path = route.pathCoordinates;
    const totalDist = computeLength(path);

    const animate = (timestamp: number) => {
        if (!startTimeRef.current) {
            startTimeRef.current = timestamp;
        }
        
        const durationMS = configRef.current.duration * 1000;

        let elapsed = timestamp - startTimeRef.current - pausedTimeRef.current;
        const rawProgress = Math.min(elapsed / durationMS, 1);
        const easedProgress = configRef.current.animationType === 'OVERVIEW' ? linear(rawProgress) : easeInOutCubic(rawProgress);
        
        progressRef.current = rawProgress;
        
        if (progressBarRef.current) {
            progressBarRef.current.style.width = `${rawProgress * 100}%`;
        }

        const currentDist = totalDist * easedProgress;
        const { point, index } = getPointAtDistance(path, currentDist);

        const visiblePath = path.slice(0, index + 1);
        if (point) visiblePath.push(point);

        activePolylineRef.current?.setLatLngs(visiblePath);
        markerRef.current?.setLatLng(point);

        updateCamera(map, point, configRef.current.animationType, rawProgress);

        if (rawProgress < 1) {
            animationRef.current = requestAnimationFrame(animate);
        } else {
            setIsPlaying(false);
            setShowControls(true);
            if (isRecording) {
                handleStopRecording();
            }
        }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, route, introStage, isRecording]);

  const updateCamera = (map: L.Map, point: [number, number], type: string, progress: number) => {
      switch (type) {
        case 'OVERVIEW': break;
        case 'FOCUS': map.setView(point, 16, { animate: false }); break;
        case 'GLIDE': map.setView(point, 14, { animate: false }); break;
        case 'TAKEOFF': map.setView(point, 16 - (progress * 6), { animate: false }); break;
        case 'LANDING': map.setView(point, 10 + (progress * 6), { animate: false }); break;
        case 'CINEMATIC': default:
            let targetZoom = 14;
            if (progress < 0.2) targetZoom = 15 - ((progress / 0.2) * 2);
            else if (progress > 0.8) targetZoom = 13 + (((progress - 0.8) / 0.2) * 3);
            else targetZoom = 13;
            map.setView(point, targetZoom, { animate: false });
            break;
    }
  };

  const handleInteraction = () => {
      // Don't show controls if recording and intro is active (keep it clean)
      if (isRecording) return;
      
      if (introStage !== IntroStage.COMPLETED) return;
      
      setShowControls(true);
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
      if (isPlaying) {
          idleTimeoutRef.current = window.setTimeout(() => setShowControls(false), 2500);
      }
  };

  const togglePlay = () => {
    if (isPlaying) {
        (window as any).pauseStart = performance.now();
        setIsPlaying(false);
        setShowControls(true);
        if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    } else {
        if (progressRef.current >= 1) {
            startTimeRef.current = null;
            pausedTimeRef.current = 0;
            progressRef.current = 0;
            if (progressBarRef.current) progressBarRef.current.style.width = '0%';
        } else {
            const now = performance.now();
            const pauseStart = (window as any).pauseStart || now;
            const durationPaused = now - pauseStart;
            pausedTimeRef.current += durationPaused;
        }
        setIsPlaying(true);
        idleTimeoutRef.current = window.setTimeout(() => setShowControls(false), 2500);
    }
  };

  const restart = () => {
      setIntroStage(IntroStage.NONE);
      setIsPlaying(false);
      progressRef.current = 0;
      if (progressBarRef.current) progressBarRef.current.style.width = '0%';
      startTimeRef.current = null;
      pausedTimeRef.current = 0;
      introLayersRef.current.clearLayers();
      labelsLayerRef.current.clearLayers();
      
      const map = mapInstanceRef.current;
      const path = route.pathCoordinates;

      if (!map) return;

      if (basePolylineRef.current) basePolylineRef.current.remove();
      if (activePolylineRef.current) activePolylineRef.current.remove();
      if (markerRef.current) markerRef.current.remove();

      basePolylineRef.current = L.polyline(path, { color: '#FFFFFF', weight: 3, opacity: 0.1, smoothFactor: 1 }).addTo(map);
      activePolylineRef.current = L.polyline([], { 
          color: configRef.current.lineColor, 
          weight: configRef.current.lineWidth, 
          opacity: 1, 
          lineCap: 'round', 
          lineJoin: 'round' 
        }).addTo(map);
      markerRef.current = L.circleMarker(path[0], { 
          radius: 3, 
          fillColor: configRef.current.lineColor, 
          fillOpacity: 0, 
          stroke: false 
        }).addTo(map);

      // Reset sequence logic
      setIntroStage(IntroStage.COMPLETED);
      
      if (configRef.current.animationType === 'OVERVIEW') {
          map.fitBounds(L.latLngBounds(path), { paddingTopLeft: [40, 40], paddingBottomRight: [40, 160], animate: false });
      } else {
          const startZoom = configRef.current.animationType === 'FOCUS' ? 16 : 14;
          map.setView(path[0], startZoom, { animate: false });
      }

      markerRef.current.setStyle({ fillOpacity: 1 });
      L.marker(path[0], { icon: createLabelIcon(route.startLabel, 'start'), zIndexOffset: 1000 }).addTo(labelsLayerRef.current);
      L.marker(path[path.length - 1], { icon: createLabelIcon(route.endLabel, 'end'), zIndexOffset: 1000 }).addTo(labelsLayerRef.current);
      
      setIsPlaying(true);
      // Auto hide controls start
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
      idleTimeoutRef.current = window.setTimeout(() => setShowControls(false), 2500);
  };

  const handleStartRecording = async () => {
      try {
          const stream = await navigator.mediaDevices.getDisplayMedia({
              video: {
                  displaySurface: "browser",
              },
              audio: true, // Attempt to capture system audio for music sync
              selfBrowserSurface: "include",
              preferCurrentTab: true, 
          } as any);

          const mimeType = 'video/webm;codecs=vp9';
          const options = MediaRecorder.isTypeSupported(mimeType) ? { mimeType } : { mimeType: 'video/webm' };
          
          const mediaRecorder = new MediaRecorder(stream, options);
          mediaRecorderRef.current = mediaRecorder;
          recordedChunksRef.current = [];

          mediaRecorder.ondataavailable = (event) => {
              if (event.data.size > 0) {
                  recordedChunksRef.current.push(event.data);
              }
          };

          mediaRecorder.onstop = () => {
              const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              document.body.appendChild(a);
              a.style.display = 'none';
              a.href = url;
              a.download = `waylapse_${new Date().getTime()}.webm`;
              a.click();
              window.URL.revokeObjectURL(url);
              
              // Stop all tracks to clear the browser "sharing" indicator
              stream.getTracks().forEach(track => track.stop());
              
              setIsRecording(false);
              setShowControls(true);
          };

          mediaRecorder.start();
          setIsRecording(true);
          setShowControls(false); // Hide controls immediately

          // If Intro is enabled, force full restart including cinematic sequence
          if (config.showIntro) {
              setRestartTrigger(prev => prev + 1);
          } else {
              restart();
          }

      } catch (err) {
          console.error("Error starting screen record:", err);
          setIsRecording(false);
          setShowControls(true);
      }
  };
  
  const handleStopRecording = () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
      }
  };
  
  // Wrapper for Start that triggers restart
  const handleExport = async () => {
      await handleStartRecording();
  };

  return (
    <div 
        className={`w-full h-full relative bg-black overflow-hidden ${isRecording ? 'cursor-none' : ''}`}
        onMouseMove={handleInteraction}
        onTouchStart={handleInteraction}
        onClick={handleInteraction}
    >
        {/* Hidden Audio Player */}
        {config.musicEnabled && config.socialEnabled && (
            <audio 
                ref={audioRef} 
                src={config.customAudioUrl || undefined}
                loop 
                className="hidden" 
            />
        )}

        {/* Map Wrapper with Static Filters */}
        <div 
            className="w-full h-full absolute inset-0 z-0"
            style={{ 
                filter: `brightness(${config.brightness}) contrast(${config.contrast})`
            }}
        >
            {/* Map Container - No dynamic class filters to ensure stability */}
            <div 
                ref={mapContainerRef} 
                className="w-full h-full outline-none" 
                style={{ backgroundColor: '#000000' }}
            />
        </div>

        {/* --- Social Overlay Elements (Visible ONLY during Intro) --- */}
        {introStage !== IntroStage.NONE && config.socialEnabled && (
            <div className={`absolute inset-0 z-20 pointer-events-none transition-opacity duration-1000 ${introStage < IntroStage.FADE_OUT_STATS ? 'opacity-100' : 'opacity-0'}`}>
                
                {/* 1. MUSIC TICKER - Bottom Right */}
                {config.musicEnabled && config.showMusicOverlay && (
                    <div className={`absolute bottom-4 right-4 scale-90 origin-bottom-right md:bottom-6 md:right-8 md:scale-100 flex items-center gap-2 animate-slide-in-right ${introStage < IntroStage.FADE_OUT_STATS ? 'pointer-events-auto' : 'pointer-events-none'}`}>
                         <div className="bg-black/30 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg max-w-[160px] md:max-w-[200px] overflow-hidden">
                            <Music size={12} className="text-white shrink-0 animate-pulse" />
                            <div className="text-[10px] font-medium text-white whitespace-nowrap overflow-hidden">
                                 <div className="animate-marquee inline-block">
                                    {config.customAudioUrl 
                                        ? `${config.customAudioName || t.customAudio} • ${t.playingNow}` 
                                        : t.noAudio
                                    }
                                 </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. Social Sticker - Bottom Left */}
                {displayHandle && config.showSocialOverlay && (
                     <div className={`absolute bottom-4 left-4 scale-90 origin-bottom-left md:bottom-6 md:left-8 md:scale-100 flex flex-col items-start gap-2 animate-slide-in-right ${introStage < IntroStage.FADE_OUT_STATS ? 'pointer-events-auto' : 'pointer-events-none'}`}>
                        <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-3 pr-5 rounded-2xl flex items-center gap-3 shadow-2xl hover:bg-black/60 transition-colors">
                            <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center border border-white/10 shadow-inner overflow-hidden">
                                {config.userImage ? (
                                    <img src={config.userImage} alt="User" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={20} className="text-white/80" />
                                )}
                            </div>
                            <div className={`flex flex-col ${!displayHandle ? 'hidden' : ''}`}>
                                <div className="text-[10px] text-white/60 font-medium uppercase tracking-wider mb-0.5">{t.traveling}</div>
                                <div className="text-sm font-bold text-white flex items-center gap-1.5">
                                    @{displayHandle}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )}
        
        {/* Intro Overlay System */}
        <div className={`absolute inset-0 z-10 pointer-events-none transition-all duration-1000 
            ${(introStage >= IntroStage.INITIAL_OVERLAY && introStage < IntroStage.HIGHLIGHT_DEST) ? 'bg-black/40' : 
              introStage === IntroStage.HIGHLIGHT_DEST ? 'bg-transparent' : 
              (introStage === IntroStage.STATS_CUT || introStage === IntroStage.FADE_OUT_STATS) ? 'bg-black/90' : 'bg-transparent'}
        `} />

        {/* Cinematic Data Display Stage (Origin + Destination) */}
        {(introStage === IntroStage.STATS_CUT || introStage === IntroStage.FADE_OUT_STATS) && config.showStats && (
            <div className={`absolute inset-0 z-40 flex items-center justify-center p-6 text-center pointer-events-none transition-opacity duration-1000 ${introStage === IntroStage.FADE_OUT_STATS ? 'opacity-0' : 'opacity-100'}`}>
                <div className="max-w-lg w-full flex flex-col items-center">
                    <div className="space-y-2 animate-slide-in-down" style={{animationDelay: '300ms'}}>
                         <div className="text-[10px] text-neutral-500 uppercase tracking-[0.4em] font-bold">{t.origin}</div>
                         <div className="flex flex-col items-center">
                            {route.startLabel.subtitle && (
                                <span className="text-sm text-neutral-400 font-medium">{route.startLabel.subtitle}</span>
                            )}
                            <h2 className="text-xl md:text-2xl font-bold text-white/90 tracking-tight">{route.startLabel.title}</h2>
                         </div>
                    </div>
                    
                    <div className="py-8 flex flex-col items-center justify-center opacity-0 animate-reveal-arrow" style={{animationDelay: '1400ms'}}>
                        <div className="h-8 w-px bg-gradient-to-b from-transparent via-white/50 to-transparent"></div>
                        <ArrowDown size={20} className="text-white mt-1 animate-bounce-subtle" />
                    </div>

                    <div className="space-y-3 animate-slide-in-up opacity-0" style={{animationDelay: '2200ms', animationFillMode: 'forwards'}}>
                        <div className="text-[10px] text-neutral-500 uppercase tracking-[0.4em] font-bold">{t.arrival}</div>
                        <div className="flex flex-col items-center">
                             <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight">{route.endLabel.title}</h2>
                             {/* Added Subtitle Display for Arrival */}
                             {route.endLabel.subtitle && (
                                <span className="text-sm md:text-base text-neutral-400 font-medium mt-1">{route.endLabel.subtitle}</span>
                             )}
                        </div>
                    </div>

                    <div className="w-full mt-12 mb-4 relative">
                         <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px bg-white/10 animate-expand-width" style={{animationDelay: '3400ms'}}></div>

                        <div className="grid grid-cols-2 gap-12 py-8 opacity-0 animate-fade-in-up" style={{animationDelay: '3800ms', animationFillMode: 'forwards'}}>
                            <div className="space-y-2">
                                 <div className="flex items-center justify-center gap-2 text-neutral-500">
                                    <Clock size={16} />
                                    <span className="text-[11px] uppercase tracking-[0.2em] font-bold">{t.time}</span>
                                 </div>
                                 <div className="text-4xl font-bold text-white">
                                    <CountUp value={formattedDuration} delay={4200} />
                                 </div>
                            </div>
                            <div className="space-y-2">
                                 <div className="flex items-center justify-center gap-2 text-neutral-500">
                                    <RouteIcon size={16} />
                                    <span className="text-[11px] uppercase tracking-[0.2em] font-bold">{t.distance}</span>
                                 </div>
                                 <div className="text-4xl font-bold text-white">
                                    <CountUp value={formattedDistance} delay={4200} />
                                 </div>
                            </div>
                        </div>

                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px bg-white/10 animate-expand-width" style={{animationDelay: '3400ms'}}></div>
                    </div>

                    <div className="text-[11px] text-neutral-600 uppercase tracking-widest animate-pulse opacity-0 animate-fade-in-delayed" style={{animationDelay: '6000ms'}}>
                        {t.initializing}
                    </div>
                </div>
            </div>
        )}

        {/* Persistent Route Summary (Main View) - Top Right */}
        {introStage === IntroStage.COMPLETED && config.showStats && (
             <div className="absolute top-4 right-4 md:top-6 md:right-6 z-20 pointer-events-none animate-fade-in">
                <div className="bg-black/60 backdrop-blur-md border border-white/10 p-5 rounded-2xl flex flex-col gap-4 min-w-[280px] max-w-[340px] shadow-2xl scale-90 origin-top-right md:scale-100">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <MapPin size={14} className="text-white" />
                            <div className="text-[10px] text-neutral-400 uppercase tracking-[0.2em] font-bold">{t.destination}</div>
                        </div>
                        <div className="text-xl font-bold text-white leading-tight">{route.endLabel.title}</div>
                        {route.endLabel.subtitle && (
                            <div className="text-sm text-neutral-400 mt-1 truncate">{route.endLabel.subtitle}</div>
                        )}
                    </div>
                    <div className="h-px w-full bg-white/10" />
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Clock size={12} className="text-neutral-500" />
                                <div className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">{t.duration}</div>
                            </div>
                            <div className="text-sm font-mono text-white/90">{formattedDuration}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <RouteIcon size={12} className="text-neutral-500" />
                                <div className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">{t.distance}</div>
                            </div>
                            <div className="text-sm font-mono text-white/90">{formattedDistance}</div>
                        </div>
                    </div>
                </div>
            </div>
        )}
        
        {/* Recording Indicator */}
        {isRecording && (
             <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 animate-pulse flex items-center gap-2 bg-red-500/80 text-white px-3 py-1 rounded-full backdrop-blur">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-[10px] font-bold uppercase tracking-widest">RECORDING</span>
             </div>
        )}

        {/* Playback Controls - Bottom Center */}
        {introStage === IntroStage.COMPLETED && (
            <div className={`absolute bottom-8 md:bottom-12 left-0 right-0 z-20 flex flex-col items-center gap-6 md:gap-8 px-6 pointer-events-none pb-[env(safe-area-inset-bottom)] transition-all duration-700 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                <div className="flex items-center gap-6 pointer-events-auto">
                    <button 
                        onClick={handleExport}
                        title={t.exportTip}
                        className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-black/40 text-white border border-white/10 hover:bg-black/80 transition-all backdrop-blur-xl group relative"
                    >
                        <Video size={18} />
                    </button>
                    
                    <button 
                        onClick={togglePlay}
                        className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-full bg-white text-black hover:scale-105 transition-transform active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.4)]"
                    >
                        {isPlaying && progressRef.current < 1 ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                    </button>
                    <button 
                        onClick={restart}
                        className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-black/40 text-white border border-white/10 hover:bg-black/80 transition-all backdrop-blur-xl"
                    >
                        <RotateCcw size={18} />
                    </button>
                </div>
                
                <div className="w-full max-w-md h-1.5 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                    <div 
                        ref={progressBarRef}
                        className="h-full bg-white shadow-[0_0_20px_rgba(255,255,255,1)]"
                        style={{ width: '0%' }}
                    ></div>
                </div>
            </div>
        )}

        <style dangerouslySetInnerHTML={{ __html: `
            @keyframes intro-pulse {
                0% { transform: scale(1); opacity: 0.6; }
                100% { transform: scale(2.0); opacity: 0; }
            }
            @keyframes intro-pulse-large {
                0% { transform: scale(1); opacity: 0.5; }
                100% { transform: scale(2.5); opacity: 0; }
            }
            .animate-intro-pulse { animation: intro-pulse 2s infinite cubic-bezier(0, 0, 0.2, 1); }
            .animate-intro-pulse-large { animation: intro-pulse-large 2.5s infinite cubic-bezier(0, 0, 0.2, 1); }
            
            @keyframes slideInDown {
                from { opacity: 0; transform: translateY(-20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            @keyframes slideInUp {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            @keyframes expandWidth {
                from { width: 0%; opacity: 0; }
                to { width: 100%; opacity: 1; }
            }
             @keyframes revealArrow {
                from { opacity: 0; transform: scaleY(0); }
                to { opacity: 1; transform: scaleY(1); }
            }
            @keyframes slideInRight {
                from { opacity: 0; transform: translateX(20px); }
                to { opacity: 1; transform: translateX(0); }
            }
            @keyframes marquee {
                0% { transform: translateX(100%); }
                100% { transform: translateX(-100%); }
            }
            
            .animate-slide-in-down { animation: slideInDown 1.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; opacity: 0; }
            .animate-slide-in-up { animation: slideInUp 1.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; opacity: 0; }
            .animate-expand-width { animation: expandWidth 1.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; opacity: 0; }
            .animate-reveal-arrow { animation: revealArrow 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; opacity: 0; transform-origin: top; }
            .animate-slide-in-right { animation: slideInRight 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
            .animate-marquee { animation: marquee 10s linear infinite; }
            
            .animate-fade-in-up { animation: slideInUp 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; opacity: 0; }
            .animate-fade-in-delayed { animation: fadeIn 1.5s ease-out forwards; opacity: 0; }
            
            .animate-bounce-subtle { animation: bounce 3s infinite; }
            @keyframes bounce {
              0%, 100% { transform: translateY(-10%); animation-timing-function: cubic-bezier(0.8,0,1,1); }
              50% { transform: translateY(0); animation-timing-function: cubic-bezier(0,0,0.2,1); }
            }
            
            .animate-fade-in { animation: fadeIn 1.5s ease-out forwards; }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

            .leaflet-container { transition: filter 2s ease, transform 2s ease, opacity 2s ease; }
            .custom-intro-icon { background: none !important; border: none !important; }
            .custom-label-icon { background: none !important; border: none !important; }
        ` }} />
    </div>
  );
};

export default InlineMap;

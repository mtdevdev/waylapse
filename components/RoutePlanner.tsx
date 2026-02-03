
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Navigation, Loader2, PlayCircle, X, AlertCircle, Settings } from 'lucide-react';
import { RouteDetails, AppState, LocationLabel, Language } from '../types';
import { searchLocation, getRouteData, formatDistance, formatDuration, NominatimResult } from '../services/mapUtils';
import { Translation } from '../services/translations';

interface Props {
  onRouteFound: (details: RouteDetails) => void;
  appState: AppState;
  onOpenSettings: () => void;
  t: Translation['planner'];
  language: Language;
}

interface PointState {
    name: string;
    lat: number;
    lon: number;
    label: LocationLabel;
}

const extractLabel = (result: NominatimResult): LocationLabel => {
    const a = result.address;
    
    // Priority for "Title" (City-level)
    const city = a.city || a.town || a.village || a.municipality || a.county || a.state || "Unknown Location";

    // Priority for "Subtitle" (Specific place/structure)
    // Check specific fields that Nominatim returns for POIs
    const specificCandidates = [
        a.amenity, a.building, a.shop, a.tourism, a.leisure, 
        a.office, a.emergency, a.historic, a.railway, a.aeroway
    ];
    let specific = specificCandidates.find(c => c) || "";

    // If no specific POI type found, check road/street
    if (!specific && a.road) {
        specific = a.road;
    }

    // Fallback: If no specific field found, but the display name starts with something distinct from the city
    if (!specific) {
        const firstPart = result.display_name.split(',')[0].trim();
        if (firstPart !== city) {
            specific = firstPart;
        }
    }

    // If specific name equals city, clear subtitle to avoid redundancy
    if (specific === city) specific = "";

    return {
        title: city,
        subtitle: specific
    };
};

const LocationInput = ({ 
    icon: Icon, 
    placeholder, 
    onSelect, 
    disabled,
    autoFocus,
    t
}: { 
    icon: any, 
    placeholder: string, 
    onSelect: (val: PointState | null) => void,
    disabled: boolean,
    autoFocus?: boolean,
    t: Translation['planner']
}) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [noResults, setNoResults] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const hasSelectedRef = useRef(false);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        // Debounce search
        const timer = setTimeout(async () => {
            if (query.length > 2 && showSuggestions && !hasSelectedRef.current) {
                setIsLoading(true);
                setNoResults(false);
                try {
                    const results = await searchLocation(query);
                    setSuggestions(results);
                    if (results.length === 0) {
                        setNoResults(true);
                    }
                } catch (e) {
                    setSuggestions([]);
                    setNoResults(true);
                } finally {
                    setIsLoading(false);
                }
            } else {
                if (query.length <= 2) setNoResults(false);
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [query, showSuggestions]);

    const handleSelect = (s: NominatimResult) => {
        hasSelectedRef.current = true;
        
        // Use display name for input box, but extract formatted label for app logic
        setQuery(s.display_name);
        setShowSuggestions(false);
        setNoResults(false);
        
        const label = extractLabel(s);
        
        onSelect({ 
            name: s.display_name, 
            lat: parseFloat(s.lat), 
            lon: parseFloat(s.lon),
            label
        });
    };

    const handleClear = () => {
        setQuery('');
        setSuggestions([]);
        setNoResults(false);
        hasSelectedRef.current = false;
        onSelect(null);
    };

    const handleBlur = () => {
        setTimeout(async () => {
            if (hasSelectedRef.current) return;

            if (query.length > 2) {
                let results = suggestions;
                if (results.length === 0) {
                    try {
                        results = await searchLocation(query);
                    } catch (e) {
                        results = [];
                    }
                }

                if (results.length > 0) {
                    handleSelect(results[0]);
                } else {
                    handleClear();
                }
            } else if (query.length > 0) {
                handleClear();
            }
        }, 200);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        e.target.select(); 
        setShowSuggestions(true);
        hasSelectedRef.current = false;
    };

    const zIndexClass = showSuggestions ? 'z-50' : 'z-20';

    return (
        <div ref={wrapperRef} className={`relative group w-full ${zIndexClass}`}>
            <div className="relative h-12 md:h-14 bg-neutral-900/80 border border-white/5 focus-within:border-white/20 focus-within:bg-neutral-900 rounded-lg transition-all overflow-hidden flex items-center">
                <Icon className="absolute left-4 text-neutral-500 group-focus-within:text-white transition-colors pointer-events-none shrink-0" size={18} />
                <input
                    type="text"
                    value={query}
                    autoFocus={autoFocus}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        hasSelectedRef.current = false;
                        setNoResults(false);
                        setShowSuggestions(true);
                    }}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    disabled={disabled}
                    className="w-full h-full bg-transparent p-0 pl-12 pr-10 text-white placeholder-neutral-600 outline-none font-medium text-sm truncate tracking-wide"
                />
                
                <div className="absolute right-3 flex items-center gap-2">
                    {query && !isLoading && !disabled && (
                        <button 
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={handleClear}
                            className="p-1 rounded-full text-neutral-500 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    )}
                    {isLoading && <Loader2 className="animate-spin text-neutral-600 shrink-0" size={14} />}
                </div>
            </div>
            
            {showSuggestions && (suggestions.length > 0 || (noResults && !isLoading)) && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-neutral-900 rounded-lg shadow-2xl border border-white/10 overflow-hidden z-[60] max-h-[40vh] overflow-y-auto">
                    {suggestions.length > 0 ? (
                        suggestions.map((s) => (
                            <button
                                key={s.place_id}
                                onMouseDown={() => handleSelect(s)}
                                className="w-full text-left px-4 py-3 hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors"
                            >
                                <p className="text-sm font-medium text-neutral-200 line-clamp-1">{s.display_name.split(',')[0]}</p>
                                <p className="text-[10px] text-neutral-500 line-clamp-1 mt-0.5">{s.display_name}</p>
                            </button>
                        ))
                    ) : (
                        <div className="p-4 text-center">
                            <AlertCircle className="mx-auto text-neutral-500 mb-2" size={18} />
                            <p className="text-sm text-neutral-400 font-medium">{t.noLocationsFound}</p>
                            <p className="text-[10px] text-neutral-600 mt-1">{t.tryDifferentSearch}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const RoutePlanner: React.FC<Props> = ({ onRouteFound, appState, onOpenSettings, t, language }) => {
  const [startPoint, setStartPoint] = useState<PointState | null>(null);
  const [endPoint, setEndPoint] = useState<PointState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCalculate = async () => {
    if (!startPoint || !endPoint) {
      setError(t.errorSelectPoints);
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
        const routeData = await getRouteData(
            [startPoint.lat, startPoint.lon], 
            [endPoint.lat, endPoint.lon], 
            'driving'
        );

        onRouteFound({
            startAddress: startPoint.name.split(',')[0],
            endAddress: endPoint.name.split(',')[0],
            startLabel: startPoint.label,
            endLabel: endPoint.label,
            distance: formatDistance(routeData.distance, language),
            distanceMeters: routeData.distance,
            duration: formatDuration(routeData.duration, language),
            durationSeconds: routeData.duration,
            travelMode: 'DRIVING',
            pathCoordinates: routeData.coordinates,
        });

    } catch (e) {
        console.error(e);
        setError(t.errorCalculation);
    } finally {
        setIsLoading(false);
    }
  };

  const isLocked = appState === AppState.VISUALIZING;

  return (
    <div className={`transition-all duration-700 w-full max-w-md mx-auto flex flex-col ${isLocked ? 'opacity-0 pointer-events-none translate-y-10' : 'opacity-100 translate-y-0'}`}>
      <div className="space-y-4 md:space-y-6 flex-1">
        
        <div className="space-y-2 relative animate-slide-in-up" style={{ animationDelay: '300ms' }}>
            <LocationInput 
                icon={MapPin} 
                placeholder={t.startLocation}
                onSelect={setStartPoint} 
                disabled={isLocked}
                autoFocus
                t={t}
            />
            {/* Visual connector */}
            <div className="flex pl-6 md:pl-6 -my-2 relative z-10 opacity-30">
                <div className="w-0.5 h-4 bg-white"></div>
            </div>
            <LocationInput 
                icon={Navigation} 
                placeholder={t.destination}
                onSelect={setEndPoint} 
                disabled={isLocked}
                t={t}
            />
        </div>

        {error && (
          <p className="text-red-400 text-xs text-center font-mono bg-red-900/20 p-2 rounded border border-red-900/30 animate-fade-in">{error}</p>
        )}

        <div className="pt-2 animate-slide-in-up" style={{ animationDelay: '500ms' }}>
            <button 
                onClick={onOpenSettings}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-neutral-900/50 border border-white/10 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 hover:border-white/20 transition-all mb-4 group"
            >
                <Settings size={14} className="group-hover:rotate-90 transition-transform duration-500" />
                <span className="text-xs font-medium uppercase tracking-widest">{t.configuration}</span>
            </button>

            <button
                onClick={handleCalculate}
                disabled={isLoading || isLocked || !startPoint || !endPoint}
                className="w-full bg-white text-black h-14 rounded-xl font-bold text-sm tracking-widest uppercase hover:bg-neutral-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-[0.98]"
            >
                {isLoading ? (
                    <Loader2 className="animate-spin" size={18} />
                ) : (
                    <>
                    <PlayCircle size={18} />
                    {t.startVisualization}
                    </>
                )}
            </button>
        </div>
      </div>
    </div>
  );
};

export default RoutePlanner;

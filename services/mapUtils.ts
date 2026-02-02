
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { Language } from "../types";

// Types for OpenStreetMap/OSRM responses

export interface NominatimAddress {
    amenity?: string;
    building?: string;
    shop?: string;
    tourism?: string;
    leisure?: string;
    office?: string;
    emergency?: string;
    historic?: string;
    railway?: string;
    road?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    hamlet?: string;
    municipality?: string;
    county?: string;
    state?: string;
    country?: string;
    postcode?: string;
    [key: string]: string | undefined;
}

export interface NominatimResult {
    place_id: number;
    lat: string;
    lon: string;
    display_name: string;
    address: NominatimAddress;
}

interface OSRMRoute {
    routes: {
        geometry: {
            coordinates: [number, number][]; // lon, lat
            type: string;
        };
        duration: number;
        distance: number;
    }[];
}

// 1. Geocoding (Nominatim)
export const searchLocation = async (query: string): Promise<NominatimResult[]> => {
    if (!query || query.length < 3) return [];
    try {
        // addressdetails=1 is crucial for parsing city/amenity separately
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`, {
            headers: {
                'Accept-Language': 'en-US,en;q=0.9',
            }
        });
        if (!response.ok) throw new Error("Geocoding failed");
        return await response.json();
    } catch (e) {
        console.error("Geocoding error:", e);
        return [];
    }
};

// 2. Routing (OSRM)
export const getRouteData = async (
    start: [number, number], 
    end: [number, number], 
    mode: 'foot' | 'driving'
): Promise<{ coordinates: [number, number][], duration: number, distance: number }> => {
    // OSRM uses {lon},{lat}
    const startStr = `${start[1]},${start[0]}`;
    const endStr = `${end[1]},${end[0]}`;
    
    // Use OSRM public demo server
    const url = `https://router.project-osrm.org/route/v1/${mode}/${startStr};${endStr}?overview=full&geometries=geojson`;
    
    try {
        // Add timeout to avoid hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`OSRM request failed: ${response.status}`);
        }

        const data: OSRMRoute = await response.json();
        
        if (!data.routes || data.routes.length === 0) {
            throw new Error("No route found");
        }

        const route = data.routes[0];
        // Convert OSRM [lon, lat] to Leaflet [lat, lon]
        const coordinates = route.geometry.coordinates.map(p => [p[1], p[0]] as [number, number]);
        
        return {
            coordinates,
            duration: route.duration, // seconds
            distance: route.distance  // meters
        };
    } catch (e) {
        console.warn("Routing API failed, using fallback direct path:", e);
        
        // Fallback: Direct line calculation
        const distance = computeDistanceBetween(start, end);
        // Estimate speed: ~50km/h (13.8 m/s) for driving, ~5km/h (1.4 m/s) for walking
        const speed = mode === 'driving' ? 13.8 : 1.4; 
        const duration = distance / speed;

        return {
            coordinates: [start, end],
            duration,
            distance
        };
    }
};

// 3. Geometry Helpers (Replaces Google Maps Geometry Library)

// Calculate distance between two points in meters (Haversine formula)
export const computeDistanceBetween = (p1: [number, number], p2: [number, number]): number => {
    const R = 6371e3; // Earth radius in meters
    const lat1 = p1[0] * Math.PI / 180;
    const lat2 = p2[0] * Math.PI / 180;
    const dLat = (p2[0] - p1[0]) * Math.PI / 180;
    const dLon = (p2[1] - p1[1]) * Math.PI / 180;

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// Calculate total length of a path
export const computeLength = (path: [number, number][]): number => {
    let total = 0;
    for (let i = 0; i < path.length - 1; i++) {
        total += computeDistanceBetween(path[i], path[i+1]);
    }
    return total;
};

// Linear interpolation between two points
export const interpolate = (p1: [number, number], p2: [number, number], fraction: number): [number, number] => {
    const lat = p1[0] + (p2[0] - p1[0]) * fraction;
    const lng = p1[1] + (p2[1] - p1[1]) * fraction;
    return [lat, lng];
};

// Find a point at a specific distance along the path
export const getPointAtDistance = (path: [number, number][], meters: number) => {
    if (meters <= 0) return { point: path[0], index: 0 };
    
    let distSoFar = 0;
    for (let i = 0; i < path.length - 1; i++) {
        const p1 = path[i];
        const p2 = path[i+1];
        const segDist = computeDistanceBetween(p1, p2);
        
        if (distSoFar + segDist > meters) {
            const remain = meters - distSoFar;
            const fraction = remain / segDist;
            const interpolated = interpolate(p1, p2, fraction);
            return { point: interpolated, index: i };
        }
        
        distSoFar += segDist;
    }
    return { point: path[path.length - 1], index: path.length - 1 };
};

export const formatDuration = (seconds: number, lang: Language = 'en'): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    
    const units = lang === 'pt-BR' 
        ? { hr: 'h', min: 'min' }
        : { hr: 'hr', min: 'min' };

    if (h > 0) return `${h} ${units.hr} ${m} ${units.min}`;
    return `${m} ${units.min}`;
};

export const formatDistance = (meters: number, lang: Language = 'en'): string => {
    // Keep dot for decimal separation to ensure CountUp compatibility, mainly changing suffix if needed
    // but KM/M are standard. 
    if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
    return `${Math.round(meters)} m`;
};

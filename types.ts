
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// Expanded animation types for more variety
export type AnimationType = 
  | 'OVERVIEW'   // Static full route
  | 'FOCUS'      // Tight follow (Zoom 16)
  | 'GLIDE'      // Medium follow (Zoom 14)
  | 'CINEMATIC'  // Variable zoom
  | 'LANDING'    // Zoom in from far to near
  | 'TAKEOFF';   // Zoom out from near to far

export type Language = 'en' | 'pt-BR';

export interface LocationLabel {
    title: string;    // Primarily the City
    subtitle: string; // Specific location (UTFPR, Street, etc.)
}

export interface PointState {
    name: string;
    lat: number;
    lon: number;
    label: LocationLabel;
}

export interface RouteDetails {
  startAddress: string;
  endAddress: string;
  startLabel: LocationLabel;
  endLabel: LocationLabel;
  distance: string;
  distanceMeters: number;
  duration: string;
  durationSeconds: number;
  travelMode: string;
  pathCoordinates: [number, number][];
  // Username removed from specific route details, uses global config
}

export enum AppState {
  PLANNING,
  VISUALIZING
}

export interface MapConfig {
    animationType: AnimationType;
    duration: number; // seconds
    showIntro: boolean;
    introSpeed: 'SLOW' | 'NORMAL' | 'FAST'; // Updated intro config
    socialHandle: string; // Global social handle (Settings)
    userImage: string | null; // Profile image URL
    showMap: boolean; // New visibility config
    brightness: number;
    contrast: number;
    lineWidth: number;
    lineColor: string;
    showStats: boolean;
    // Social Master Switch
    socialEnabled: boolean;
    // Audio Settings
    musicEnabled: boolean;
    customAudioUrl: string | null;
    customAudioName: string | null;
    // Interface Visibility
    showMusicOverlay: boolean;
    showSocialOverlay: boolean;
}

export const DEFAULT_CONFIG: MapConfig = {
    animationType: 'CINEMATIC',
    duration: 40,
    showIntro: true,
    introSpeed: 'NORMAL',
    socialHandle: 'user',
    userImage: null,
    showMap: true,
    brightness: 1.3,
    contrast: 1.1,
    lineWidth: 4,
    lineColor: '#FFFFFF',
    showStats: true,
    socialEnabled: false,
    musicEnabled: true,
    customAudioUrl: null,
    customAudioName: null,
    showMusicOverlay: true,
    showSocialOverlay: true
};

export const COLOR_OPTIONS = [
    '#FFFFFF', // White
    '#38bdf8', // Sky Blue
    '#fbbf24', // Amber
    '#f472b6', // Pink
    '#4ade80', // Green
];

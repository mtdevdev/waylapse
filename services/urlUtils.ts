
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { MapConfig, PointState, AnimationType, DEFAULT_CONFIG } from '../types';

export const serializeStateToUrl = (
    start: PointState,
    end: PointState,
    config: MapConfig
): string => {
    const params = new URLSearchParams();

    // Serialize Route Points (compressed keys to save space)
    params.set('slat', start.lat.toFixed(6));
    params.set('slon', start.lon.toFixed(6));
    params.set('sname', start.name);
    params.set('stitle', start.label.title);
    if (start.label.subtitle) params.set('ssub', start.label.subtitle);

    params.set('elat', end.lat.toFixed(6));
    params.set('elon', end.lon.toFixed(6));
    params.set('ename', end.name);
    params.set('etitle', end.label.title);
    if (end.label.subtitle) params.set('esub', end.label.subtitle);

    // Serialize Configuration
    if (config.socialEnabled) {
        params.set('social', '1');
        if (config.socialHandle && config.socialHandle !== 'user') params.set('handle', config.socialHandle);
        if (config.musicEnabled) {
            params.set('music', '1');
            if (config.customAudioName) params.set('track', config.customAudioName);
        }
    }

    if (config.animationType !== DEFAULT_CONFIG.animationType) {
        params.set('anim', config.animationType);
    }
    
    // Style overrides
    if (config.lineColor !== DEFAULT_CONFIG.lineColor) params.set('color', config.lineColor.replace('#', ''));
    if (!config.showStats) params.set('nostats', '1');

    return `${window.location.protocol}//${window.location.host}${window.location.pathname}?${params.toString()}`;
};

export interface ParsedUrlState {
    start?: PointState;
    end?: PointState;
    configPartial?: Partial<MapConfig>;
}

export const parseStateFromUrl = (): ParsedUrlState => {
    const params = new URLSearchParams(window.location.search);
    const result: ParsedUrlState = { configPartial: {} };

    // Helper to get point
    const getPoint = (prefix: 's' | 'e'): PointState | undefined => {
        const lat = parseFloat(params.get(`${prefix}lat`) || '');
        const lon = parseFloat(params.get(`${prefix}lon`) || '');
        const name = params.get(`${prefix}name`);
        const title = params.get(`${prefix}title`);

        if (!isNaN(lat) && !isNaN(lon) && name && title) {
            return {
                lat,
                lon,
                name,
                label: {
                    title,
                    subtitle: params.get(`${prefix}sub`) || ''
                }
            };
        }
        return undefined;
    };

    const start = getPoint('s');
    const end = getPoint('e');

    if (start) result.start = start;
    if (end) result.end = end;

    // Config Parsing
    if (params.has('social')) {
        result.configPartial!.socialEnabled = true;
        const handle = params.get('handle');
        if (handle) result.configPartial!.socialHandle = handle;
        
        if (params.has('music')) {
             result.configPartial!.musicEnabled = true;
             const track = params.get('track');
             if (track) {
                 result.configPartial!.customAudioName = track;
                 // Note: We cannot recover the actual audio URL/file from URL params
             }
        }
    }

    const anim = params.get('anim');
    if (anim) {
        // Validate animation type
        const validTypes: AnimationType[] = ['OVERVIEW', 'FOCUS', 'GLIDE', 'CINEMATIC', 'LANDING', 'TAKEOFF'];
        if (validTypes.includes(anim as any)) {
            result.configPartial!.animationType = anim as AnimationType;
        }
    }

    const color = params.get('color');
    if (color) {
        result.configPartial!.lineColor = '#' + color;
    }

    if (params.has('nostats')) {
        result.configPartial!.showStats = false;
    }

    return result;
};

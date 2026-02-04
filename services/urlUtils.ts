
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { MapConfig, PointState, AnimationType, DEFAULT_CONFIG } from '../types';

export interface ShareOptions {
    includeSocial: boolean;
    includeMusic: boolean;
}

export const serializeStateToUrl = (
    start: PointState,
    end: PointState,
    config: MapConfig,
    options: ShareOptions
): string => {
    const params = new URLSearchParams();

    // Serialize Route Points (High Precision)
    params.set('slat', start.lat.toFixed(6));
    params.set('slon', start.lon.toFixed(6));
    params.set('stitle', start.label.title);
    if (start.label.subtitle) params.set('ssub', start.label.subtitle);

    params.set('elat', end.lat.toFixed(6));
    params.set('elon', end.lon.toFixed(6));
    params.set('etitle', end.label.title);
    if (end.label.subtitle) params.set('esub', end.label.subtitle);

    // Serialize Configuration selectively
    if (options.includeSocial && config.socialEnabled) {
        params.set('social', '1');
        if (config.socialHandle && config.socialHandle !== 'user') params.set('handle', config.socialHandle);
    }

    if (options.includeMusic && config.musicEnabled) {
        params.set('music', '1');
        if (config.customAudioName) params.set('track', config.customAudioName);
        
        // Only share the Audio URL if it is a remote link (http/https), not a local blob
        if (config.customAudioUrl && config.customAudioUrl.startsWith('http')) {
            params.set('audio', config.customAudioUrl);
        }
    }

    // Always include visuals if they differ from default
    if (config.animationType !== DEFAULT_CONFIG.animationType) {
        params.set('anim', config.animationType);
    }
    
    // Style overrides
    if (config.lineColor !== DEFAULT_CONFIG.lineColor) params.set('color', config.lineColor.replace('#', ''));
    if (!config.showStats) params.set('nostats', '1');
    if (!config.showMap) params.set('nomap', '1');
    if (config.brightness !== DEFAULT_CONFIG.brightness) params.set('brt', config.brightness.toString());
    if (config.contrast !== DEFAULT_CONFIG.contrast) params.set('con', config.contrast.toString());

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
        
        // We might not have the full name anymore, so we construct it for the input box
        const title = params.get(`${prefix}title`);
        const sub = params.get(`${prefix}sub`) || '';
        const legacyName = params.get(`${prefix}name`);

        if (!isNaN(lat) && !isNaN(lon) && title) {
            // Reconstruct a display name if the full name is missing
            const reconstructedName = legacyName || (sub ? `${title}, ${sub}` : title);
            
            return {
                lat,
                lon,
                name: reconstructedName,
                label: {
                    title,
                    subtitle: sub
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
    }
    
    if (params.has('music')) {
        result.configPartial!.musicEnabled = true;
        
        const track = params.get('track');
        if (track) result.configPartial!.customAudioName = track;

        const audioUrl = params.get('audio');
        if (audioUrl) result.configPartial!.customAudioUrl = audioUrl;

        // CRITICAL FIX: If music is present, we must enable socialEnabled because InlineMap
        // uses it as a master switch for media playback. However, if the 'social' param
        // was NOT sent (meaning user unchecked "Social Identity"), we hide the social overlay.
        if (!params.has('social')) {
            result.configPartial!.socialEnabled = true;
            result.configPartial!.showSocialOverlay = false;
        }
    }

    const anim = params.get('anim');
    if (anim) {
        const validTypes: AnimationType[] = ['OVERVIEW', 'FOCUS', 'GLIDE', 'CINEMATIC', 'LANDING', 'TAKEOFF'];
        if (validTypes.includes(anim as any)) {
            result.configPartial!.animationType = anim as AnimationType;
        }
    }

    const color = params.get('color');
    if (color) {
        result.configPartial!.lineColor = '#' + color;
    }

    if (params.has('nostats')) result.configPartial!.showStats = false;
    if (params.has('nomap')) result.configPartial!.showMap = false;
    
    const brt = parseFloat(params.get('brt') || '');
    if (!isNaN(brt)) result.configPartial!.brightness = brt;

    const con = parseFloat(params.get('con') || '');
    if (!isNaN(con)) result.configPartial!.contrast = con;

    return result;
};

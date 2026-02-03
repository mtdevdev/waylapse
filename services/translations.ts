
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { Language } from '../types';

export interface Translation {
    appTitle: string;
    appSubtitle: string;
    planner: {
        startLocation: string;
        destination: string;
        configuration: string;
        startVisualization: string;
        errorSelectPoints: string;
        errorCalculation: string;
        noLocationsFound: string;
        tryDifferentSearch: string;
        recent: string;
    };
    settings: {
        title: string;
        subtitle: string;
        tabs: {
            motion: string;
            style: string;
            social: string;
        };
        cameraMotion: string;
        presentation: string;
        socialFeatures: string;
        enableSocial: string;
        enableSocialDesc: string;
        socialHandle: string;
        profileImage: string;
        uploadImage: string;
        resetImage: string;
        mapStyle: string;
        resetDefaults: string;
        resetAudio: string;
        flightDuration: string;
        introSequence: string;
        introDescription: string;
        statsOverlay: string;
        statsDescription: string;
        showMapTiles: string;
        brightness: string;
        contrast: string;
        routeWidth: string;
        routeColor: string;
        audio: string;
        enableMusic: string;
        uploadMusic: string;
        uploadPlaceholder: string;
        showMusicOverlay: string;
        showSocialOverlay: string;
        installApp: string;
        installNote: string;
        speeds: {
            slow: string;
            normal: string;
            fast: string;
        };
        animations: {
            cinematic: { label: string; desc: string };
            focus: { label: string; desc: string };
            glide: { label: string; desc: string };
            takeoff: { label: string; desc: string };
            landing: { label: string; desc: string };
            static: { label: string; desc: string };
        };
    };
    map: {
        origin: string;
        arrival: string;
        time: string;
        distance: string;
        destination: string;
        duration: string;
        initializing: string;
        traveling: string;
        playingNow: string;
        noAudio: string;
        customAudio: string;
        exportVideo: string;
        startExport: string;
        exportTip: string;
    };
}

export const translations: Record<Language, Translation> = {
  en: {
    appTitle: "waylapse",
    appSubtitle: "Cinematic Route Visualization",
    planner: {
      startLocation: "Start Location",
      destination: "Destination",
      configuration: "Configuration",
      startVisualization: "Start Visualization",
      errorSelectPoints: "Select start and end points.",
      errorCalculation: "Could not calculate a route between these points. Please try different locations.",
      noLocationsFound: "No locations found",
      tryDifferentSearch: "Try a different search term",
      recent: "Recent"
    },
    settings: {
      title: "Settings",
      subtitle: "Configure visualization",
      tabs: {
          motion: "Motion",
          style: "Style",
          social: "Social"
      },
      cameraMotion: "Camera & Motion",
      presentation: "Presentation",
      socialFeatures: "Social Features",
      enableSocial: "Enable Social Mode",
      enableSocialDesc: "Music, handle & overlays",
      socialHandle: "Username",
      profileImage: "Profile Image",
      uploadImage: "Upload Image",
      resetImage: "Reset Image",
      mapStyle: "Map Style",
      resetDefaults: "Reset Defaults",
      resetAudio: "Reset to Default",
      flightDuration: "Travel Duration",
      introSequence: "Intro Sequence",
      introDescription: "Cinematic flyover before route starts",
      statsOverlay: "Stats Overlay",
      statsDescription: "Show distance & time during travel",
      showMapTiles: "Show Map Tiles",
      brightness: "Brightness",
      contrast: "Contrast",
      routeWidth: "Route Width",
      routeColor: "Route Color",
      audio: "Audio",
      enableMusic: "Background Music",
      uploadMusic: "Upload Track",
      uploadPlaceholder: "Choose audio file...",
      showMusicOverlay: "Show Music Ticker",
      showSocialOverlay: "Show Username Tag",
      installApp: "Install App",
      installNote: "For the best experience",
      speeds: {
        slow: "SLOW",
        normal: "NORMAL",
        fast: "FAST"
      },
      animations: {
        cinematic: { label: "Cinematic", desc: "Dynamic zoom based on speed" },
        focus: { label: "Focus", desc: "Tight lock on position" },
        glide: { label: "Glide", desc: "Smooth medium altitude" },
        takeoff: { label: "Takeoff", desc: "Gradual ascent" },
        landing: { label: "Landing", desc: "Gradual descent" },
        static: { label: "Static", desc: "Fixed full route view" }
      }
    },
    map: {
      origin: "Origin",
      arrival: "Arrival",
      time: "Time",
      distance: "Distance",
      destination: "Destination",
      duration: "Duration",
      initializing: "Initializing route visualization...",
      traveling: "Traveling",
      playingNow: "Playing Now",
      noAudio: "No Audio Loaded",
      customAudio: "Custom Audio",
      exportVideo: "Export Video",
      startExport: "Start Recording",
      exportTip: "Select 'This Tab' in the popup"
    }
  },
  'pt-BR': {
    appTitle: "waylapse",
    appSubtitle: "Visualização Cinematográfica de Rotas",
    planner: {
      startLocation: "Local de Partida",
      destination: "Destino",
      configuration: "Configuração",
      startVisualization: "Iniciar Visualização",
      errorSelectPoints: "Selecione os pontos de partida e chegada.",
      errorCalculation: "Não foi possível calcular a rota. Tente locais diferentes.",
      noLocationsFound: "Nenhum local encontrado",
      tryDifferentSearch: "Tente outro termo de busca",
      recent: "Recentes"
    },
    settings: {
      title: "Configurações",
      subtitle: "Configurar visualização",
      tabs: {
          motion: "Movimento",
          style: "Estilo",
          social: "Social"
      },
      cameraMotion: "Câmera e Movimento",
      presentation: "Apresentação",
      socialFeatures: "Recursos Sociais",
      enableSocial: "Modo Social",
      enableSocialDesc: "Música, usuário e overlays",
      socialHandle: "Nome de Usuário",
      profileImage: "Imagem de Perfil",
      uploadImage: "Carregar Imagem",
      resetImage: "Restaurar Imagem",
      mapStyle: "Estilo do Mapa",
      resetDefaults: "Restaurar Padrões",
      resetAudio: "Restaurar Padrão",
      flightDuration: "Duração da Viagem",
      introSequence: "Sequência de Intro",
      introDescription: "Sobrevoo cinematográfico inicial",
      statsOverlay: "Estatísticas",
      statsDescription: "Mostrar distância e tempo",
      showMapTiles: "Mostrar Mapa",
      brightness: "Brilho",
      contrast: "Contraste",
      routeWidth: "Largura da Rota",
      routeColor: "Cor da Rota",
      audio: "Áudio",
      enableMusic: "Música de Fundo",
      uploadMusic: "Carregar Faixa",
      uploadPlaceholder: "Escolher arquivo...",
      showMusicOverlay: "Mostrar Faixa de Música",
      showSocialOverlay: "Mostrar Tag de Usuário",
      installApp: "Instalar App",
      installNote: "Para a melhor experiência",
      speeds: {
        slow: "LENTO",
        normal: "NORMAL",
        fast: "RÁPIDO"
      },
      animations: {
        cinematic: { label: "Cinemático", desc: "Zoom dinâmico" },
        focus: { label: "Foco", desc: "Travado na posição" },
        glide: { label: "Planar", desc: "Altitude média suave" },
        takeoff: { label: "Decolagem", desc: "Subida gradual" },
        landing: { label: "Aterrissagem", desc: "Descida gradual" },
        static: { label: "Estático", desc: "Visão fixa da rota" }
      }
    },
    map: {
      origin: "Origem",
      arrival: "Chegada",
      time: "Tempo",
      distance: "Distância",
      destination: "Destino",
      duration: "Duração",
      initializing: "Inicializando visualização...",
      traveling: "Viajando",
      playingNow: "Tocando Agora",
      noAudio: "Sem Áudio",
      customAudio: "Áudio Personalizado",
      exportVideo: "Exportar Vídeo",
      startExport: "Gravar",
      exportTip: "Selecione 'Esta Guia' no popup"
    }
  }
};

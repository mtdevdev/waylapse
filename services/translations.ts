
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
        cancel: string;
    };
    settings: {
        title: string;
        subtitle: string;
        help: string;
        helpModal: {
            title: string;
            recordingTitle: string;
            recordingDesc: string;
            saveTitle: string;
            saveDesc: string;
            tipsTitle: string;
            tips: string[];
            close: string;
        };
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
        searchPlaceholder: string;
        searchBtn: string;
        searching: string;
        noResults: string;
        localFile: string;
        searchTrack: string;
        online: string;
        localOnly: string;
        showMusicOverlay: string;
        showSocialOverlay: string;
        installApp: string;
        installNote: string;
        previewNote: string;
        localNote: string;
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
            high_alt: { label: string; desc: string };
            low_pass: { label: string; desc: string };
            breathe: { label: string; desc: string };
            orbit: { label: string; desc: string };
        };
        seeMore: string;
        seeLess: string;
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
      cancel: "Cancel"
    },
    settings: {
      title: "Settings",
      subtitle: "Configure visualization",
      help: "Help",
      helpModal: {
          title: "Help Center",
          recordingTitle: "Screen Recording",
          recordingDesc: "Waylapse does not yet support native video export. To save your journey, please use your device's built-in screen recording feature.",
          saveTitle: "Auto-Save",
          saveDesc: "Your configuration settings, including theme and toggle preferences, are automatically saved to your browser.",
          tipsTitle: "Quick Tips",
          tips: [
              "Mouse inactivity auto-hides the interface for clean recording.",
              "Use 'Social Mode' to overlay your handle and music track.",
              "Search provides 30s previews. Upload local files for full audio.",
              "Lower brightness creates a cinematic 'dark mode' effect."
          ],
          close: "Close"
      },
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
      searchPlaceholder: "Search song or artist...",
      searchBtn: "Search",
      searching: "Searching...",
      noResults: "No tracks found",
      localFile: "Local File",
      searchTrack: "Search Track",
      online: "Online",
      localOnly: "Local Only",
      showMusicOverlay: "Show Music Ticker",
      showSocialOverlay: "Show Username Tag",
      installApp: "Install App",
      installNote: "For the best experience",
      previewNote: "30s Preview",
      localNote: "Unlimited Duration",
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
        static: { label: "Static", desc: "Fixed full route view" },
        high_alt: { label: "High Alt", desc: "Satellite-style view" },
        low_pass: { label: "Low Pass", desc: "Street-level flyover" },
        breathe: { label: "Breathe", desc: "Oscillating zoom effect" },
        orbit: { label: "Orbit", desc: "Rotating camera view" }
      },
      seeMore: "See More",
      seeLess: "See Less"
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
      customAudio: "Custom Audio"
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
      cancel: "Cancelar"
    },
    settings: {
      title: "Configurações",
      subtitle: "Configurar visualização",
      help: "Ajuda",
      helpModal: {
          title: "Central de Ajuda",
          recordingTitle: "Gravação de Tela",
          recordingDesc: "O Waylapse ainda não suporta exportação de vídeo nativa. Para salvar sua viagem, use o recurso de gravação de tela do seu dispositivo.",
          saveTitle: "Salvamento Automático",
          saveDesc: "Suas configurações, incluindo tema e preferências de visualização, são salvas automaticamente no navegador.",
          tipsTitle: "Dicas Rápidas",
          tips: [
              "A inatividade do mouse oculta a interface para gravação limpa.",
              "Use o 'Modo Social' para sobrepor seu usuário e trilha sonora.",
              "Busca oferece prévias de 30s. Use arquivos locais para áudio completo.",
              "Reduzir o brilho cria um efeito cinematográfico 'dark mode'."
          ],
          close: "Fechar"
      },
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
      searchPlaceholder: "Buscar música ou artista...",
      searchBtn: "Buscar",
      searching: "Buscando...",
      noResults: "Nenhuma faixa encontrada",
      localFile: "Arquivo Local",
      searchTrack: "Buscar Faixa",
      online: "Online",
      localOnly: "Apenas Local",
      showMusicOverlay: "Mostrar Faixa de Música",
      showSocialOverlay: "Mostrar Tag de Usuário",
      installApp: "Instalar App",
      installNote: "Para a melhor experiência",
      previewNote: "Preview de 30s",
      localNote: "Duração Ilimitada",
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
        static: { label: "Estático", desc: "Visão fixa da rota" },
        high_alt: { label: "Alta Altitude", desc: "Visão de satélite" },
        low_pass: { label: "Voo Baixo", desc: "Sobrevoo rente ao chão" },
        breathe: { label: "Respirar", desc: "Zoom oscilante suave" },
        orbit: { label: "Órbita", desc: "Câmera rotativa" }
      },
      seeMore: "Ver Mais",
      seeLess: "Ver Menos"
    },
    map: {
      origin: "Origin",
      arrival: "Chegada",
      time: "Tempo",
      distance: "Distância",
      destination: "Destino",
      duration: "Duração",
      initializing: "Inicializando visualização...",
      traveling: "Viajando",
      playingNow: "Tocando Agora",
      noAudio: "Sem Áudio",
      customAudio: "Áudio Personalizado"
    }
  }
};

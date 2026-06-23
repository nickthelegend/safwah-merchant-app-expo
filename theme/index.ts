export const theme = {
  colors: {
    background: '#000000',
    backgroundSecondary: '#0A0A0A',
    primary: '#01CE93',
    primaryDark: '#00B582',
    secondary: '#E1EEE6',
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    textMuted: '#666666',
    border: '#1A1A1A',
    borderLight: '#2A2A2A',
    card: '#111111',
    cardElevated: '#1A1A1A',
    error: '#FF4444',
    success: '#01CE93',
    warning: '#FFA500',
    accent: '#00D4AA',
  },
  gradients: {
    primary: ['#01CE93', '#00B582'],
    card: ['#111111', '#0A0A0A'],
    background: ['#000000', '#0A0A0A'],
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
  },
  shadows: {
    glow: {
      shadowColor: '#01CE93',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 12,
    },
    card: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    subtle: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold' as const,
      color: '#FFFFFF',
      letterSpacing: -0.5,
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold' as const,
      color: '#FFFFFF',
      letterSpacing: -0.3,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600' as const,
      color: '#FFFFFF',
      letterSpacing: -0.2,
    },
    body: {
      fontSize: 16,
      color: '#FFFFFF',
      lineHeight: 24,
    },
    bodySmall: {
      fontSize: 14,
      color: '#B0B0B0',
      lineHeight: 20,
    },
    caption: {
      fontSize: 12,
      color: '#666666',
      lineHeight: 16,
    },
  },
  animations: {
    fast: 200,
    medium: 300,
    slow: 500,
  },
};

export type Theme = typeof theme;

export const createGradient = (colors: string[]) => ({
  flex: 1,
  colors,
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
});
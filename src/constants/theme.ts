/**
 * DARK_PREMIUM preset copy. Only the accent entries are overridden to the
 * brief's amber / terracotta storm palette — the preset `name` stays the same.
 */
export const theme = {
  name: 'DARK_PREMIUM',

  colors: {
    bg: {
      primary: '#111114',
      secondary: '#18181C',
      tertiary: '#1F1F24',
      accent: '#252530',
      storm: '#24191B',
    },
    accent: {
      primary: '#E3AE48',
      secondary: '#B75C31',
      tertiary: '#496A52',
      earth: '#673C2D',
      conduit: '#5A4A3E',
      core: '#F2D08A',
    },
    text: {
      primary: '#DCE6EE',
      secondary: '#8C8178',
      muted: '#6E665E',
      ink: '#1A1410',
      locked: '#4E4840',
    },
    ui: {
      border: 'rgba(255,255,255,0.10)',
      borderSoft: 'rgba(255,255,255,0.06)',
      borderAccent: 'rgba(227,174,72,0.22)',
      glass: 'rgba(255,255,255,0.05)',
      glassRaised: 'rgba(255,255,255,0.07)',
      sheet: 'rgba(24,24,28,0.93)',
      bar: 'rgba(24,24,28,0.94)',
      headerScrim: 'rgba(0,0,0,0.34)',
    },
  },

  gradients: {
    button: ['#E3AE48', '#B75C31'],
    board: ['rgba(36,25,27,0.88)', 'rgba(17,17,20,0.94)'],
    loader: ['rgba(17,17,20,0.94)', 'rgba(36,25,27,0.90)', 'rgba(11,11,13,0.97)'],
    menu: ['rgba(17,17,20,0.25)', 'rgba(17,17,20,0.55)', 'rgba(11,11,13,0.97)'],
    map: ['rgba(11,11,13,0.90)', 'rgba(36,25,27,0.80)', 'rgba(11,11,13,0.95)'],
    tutorial: ['rgba(17,17,20,0.93)', 'rgba(11,11,13,0.97)'],
    game: ['rgba(17,17,20,0.72)', 'rgba(11,11,13,0.90)'],
    win: ['rgba(73,106,82,0.30)', 'rgba(17,17,20,0.93)', 'rgba(11,11,13,0.97)'],
    lose: ['rgba(103,60,45,0.34)', 'rgba(17,17,20,0.94)', 'rgba(11,11,13,0.97)'],
  },

  typography: {
    hero: { fontSize: 34, fontWeight: '900' as const, letterSpacing: 4 },
    headline: { fontSize: 32, fontWeight: '900' as const, letterSpacing: 3 },
    title: { fontSize: 28, fontWeight: '800' as const, letterSpacing: 2.5 },
    section: { fontSize: 16, fontWeight: '800' as const, letterSpacing: 2 },
    button: { fontSize: 16, fontWeight: '800' as const, letterSpacing: 1.5 },
    body: { fontSize: 14, fontWeight: '500' as const, letterSpacing: 0.2 },
    caption: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 1.5 },
    stat: { fontSize: 22, fontWeight: '800' as const, letterSpacing: 0.5 },
  },

  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },

  radius: { sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, sheet: 30, pill: 100 },

  shadows: {
    card: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.45,
      shadowRadius: 20,
      elevation: 10,
    },
    board: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.55,
      shadowRadius: 22,
      elevation: 14,
    },
    button: {
      shadowColor: '#B75C31',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.45,
      shadowRadius: 18,
      elevation: 12,
    },
    sheet: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: -10 },
      shadowOpacity: 0.6,
      shadowRadius: 24,
      elevation: 18,
    },
  },

  animation: {
    spring: { tension: 46, friction: 8 },
    press: { tension: 300, friction: 12 },
    pop: { tension: 50, friction: 7 },
    fade: 320,
    element: 420,
  },
} as const;

export type Theme = typeof theme;
export default theme;

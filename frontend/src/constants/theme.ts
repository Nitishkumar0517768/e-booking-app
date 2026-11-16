import { Platform } from 'react-native';

export const Colors = {
  // Coinbase Design System
  primary: '#0052ff',
  primaryActive: '#003ecc',
  primaryDisabled: '#a8b8cc',
  ink: '#0a0b0d',
  body: '#5b616e',
  bodyStrong: '#0a0b0d',
  muted: '#7c828a',
  mutedSoft: '#a8acb3',
  hairline: '#dee1e6',
  hairlineSoft: '#eef0f3',
  canvas: '#ffffff',
  surfaceSoft: '#f7f7f7',
  surfaceCard: '#ffffff',
  surfaceStrong: '#eef0f3',
  surfaceDark: '#0a0b0d',
  onPrimary: '#ffffff',
  semanticUp: '#05b169',
  semanticDown: '#cf202f',
  accentYellow: '#f4b000',

  light: {
    primary: '#0052ff',
    text: '#0a0b0d',
    textSecondary: '#5b616e',
    background: '#ffffff',
    surface: '#ffffff',
    surfaceSoft: '#f7f7f7',
    border: '#dee1e6',
    borderSoft: '#eef0f3',
    backgroundElement: '#f7f7f7',
    backgroundSelected: '#eef0f3',
    success: '#05b169',
    error: '#cf202f',
    warning: '#f4b000',
  },
  dark: {
    primary: '#0052ff',
    text: '#ffffff',
    textSecondary: '#a8acb3',
    background: '#0a0b0d',
    surface: '#16181c',
    surfaceSoft: '#212225',
    border: '#2e3135',
    borderSoft: '#212225',
    backgroundElement: '#16181c',
    backgroundSelected: '#2e3135',
    success: '#05b169',
    error: '#cf202f',
    warning: '#f4b000',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  base: 16,
  md: 20,
  lg: 24,
  xl: 32,
  xxl: 48,
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 40,
};

export const Radius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 100,
  full: 9999,
};

export const Typography = {
  displayLg: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  displayMd: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 30,
    letterSpacing: -0.3,
  },
  titleLg: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 26,
  },
  titleMd: {
    fontSize: 17,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  titleSm: {
    fontSize: 15,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
  bodyLg: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodyMd: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  bodySm: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
  },
};

export const BottomTabInset = Platform.select({
  ios: 84,
  android: 68,
  default: 68,
});

export const MaxContentWidth = 600;

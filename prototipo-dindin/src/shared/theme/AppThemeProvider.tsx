import {
  createContext,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

export type ThemeMode = 'dark' | 'light';

export interface AppColors {
  readonly background: string;
  readonly surface: string;
  readonly raised: string;
  readonly text: string;
  readonly muted: string;
  readonly border: string;
  readonly realized: string;
  readonly planned: string;
  readonly accent: string;
  readonly danger: string;
}

const palettes: Record<ThemeMode, AppColors> = {
  dark: {
    background: '#101B1D',
    surface: '#1A2A2A',
    raised: '#243638',
    text: '#E7F0ED',
    muted: '#9BAEAA',
    border: '#344847',
    realized: '#70D3A6',
    planned: '#E1B873',
    accent: '#9CC9EE',
    danger: '#F0A29A',
  },
  light: {
    background: '#F1F5F3',
    surface: '#FFFFFF',
    raised: '#E6EFEB',
    text: '#17212B',
    muted: '#52606D',
    border: '#D7DEE3',
    realized: '#177A62',
    planned: '#986B16',
    accent: '#275A76',
    danger: '#9F3A31',
  },
};

interface AppThemeValue {
  readonly mode: ThemeMode;
  readonly colors: AppColors;
  readonly setMode: (mode: ThemeMode) => void;
}

const AppThemeContext = createContext<AppThemeValue | null>(null);

export function AppThemeProvider({ children }: PropsWithChildren) {
  const [mode, setMode] = useState<ThemeMode>('dark');
  const value = useMemo(() => ({ mode, colors: palettes[mode], setMode }), [mode]);

  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
}

export function useAppTheme(): AppThemeValue {
  const value = useContext(AppThemeContext);
  if (!value) throw new Error('useAppTheme must be used within AppThemeProvider.');
  return value;
}

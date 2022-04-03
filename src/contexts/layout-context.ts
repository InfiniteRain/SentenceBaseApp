import {createContext} from 'react';
import {CombinedTheme} from '../types';

type LayoutContext = {
  theme: CombinedTheme;
  setTheme: (theme: CombinedTheme) => void;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  progress: number;
  setProgress: (progress: number) => void;
  progressText: string;
  setProgressText: (progressText: string) => void;
};

export const LayoutContext = createContext<LayoutContext>({} as LayoutContext);

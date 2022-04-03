import {createContext} from 'react';
import {CombinedTheme} from '../types';

type LayoutContext = {
  theme: CombinedTheme;
  setTheme: (theme: React.SetStateAction<CombinedTheme>) => void;
  isLoading: boolean;
  setLoading: (loading: React.SetStateAction<boolean>) => void;
  progress: number;
  setProgress: (progress: React.SetStateAction<number>) => void;
  progressText: string;
  setProgressText: (progressText: React.SetStateAction<string>) => void;
};

export const LayoutContext = createContext<LayoutContext>({} as LayoutContext);

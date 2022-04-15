import {createContext} from 'react';
import {AppTheme} from '../types';

type LayoutContext = {
  theme: AppTheme;
  setTheme: (theme: React.SetStateAction<AppTheme>) => void;
  isLoading: boolean;
  setLoading: (loading: React.SetStateAction<boolean>) => void;
  progress: number;
  setProgress: (progress: React.SetStateAction<number>) => void;
  progressText: string;
  setProgressText: (progressText: React.SetStateAction<string>) => void;
};

export const LayoutContext = createContext<LayoutContext>({} as LayoutContext);

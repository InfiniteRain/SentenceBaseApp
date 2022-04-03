import {createContext} from 'react';
import {CombinedTheme} from '../types';

type LayoutContext = {
  theme: CombinedTheme;
  setTheme: (theme: CombinedTheme) => void;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
};

export const LayoutContext = createContext<LayoutContext>({} as LayoutContext);

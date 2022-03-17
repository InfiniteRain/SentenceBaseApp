import {createContext} from 'react';
import {CombinedTheme} from '../types';

type ThemeContext = {
  theme: CombinedTheme;
  setTheme: (theme: CombinedTheme) => void;
};

export const ThemeContext = createContext<ThemeContext>({} as ThemeContext);

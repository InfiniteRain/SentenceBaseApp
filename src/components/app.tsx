import React, {useEffect, useState} from 'react';
import {
  NavigationContainer,
  DefaultTheme as NavigationDefaultTheme,
  DarkTheme as NavigationDarkTheme,
} from '@react-navigation/native';
import {
  Provider as PaperProvider,
  DefaultTheme as PaperDefaultTheme,
  DarkTheme as PaperDarkTheme,
} from 'react-native-paper';
import {RootNavigator} from './navigation/RootNavigator';
import {ThemeContext} from '../contexts/theme';
import {CombinedTheme} from '../types';
import {useColorScheme} from 'react-native';

const DefaultTheme: CombinedTheme = {
  ...PaperDefaultTheme,
  ...NavigationDefaultTheme,
  colors: {
    ...PaperDefaultTheme.colors,
    ...NavigationDefaultTheme.colors,
  },
};

const DarkTheme: CombinedTheme = {
  ...PaperDarkTheme,
  ...NavigationDarkTheme,
  colors: {
    ...PaperDarkTheme.colors,
    ...NavigationDarkTheme.colors,
  },
};

export const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [theme, setTheme] = useState<CombinedTheme>(DefaultTheme);

  useEffect(() => {
    setTheme(isDarkMode ? DarkTheme : DefaultTheme);
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={{theme, setTheme}}>
      <PaperProvider theme={theme}>
        <NavigationContainer theme={theme}>
          <RootNavigator />
        </NavigationContainer>
      </PaperProvider>
    </ThemeContext.Provider>
  );
};

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
  ActivityIndicator,
} from 'react-native-paper';
import {RootNavigator} from './navigation/RootNavigator';
import {ThemeContext} from '../contexts/theme';
import {CombinedTheme} from '../types';
import {StatusBar, StyleSheet, useColorScheme, View} from 'react-native';
import {QueryClient, QueryClientProvider} from 'react-query';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import AuthUI from 'react-native-firebaseui-auth';
import changeNavigationBarColor from 'react-native-navigation-bar-color';

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

const queryClient = new QueryClient();

export const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [theme, setTheme] = useState<CombinedTheme>(DefaultTheme);
  const [currentUser, setCurrentUser] = useState<FirebaseAuthTypes.User | null>(
    null,
  );

  useEffect(() => {
    setTheme(isDarkMode ? DarkTheme : DefaultTheme);
    changeNavigationBarColor(
      isDarkMode ? DarkTheme.colors.surface : DefaultTheme.colors.surface,
      !isDarkMode,
      false,
    );
  }, [isDarkMode]);

  useEffect(
    () =>
      auth().onAuthStateChanged(async user => {
        setCurrentUser(user);

        let isLoggedIn = user !== null;

        while (!isLoggedIn) {
          try {
            await AuthUI.signIn({
              providers: ['email'],
              allowNewEmailAccounts: true,
              requireDisplayName: false,
              tosUrl: '',
              privacyPolicyUrl: '',
            });
            isLoggedIn = true;
          } catch {}
        }
      }),
    [],
  );

  return (
    <>
      <StatusBar
        backgroundColor={theme.colors.surface}
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
      />
      <QueryClientProvider client={queryClient}>
        <ThemeContext.Provider value={{theme, setTheme}}>
          <PaperProvider theme={theme}>
            {!currentUser ? (
              <View style={styles.loggedOutView}>
                <ActivityIndicator animating={true} size={64} />
              </View>
            ) : (
              <NavigationContainer theme={theme}>
                <RootNavigator />
              </NavigationContainer>
            )}
          </PaperProvider>
        </ThemeContext.Provider>
      </QueryClientProvider>
    </>
  );
};

const styles = StyleSheet.create({
  loggedOutView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

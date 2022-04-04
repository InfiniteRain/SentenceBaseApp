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
import {LayoutContext} from '../contexts/layout-context';
import {CombinedTheme} from '../types';
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import {QueryClient, QueryClientProvider} from 'react-query';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import AuthUI from 'react-native-firebaseui-auth';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import Toast from 'react-native-toast-message';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Bar as ProgressBar} from 'react-native-progress';

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
  const [isLoading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
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

  // todo: get rid of react native paper
  // todo: add padding on drawer labels for android devices
  // todo: support export on android devices
  // todo: when on tablets, add a blank space to the left of the app
  // todo: add a way to invoke app from outside (via context menus etc)

  return (
    <>
      <StatusBar
        backgroundColor={theme.colors.surface}
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
      />
      <QueryClientProvider client={queryClient}>
        <LayoutContext.Provider
          value={{
            theme,
            setTheme,
            isLoading,
            setLoading,
            progress,
            setProgress,
            progressText,
            setProgressText,
          }}>
          <PaperProvider theme={theme}>
            <SafeAreaProvider>
              {!currentUser ? (
                <View style={styles.loggedOutView}>
                  <ActivityIndicator animating={true} size={64} />
                </View>
              ) : (
                <NavigationContainer theme={theme}>
                  <RootNavigator />
                </NavigationContainer>
              )}
              <Toast />
              {isLoading && (
                <View
                  style={[
                    styles.loading,
                    {backgroundColor: theme.colors.background},
                  ]}>
                  <Text
                    style={[
                      styles.progressText,
                      {color: theme.colors.onSurface},
                    ]}>
                    {progressText}
                  </Text>
                  <ProgressBar
                    progress={progress}
                    width={300}
                    height={10}
                    color={theme.colors.primary}
                    borderColor={theme.colors.onSurface}
                  />
                  <ActivityIndicator
                    style={styles.activityIndicator}
                    size="large"
                  />
                </View>
              )}
            </SafeAreaProvider>
          </PaperProvider>
        </LayoutContext.Provider>
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
  loading: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontSize: 16,
    marginBottom: 15,
  },
  activityIndicator: {
    marginTop: 15,
  },
});

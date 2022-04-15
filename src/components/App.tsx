import React, {useEffect, useState} from 'react';
import {
  NavigationContainer,
  DefaultTheme as NavigationDefaultTheme,
  DarkTheme as NavigationDarkTheme,
} from '@react-navigation/native';
import {RootNavigator} from './navigation/RootNavigator';
import {LayoutContext} from '../contexts/layout-context';
import {AppTheme} from '../types';
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
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
import {Text} from './elements/Text';

const LightTheme: AppTheme = {
  ...NavigationDefaultTheme,
  colors: {
    ...NavigationDefaultTheme.colors,
    surface: '#ffffff',
    surfaceText: '#000000',
    surfaceBorder: 'rgba(0, 0, 0, 0.29)',
    dangerText: '#ff2d55',
    placeholderText: 'rgba(0, 0, 0, 0.54)',
    disabledText: 'rgba(0, 0, 0, 0.26)',
    disabledButton: 'rgba(0, 0, 0, 0.12)',
    disabledButtonText: 'rgba(0, 0, 0, 0.32)',
    divider: 'rgba(0, 0, 0, 0.12)',
  },
};

const DarkTheme: AppTheme = {
  ...NavigationDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    surface: '#121212',
    surfaceText: '#FFFFFF',
    surfaceBorder: 'rgba(255, 255, 255, 0.29)',
    dangerText: '#ff2d55',
    placeholderText: 'rgba(255, 255, 255, 0.54)',
    disabledText: 'rgba(255, 255, 255, 0.38)',
    disabledButton: 'rgba(255, 255, 255, 0.12)',
    disabledButtonText: 'rgba(255, 255, 255, 0.32)',
    divider: 'rgba(255, 255, 255, 0.12)',
  },
};

const queryClient = new QueryClient();

export const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [theme, setTheme] = useState<AppTheme>(LightTheme);
  const [isLoading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [currentUser, setCurrentUser] = useState<FirebaseAuthTypes.User | null>(
    null,
  );

  useEffect(() => {
    setTheme(isDarkMode ? DarkTheme : LightTheme);
    changeNavigationBarColor(
      isDarkMode ? DarkTheme.colors.surface : LightTheme.colors.surface,
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
                <Text style={styles.progressText}>{progressText}</Text>
                <ProgressBar
                  progress={progress}
                  width={300}
                  height={10}
                  color={theme.colors.primary}
                  borderColor={theme.colors.surfaceText}
                />
                <ActivityIndicator
                  style={styles.activityIndicator}
                  size="large"
                />
              </View>
            )}
          </SafeAreaProvider>
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

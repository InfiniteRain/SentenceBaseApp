import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
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
import {CombinedTheme, MecabMessage, MecabMorpheme} from '../types';
import {StatusBar, StyleSheet, useColorScheme, View} from 'react-native';
import {QueryClient, QueryClientProvider} from 'react-query';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import AuthUI from 'react-native-firebaseui-auth';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import WebView, {WebViewMessageEvent} from 'react-native-webview';
import {MecabContext} from '../contexts/mecab-context';
import Toast from 'react-native-toast-message';

const mecabCdnUrl = 'https://infiniterain.github.io/cdn/mecab';

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
// eslint-disable-next-line no-spaced-func
const mecabCache = new Map<
  string,
  [Promise<MecabMorpheme[]>, (morphemes: MecabMorpheme[]) => void]
>();

export const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [theme, setTheme] = useState<CombinedTheme>(DefaultTheme);
  const [currentUser, setCurrentUser] = useState<FirebaseAuthTypes.User | null>(
    null,
  );
  const [initPromise, resolveInitPromise] = useMemo((): [
    Promise<void>,
    () => void,
  ] => {
    let resolvePromise!: () => void;
    const promise = new Promise<void>(resolve => {
      resolvePromise = resolve;
    });
    return [promise, resolvePromise];
  }, []);

  const mecabRef = useRef<WebView | null>();

  const onMecabMessage = useCallback(
    (message: WebViewMessageEvent) => {
      const parsedMessage = JSON.parse(
        message.nativeEvent.data,
      ) as MecabMessage;

      if (parsedMessage.type === 'initialized') {
        resolveInitPromise();
        return;
      }

      const cachedItem = mecabCache.get(parsedMessage.data.query);

      if (!cachedItem) {
        return;
      }

      cachedItem[1](parsedMessage.data.result);
      mecabCache.delete(parsedMessage.data.query);
    },
    [resolveInitPromise],
  );
  const mecabQuery = useCallback(
    async (query: string): Promise<MecabMorpheme[]> => {
      await initPromise;

      const mecabWebView = mecabRef.current;

      if (!mecabWebView) {
        return [];
      }

      const cachedItem = mecabCache.get(query);

      if (cachedItem) {
        return await cachedItem[0];
      }

      let resolvePromise!: (morphemes: MecabMorpheme[]) => void;
      const promise = new Promise<MecabMorpheme[]>(resolve => {
        resolvePromise = resolve;
      });

      mecabCache.set(query, [promise, resolvePromise]);
      mecabWebView.postMessage(query);

      return await promise;
    },
    [initPromise],
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
          <MecabContext.Provider value={{mecabQuery}}>
            <PaperProvider theme={theme}>
              <>
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
                <View style={styles.mecabWebViewContainer}>
                  <WebView
                    ref={ref => {
                      mecabRef.current = ref;
                    }}
                    source={{uri: mecabCdnUrl}}
                    originWhitelist={['*']}
                    javaScriptEnabled={true}
                    onMessage={onMecabMessage}
                    style={styles.mecabWebView}
                  />
                </View>
              </>
            </PaperProvider>
          </MecabContext.Provider>
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
  mecabWebViewContainer: {
    position: 'absolute',
  },
  mecabWebView: {
    width: 0,
    height: 0,
  },
});

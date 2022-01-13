import React, {useState, useEffect, useRef} from 'react';
import AuthUI from 'react-native-firebaseui-auth';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {
  AppStateContext,
  MecabMessage,
  MecabMorpheme,
  Page,
} from '../app-state-context';
import Toast from 'react-native-toast-message';
import {MainMenu} from './main-menu';
import {SentenceEntry} from '../common';
import {PendingSentences} from './pending-sentences';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import WebView, {WebViewMessageEvent} from 'react-native-webview';
import {Mining} from './mining';

const styles = StyleSheet.create({
  mecabWebViewContainer: {
    position: 'absolute',
  },
  mecabWebView: {
    width: 0,
    height: 0,
  },
  loading: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(128, 128, 128, 0.5)',
  },
});

export const App = () => {
  let initPromiseResolve!: () => void;
  const initPromise = new Promise<void>(resolve => {
    initPromiseResolve = resolve;
  });

  const [isLoading, setLoading] = useState<boolean>(false);
  const [currentUser, setCurrentUser] =
    useState<FirebaseAuthTypes.User | null>();
  const [currentPage, setCurrentPage] = useState<Page>(Page.MainMenu);
  const [batch, setBatch] = useState<SentenceEntry[]>([]);
  const [mecabWebView, setMecabWebView] = useState<WebView | null>(null);
  const [mecabInitPromise] = useState<Promise<void>>(initPromise);
  const [mecabInitPromiseResolve] = useState<() => () => void>(
    () => initPromiseResolve,
  );
  const [mecabCache] = useState(
    new Map<
      string,
      [(morphemes: MecabMorpheme[]) => void, Promise<MecabMorpheme[]>]
    >(),
  );

  const mecabInitRef = useRef<{
    mecabInitPromise: Promise<void>;
    mecabInitPromiseResolve: () => void;
  }>({
    mecabInitPromise,
    mecabInitPromiseResolve,
  });
  const mecabWebViewRef = useRef<WebView | null>(null);
  const mecabCacheRef =
    useRef<
      Map<
        string,
        [(morphemes: MecabMorpheme[]) => void, Promise<MecabMorpheme[]>]
      >
    >(mecabCache);

  mecabInitRef.current = {
    mecabInitPromise,
    mecabInitPromiseResolve,
  };
  mecabWebViewRef.current = mecabWebView;
  mecabCacheRef.current = mecabCache;

  useEffect(() => {
    return auth().onAuthStateChanged(async user => {
      setCurrentUser(user);

      let isLoggedIn = user !== null;

      while (!isLoggedIn) {
        try {
          await AuthUI.signIn({
            providers: ['email'],
            allowNewEmailAccounts: true,
            requireDisplayName: false,
          });
          isLoggedIn = true;
        } catch {}
      }
    });
  }, []);

  const onMecabMessage = (message: WebViewMessageEvent) => {
    const parsedMessage = JSON.parse(message.nativeEvent.data) as MecabMessage;

    if (parsedMessage.type === 'initialized') {
      mecabInitRef.current.mecabInitPromiseResolve();
      return;
    }

    const currentMecabCache = mecabCacheRef.current;
    const cachedItem = currentMecabCache.get(parsedMessage.data.query);

    if (!cachedItem) {
      return;
    }

    cachedItem[0](parsedMessage.data.result);
    currentMecabCache.delete(parsedMessage.data.query);
  };

  const mecabQuery = async (query: string): Promise<MecabMorpheme[]> => {
    await mecabInitRef.current.mecabInitPromise;

    const currentMecabWebView = mecabWebViewRef.current;
    const currentMecabCache = mecabCacheRef.current;

    if (!currentMecabWebView) {
      return await Promise.resolve([]);
    }

    const cachedItem = currentMecabCache.get(query);

    if (cachedItem) {
      return cachedItem[1];
    }

    let resolvePromise!: (morphemes: MecabMorpheme[]) => void;
    const promise = new Promise<MecabMorpheme[]>(resolve => {
      resolvePromise = resolve;
    });

    currentMecabCache.set(query, [resolvePromise, promise]);
    currentMecabWebView.postMessage(query);

    return await promise;
  };

  let currentStateComponent = <></>;

  const mecabWebViewComponent = (
    <WebView
      ref={webView => setMecabWebView(webView)}
      source={{uri: 'https://infiniterain.github.io/cdn/mecab'}}
      originWhitelist={['*']}
      javaScriptEnabled={true}
      onMessage={onMecabMessage}
      style={styles.mecabWebView}
    />
  );

  if (currentUser) {
    switch (currentPage) {
      case Page.MainMenu:
        currentStateComponent = <MainMenu />;
        break;
      case Page.PendingSentences:
        currentStateComponent = <PendingSentences />;
        break;
      case Page.Mining:
        currentStateComponent = <Mining />;
        break;
    }
  }

  return (
    <AppStateContext.Provider
      value={{
        isLoading,
        setLoading,
        currentPage,
        setCurrentPage,
        batch,
        setBatch,
        mecabQuery,
      }}>
      {currentStateComponent}
      <View style={styles.mecabWebViewContainer}>{mecabWebViewComponent}</View>
      <Toast />
      {isLoading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" />
        </View>
      )}
    </AppStateContext.Provider>
  );
};

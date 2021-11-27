import React, {useEffect, useRef, useState} from 'react';
import {StyleSheet, Text, useColorScheme, View} from 'react-native';
import {Login} from './Login';
import {checkTokens} from './Networking';
import {Register} from './Register';
import {
  Page,
  AppStateContext,
  MecabMorpheme,
  MecabMessage,
} from './AppStateContext';
import {colors} from './Colors';
import {Mining} from './Mining';
import {UserMenu} from './UserMenu';
import Toast from 'react-native-toast-message';
import {PendingSentences} from './PendingSentences';
import {NewBatch} from './NewBatch';
import {SentenceEntry} from './Common';
import {Export} from './Export';
import WebView, {WebViewMessageEvent} from 'react-native-webview';

const styles = StyleSheet.create({
  mecabWebViewContainer: {
    position: 'absolute',
  },
  mecabWebView: {
    width: 0,
    height: 0,
  },
});

export const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  let initPromiseResolve!: () => void;
  const initPromise = new Promise<void>(resolve => {
    initPromiseResolve = resolve;
  });

  const [currentPage, setCurrentPage] = useState<Page>(Page.Loading);
  const [batch, setBatch] = useState<SentenceEntry[]>([]);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [mecabInitPromiseResolve] = useState<() => () => void>(
    () => initPromiseResolve,
  );
  const [mecabInitPromise] = useState<Promise<void>>(initPromise);
  const [mecabWebView, setMecabWebView] = useState<WebView | null>(null);
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

  const backToLogin = (email: string) => {
    setRegisteredEmail(email);
    setCurrentPage(Page.LoginScreen);
  };

  useEffect(() => {
    checkTokens().then(tokensResult => {
      if (tokensResult) {
        setCurrentPage(Page.UserMenu);
        return;
      }

      setCurrentPage(Page.LoginScreen);
    });
  }, []);

  const onMessage = (message: WebViewMessageEvent) => {
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

  let currentStateComponent = (
    <Text style={{color: isDarkMode ? colors.white : colors.black}}>
      Loading
    </Text>
  );

  const mecabWebViewComponent = (
    <WebView
      ref={webView => setMecabWebView(webView)}
      source={{uri: 'https://infiniterain.github.io/cdn/mecab'}}
      originWhitelist={['*']}
      javaScriptEnabled={true}
      onMessage={onMessage}
      style={styles.mecabWebView}
    />
  );

  switch (currentPage) {
    case Page.LoginScreen:
      currentStateComponent = <Login registeredEmail={registeredEmail} />;
      break;
    case Page.RegisterScreen:
      currentStateComponent = <Register backToLogin={backToLogin} />;
      break;
    case Page.UserMenu:
      currentStateComponent = <UserMenu />;
      break;
    case Page.Mining:
      currentStateComponent = <Mining />;
      break;
    case Page.PendingSentences:
      currentStateComponent = <PendingSentences />;
      break;
    case Page.NewBatch:
      currentStateComponent = <NewBatch />;
      break;
    case Page.Export:
      currentStateComponent = <Export />;
      break;
  }

  return (
    <AppStateContext.Provider
      value={{
        currentPage: currentPage,
        setCurrentPage: setCurrentPage,
        batch,
        setBatch,
        mecabQuery,
      }}>
      {currentStateComponent}
      <View style={styles.mecabWebViewContainer}>{mecabWebViewComponent}</View>
      <Toast />
    </AppStateContext.Provider>
  );
};

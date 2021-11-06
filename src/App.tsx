import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Login} from './Login';
import {checkTokens} from './Networking';
import {Register} from './Register';
import {AppState, AppStateContext} from './AppStateContext';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export const App = () => {
  const [appState, setAppState] = useState<AppState>(AppState.Loading);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const backToLogin = (email: string) => {
    setRegisteredEmail(email);
    setAppState(AppState.LoginScreen);
  };

  useEffect(() => {
    checkTokens().then(tokensCheckPassed => {
      if (tokensCheckPassed) {
        setAppState(AppState.Mining);
        return;
      }

      setAppState(AppState.LoginScreen);
    });
  }, []);

  let currentStateComponent = <Text>Loading</Text>;

  switch (appState) {
    case AppState.LoginScreen:
      currentStateComponent = <Login registeredEmail={registeredEmail} />;
      break;
    case AppState.RegisterScreen:
      currentStateComponent = <Register backToLogin={backToLogin} />;
      break;
  }

  return (
    <AppStateContext.Provider value={{appState, setAppState}}>
      <View style={styles.container}>{currentStateComponent}</View>
    </AppStateContext.Provider>
  );
};

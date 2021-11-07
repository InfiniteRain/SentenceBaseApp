import React, {useEffect, useState} from 'react';
import {Text, useColorScheme} from 'react-native';
import {Login} from './Login';
import {checkTokens} from './Networking';
import {Register} from './Register';
import {AppState, AppStateContext} from './AppStateContext';
import {colors} from './Colors';
import {Mining} from './Mining';
import {UserMenu} from './UserMenu';

export const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const [appState, setAppState] = useState<AppState>(AppState.Loading);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const backToLogin = (email: string) => {
    setRegisteredEmail(email);
    setAppState(AppState.LoginScreen);
  };

  useEffect(() => {
    checkTokens().then(tokensResult => {
      if (tokensResult) {
        setAppState(AppState.UserMenu);
        return;
      }

      setAppState(AppState.LoginScreen);
    });
  }, []);

  let currentStateComponent = (
    <Text style={{color: isDarkMode ? colors.white : colors.black}}>
      Loading
    </Text>
  );

  switch (appState) {
    case AppState.LoginScreen:
      currentStateComponent = <Login registeredEmail={registeredEmail} />;
      break;
    case AppState.RegisterScreen:
      currentStateComponent = <Register backToLogin={backToLogin} />;
      break;
    case AppState.UserMenu:
      currentStateComponent = <UserMenu />;
      break;
    case AppState.Mining:
      currentStateComponent = <Mining />;
      break;
  }

  return (
    <AppStateContext.Provider value={{appState, setAppState}}>
      {currentStateComponent}
    </AppStateContext.Provider>
  );
};

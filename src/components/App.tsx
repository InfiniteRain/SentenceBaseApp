import React, {useState, useEffect} from 'react';
import {Text, useColorScheme} from 'react-native';
import AuthUI from 'react-native-firebaseui-auth';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {AppStateContext, Page} from '../app-state-context';
import {colors} from '../colors';
import Toast from 'react-native-toast-message';
import {MainMenu} from './main-menu';

export const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const [currentUser, setCurrentUser] =
    useState<FirebaseAuthTypes.User | null>();
  const [currentPage, setCurrentPage] = useState<Page>(Page.MainMenu);

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
            });
            isLoggedIn = true;
          } catch {}
        }
      }),
    [],
  );

  let currentStateComponent = <></>;

  if (currentUser) {
    switch (currentPage) {
      case Page.MainMenu:
        currentStateComponent = <MainMenu />;
        break;
    }
  }

  return (
    <AppStateContext.Provider
      value={{
        currentPage,
        setCurrentPage,
      }}>
      {currentStateComponent}

      <Toast />
    </AppStateContext.Provider>
  );
};

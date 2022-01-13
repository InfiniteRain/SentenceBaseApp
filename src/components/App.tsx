import React, {useState, useEffect} from 'react';
import AuthUI from 'react-native-firebaseui-auth';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {AppStateContext, Page} from '../app-state-context';
import Toast from 'react-native-toast-message';
import {MainMenu} from './main-menu';
import {SentenceEntry} from '../common';
import {PendingSentences} from './pending-sentences';

export const App = () => {
  const [currentUser, setCurrentUser] =
    useState<FirebaseAuthTypes.User | null>();
  const [currentPage, setCurrentPage] = useState<Page>(Page.MainMenu);
  const [batch, setBatch] = useState<SentenceEntry[]>([]);

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
      case Page.PendingSentences:
        currentStateComponent = <PendingSentences />;
        break;
    }
  }

  return (
    <AppStateContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        batch,
        setBatch,
      }}>
      {currentStateComponent}

      <Toast />
    </AppStateContext.Provider>
  );
};

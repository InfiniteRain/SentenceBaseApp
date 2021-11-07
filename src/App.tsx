import React, {useEffect, useState} from 'react';
import {Text, useColorScheme} from 'react-native';
import {Login} from './Login';
import {checkTokens} from './Networking';
import {Register} from './Register';
import {Page, AppStateContext} from './AppStateContext';
import {colors} from './Colors';
import {Mining} from './Mining';
import {UserMenu} from './UserMenu';
import Toast from 'react-native-toast-message';
import {PendingSentences} from './PendingSentences';
import {NewBatch} from './NewBatch';
import {SentenceEntry} from './Common';

export const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const [currentPage, setCurrentPage] = useState<Page>(Page.Loading);
  const [batch, setBatch] = useState<SentenceEntry[]>([]);
  const [registeredEmail, setRegisteredEmail] = useState('');

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

  let currentStateComponent = (
    <Text style={{color: isDarkMode ? colors.white : colors.black}}>
      Loading
    </Text>
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
  }

  return (
    <AppStateContext.Provider
      value={{
        currentPage: currentPage,
        setCurrentPage: setCurrentPage,
        batch,
        setBatch,
      }}>
      {currentStateComponent}
      <Toast />
    </AppStateContext.Provider>
  );
};

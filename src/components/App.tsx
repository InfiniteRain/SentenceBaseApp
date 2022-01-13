import React, {useState, useEffect} from 'react';
import {Text} from 'react-native';
import Auth from 'react-native-firebaseui-auth';

export const App = () => {
  const [user, setUser] = useState<Auth.User | null>();

  useEffect(() => {
    const initAuth = async () => {
      let currentUser = await Auth.getCurrentUser();
      setUser(currentUser);

      while (!currentUser) {
        try {
          currentUser = await Auth.signIn({
            providers: ['email'],
            allowNewEmailAccounts: true,
            requireDisplayName: false,
          });
          setUser(currentUser);
        } catch {}
      }
    };

    initAuth();
  }, []);

  if (!user) {
    return <></>;
  }

  return <Text style={{paddingTop: 40}}>Welcome, {user.email}</Text>;
};

import React, {useState, useEffect} from 'react';
import {View, Text} from 'react-native';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {Button} from 'react-native';
import {GoogleSignin} from '@react-native-google-signin/google-signin';

export const App = () => {
  // Set an initializing state whilst Firebase connects
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>();

  const onGoogleButtonPress = async () => {
    // Get the users ID token
    const {idToken} = await GoogleSignin.signIn();

    // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    // Sign-in the user with the credential
    return auth().signInWithCredential(googleCredential);
  };

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(authUser => {
      setUser(authUser);
      if (initializing) {
        setInitializing(false);
      }
    });
    return subscriber; // unsubscribe on unmount
  }, []);

  if (initializing) {
    console.log('initializing');
    return (
      <View>
        <Text>Initializing</Text>
      </View>
    );
  }

  if (!user) {
    console.log('not user');
    return (
      <View style={{paddingTop: 40}}>
        <Button
          title="Google Sign-In"
          onPress={() =>
            onGoogleButtonPress().then(() =>
              console.log('Signed in with Google!'),
            )
          }
        />
      </View>
    );
  }

  console.log('user');
  return (
    <View>
      <Text>Welcome {user.email}</Text>
    </View>
  );
};

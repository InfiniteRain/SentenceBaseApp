import React, {useContext, useState} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import {colors} from './Colors';
import {AppState, AppStateContext} from './AppStateContext';

const styles = StyleSheet.create({
  inputView: {
    backgroundColor: '#EEEEEE',
    borderRadius: 30,
    width: '70%',
    height: 45,
    marginBottom: 20,
    alignItems: 'center',
  },
  textInput: {
    height: 50,
    flex: 1,
    padding: 10,
  },
  miscButtons: {
    height: 30,
    marginBottom: 30,
  },
  loginButton: {
    width: '80%',
    borderRadius: 25,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    backgroundColor: colors.primary,
  },
  registrationMessage: {
    color: '#4BB543',
    marginBottom: 15,
  },
});

export const Login = ({registeredEmail}: {registeredEmail: string}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const {setAppState} = useContext(AppStateContext);

  const [email, setEmail] = useState(registeredEmail);

  const onRegisterButton = () => {
    setAppState(AppState.RegisterScreen);
  };

  return (
    <>
      {registeredEmail !== '' && (
        <Text style={styles.registrationMessage}>
          The user was successfully registered.
        </Text>
      )}
      <View style={styles.inputView}>
        <TextInput
          autoCapitalize="none"
          placeholder="E-Mail"
          placeholderTextColor={colors.dark}
          style={styles.textInput}
          value={email}
          onChangeText={setEmail}
        />
      </View>
      <View style={styles.inputView}>
        <TextInput
          autoCapitalize="none"
          placeholder="Password"
          placeholderTextColor={colors.dark}
          secureTextEntry
          style={styles.textInput}
        />
      </View>
      <TouchableOpacity onPressOut={onRegisterButton}>
        <Text
          style={[
            styles.miscButtons,
            {
              color: isDarkMode ? colors.white : colors.black,
            },
          ]}>
          I don't have an account
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.loginButton}>
        <Text>LOGIN</Text>
      </TouchableOpacity>
    </>
  );
};

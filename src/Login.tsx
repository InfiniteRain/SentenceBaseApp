import React, {useContext, useRef, useState} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import {colors} from './Colors';
import {Page, AppStateContext} from './AppStateContext';
import {
  sendEnsuredRequest,
  setAccessToken,
  setRefreshToken,
} from './Networking';

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  errorMessage: {
    color: '#FF9494',
    marginBottom: 15,
  },
});

export const Login = ({registeredEmail}: {registeredEmail: string}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const {setCurrentPage} = useContext(AppStateContext);

  const [isLoading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [email, setEmail] = useState(registeredEmail);
  const [password, setPassword] = useState('');

  const loginFormRef = useRef<{
    email: string;
    password: string;
  }>();

  loginFormRef.current = {
    email,
    password,
  };

  const onRegisterButton = () => {
    setCurrentPage(Page.RegisterScreen);
  };

  const onLogin = async () => {
    const loginForm = loginFormRef.current;

    if (!loginForm) {
      return;
    }

    if (loginForm.email.length < 1) {
      setErrorMessage('The E-Mail field cannot be empty.');
      return;
    }

    if (loginForm.password.length < 1) {
      setErrorMessage('The password field cannot be empty.');
      return;
    }

    try {
      setLoading(true);
      let response = await sendEnsuredRequest<
        {
          email: string;
          password: string;
        },
        {
          access_token: string;
          refresh_token: string;
        }
      >('/auth/login', 'post', loginForm);
      setLoading(false);

      if (
        response.status === 'fail' &&
        response.nativeResponse.status === 401
      ) {
        setErrorMessage('Invalid credentials.');
        return;
      }

      if (response.status === 'fail' || response.status === 'error') {
        setErrorMessage('Something went wrong.');
        return;
      }

      setErrorMessage('');
      await setAccessToken(response.data.access_token);
      await setRefreshToken(response.data.refresh_token);
      setCurrentPage(Page.UserMenu);
    } catch (e) {
      setErrorMessage('Network error.');
      setLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      {registeredEmail !== '' && (
        <Text style={styles.registrationMessage}>
          The user was successfully registered.
        </Text>
      )}
      {errorMessage !== '' && (
        <Text style={styles.errorMessage}>{errorMessage}</Text>
      )}
      <View style={styles.inputView}>
        <TextInput
          autoCapitalize="none"
          placeholder="E-Mail"
          placeholderTextColor={colors.dark}
          style={styles.textInput}
          value={email}
          onChangeText={setEmail}
          editable={!isLoading}
        />
      </View>
      <View style={styles.inputView}>
        <TextInput
          autoCapitalize="none"
          placeholder="Password"
          placeholderTextColor={colors.dark}
          secureTextEntry
          style={styles.textInput}
          onChangeText={setPassword}
          editable={!isLoading}
        />
      </View>
      <TouchableOpacity onPress={onRegisterButton} disabled={isLoading}>
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

      <TouchableOpacity
        style={styles.loginButton}
        disabled={isLoading}
        onPress={onLogin}>
        <Text style={{color: colors.lighter}}>LOGIN</Text>
      </TouchableOpacity>
    </View>
  );
};

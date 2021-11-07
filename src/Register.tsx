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
import {sendEnsuredRequest} from './Networking';

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 0,
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
  registerButton: {
    width: '80%',
    borderRadius: 25,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    backgroundColor: colors.primary,
  },
  errorMessage: {
    color: '#FF9494',
    marginBottom: 15,
  },
});

export const Register = ({
  backToLogin,
}: {
  backToLogin: (email: string) => void;
}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const {setCurrentPage} = useContext(AppStateContext);

  const [isLoading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');

  const registerFormRef = useRef<{
    username: string;
    email: string;
    password: string;
    passwordRepeat: string;
  }>();

  registerFormRef.current = {
    username,
    email,
    password,
    passwordRepeat,
  };

  const onBackButton = () => {
    setCurrentPage(Page.LoginScreen);
  };

  const onRegister = async () => {
    const emailRegex =
      /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
    const registerForm = registerFormRef.current;

    if (!registerForm) {
      return;
    }

    if (registerForm.username.trim().length < 3) {
      setErrorMessage('The username has to be at least 3 characters long.');
      return;
    }

    if (!emailRegex.test(registerForm.email.trim())) {
      setErrorMessage('The E-Mail has to be valid.');
      return;
    }

    if (registerForm.password.length < 8) {
      setErrorMessage('The password has to be at least 8 characters ling.');
      return;
    }

    if (registerForm.password !== registerForm.passwordRepeat) {
      setErrorMessage("The passwords don't match.");
      return;
    }

    try {
      setLoading(true);
      let response = await sendEnsuredRequest<
        {
          username: string;
          email: string;
          password: string;
        },
        {
          id: number;
          username: string;
          email: string;
        }
      >('/auth/register', 'post', registerForm);
      setLoading(false);

      if (
        response.status === 'fail' &&
        response.nativeResponse.status === 409
      ) {
        setErrorMessage('This username or E-Mail is already in use.');
        return;
      }

      if (['fail', 'error'].includes(response.status)) {
        setErrorMessage('Something went wrong.');
        return;
      }

      setErrorMessage('');
      backToLogin(registerForm.email.trim());
    } catch (e) {
      setErrorMessage('Network error.');
      setLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      {errorMessage !== '' && (
        <Text style={styles.errorMessage}>{errorMessage}</Text>
      )}
      <View style={styles.inputView}>
        <TextInput
          autoCapitalize="none"
          placeholder="E-Mail"
          placeholderTextColor={colors.dark}
          style={styles.textInput}
          onChangeText={setEmail}
          editable={!isLoading}
        />
      </View>
      <View style={styles.inputView}>
        <TextInput
          autoCapitalize="none"
          placeholder="Username"
          placeholderTextColor={colors.dark}
          style={styles.textInput}
          onChangeText={setUsername}
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
      <View style={styles.inputView}>
        <TextInput
          autoCapitalize="none"
          placeholder="Repeat Password"
          placeholderTextColor={colors.dark}
          secureTextEntry
          style={styles.textInput}
          onChangeText={setPasswordRepeat}
          editable={!isLoading}
        />
      </View>
      <TouchableOpacity onPress={onBackButton} disabled={isLoading}>
        <Text
          style={[
            styles.miscButtons,
            {
              color: isDarkMode ? colors.white : colors.black,
            },
          ]}>
          I already have an account
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onRegister}
        style={styles.registerButton}
        disabled={isLoading}>
        <Text style={{color: colors.lighter}}>REGISTER</Text>
      </TouchableOpacity>
    </View>
  );
};

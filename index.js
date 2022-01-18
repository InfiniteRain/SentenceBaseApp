/**
 * @format
 */

import {AppRegistry} from 'react-native';
import {App} from './src/components/app';
import {name as appName} from './app.json';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {LogBox} from 'react-native';

LogBox.ignoreLogs(['new NativeEventEmitter']);
LogBox.ignoreLogs(['ANKIDROID ANDROID_USE_ONLY']);

GoogleSignin.configure({
  webClientId:
    '890176304594-ibeba03tai3lvsrtin1t8iae7hfg4ga0.apps.googleusercontent.com',
});

AppRegistry.registerComponent(appName, () => App);

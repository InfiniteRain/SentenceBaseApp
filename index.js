/**
 * @format
 */

import {AppRegistry} from 'react-native';
import {App} from './src/components/App';
import {name as appName} from './app.json';
import {GoogleSignin} from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId:
    '890176304594-ibeba03tai3lvsrtin1t8iae7hfg4ga0.apps.googleusercontent.com',
});

AppRegistry.registerComponent(appName, () => App);

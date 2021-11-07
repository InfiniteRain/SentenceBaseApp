import {createContext} from 'react';

export enum AppState {
  Loading,
  LoginScreen,
  RegisterScreen,
  UserMenu,
  Mining,
  PendingSentences,
  Batch,
}

export const AppStateContext = createContext({
  appState: AppState.Loading,
  setAppState: (_appState: AppState) => {},
});

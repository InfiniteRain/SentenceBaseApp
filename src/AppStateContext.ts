import {createContext} from 'react';
import {SentenceEntry} from './Common';

export enum Page {
  Loading,
  LoginScreen,
  RegisterScreen,
  UserMenu,
  Mining,
  PendingSentences,
  NewBatch,
  Batch,
}

export const AppStateContext = createContext<{
  currentPage: Page;
  setCurrentPage: (appState: Page) => void;
  batch: SentenceEntry[];
  setBatch: (batch: SentenceEntry[]) => void;
}>({
  currentPage: Page.Loading,
  setCurrentPage: (_appState: Page) => {},
  batch: [],
  setBatch: (_batch: SentenceEntry[]) => {},
});

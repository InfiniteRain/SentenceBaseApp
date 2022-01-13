import {createContext} from 'react';
import {SentenceEntry} from './common';

export enum Page {
  MainMenu,
  PendingSentences,
}

export const AppStateContext = createContext<{
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  batch: SentenceEntry[];
  setBatch: (batch: SentenceEntry[]) => void;
}>({
  currentPage: Page.MainMenu,
  setCurrentPage: (_page: Page) => {},
  batch: [],
  setBatch: (_batch: SentenceEntry[]) => {},
});

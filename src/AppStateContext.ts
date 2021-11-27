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
  Export,
}

export type MecabMorpheme = {
  word: string;
  pos: string;
  pos_detail1: string;
  pos_detail2: string;
  pos_detail3: string;
  conjugation1: string;
  conjugation2: string;
  dictionary_form: string;
  reading?: string;
  pronunciation?: string;
};

export type MecabMessage =
  | {
      type: 'initialized';
      data: null;
    }
  | {
      type: 'queryResult';
      data: {
        query: string;
        result: MecabMorpheme[];
      };
    };

export const AppStateContext = createContext<{
  currentPage: Page;
  setCurrentPage: (appState: Page) => void;
  batch: SentenceEntry[];
  setBatch: (batch: SentenceEntry[]) => void;
  mecabQuery: (query: string) => Promise<MecabMorpheme[]>;
}>({
  currentPage: Page.Loading,
  setCurrentPage: (_appState: Page) => {},
  batch: [],
  setBatch: (_batch: SentenceEntry[]) => {},
  mecabQuery: async (_query: string) => [],
});

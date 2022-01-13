import {createContext} from 'react';
import {SentenceEntry} from './common';

export enum Page {
  MainMenu,
  PendingSentences,
  Mining,
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
  isLoading: boolean;
  setLoading: (isLoading: boolean) => void;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  batch: SentenceEntry[];
  setBatch: (batch: SentenceEntry[]) => void;
  mecabQuery: (query: string) => Promise<MecabMorpheme[]>;
  frequencyQuery: (dictionaryForm: string, reading: string) => Promise<number>;
}>({
  isLoading: false,
  setLoading: (_isLoading: boolean) => {},
  currentPage: Page.MainMenu,
  setCurrentPage: (_page: Page) => {},
  batch: [],
  setBatch: (_batch: SentenceEntry[]) => {},
  mecabQuery: async (_query: string) => [],
  frequencyQuery: async (_dictionaryForm: string, _reading: string) => 0,
});
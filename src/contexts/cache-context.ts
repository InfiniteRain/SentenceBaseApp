import {createContext} from 'react';
import {SbSentence} from '../types';

type CacheContext = {
  doSentencesQuery: boolean;
  setDoSentencesQuery: (value: React.SetStateAction<boolean>) => void;
  sentenceList: SbSentence[];
  setSentenceList: (value: React.SetStateAction<SbSentence[]>) => void;
};

export const CacheContext = createContext<CacheContext>({} as CacheContext);

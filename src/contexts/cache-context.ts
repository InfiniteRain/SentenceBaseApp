import {createContext} from 'react';
import {SbApiSentenence} from '../types';

type CacheContext = {
  doSentencesQuery: boolean;
  setDoSentencesQuery: (value: React.SetStateAction<boolean>) => void;
  sentenceList: SbApiSentenence[];
  setSentenceList: (value: React.SetStateAction<SbApiSentenence[]>) => void;
};

export const CacheContext = createContext<CacheContext>({} as CacheContext);

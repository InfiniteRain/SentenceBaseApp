import React, {createContext} from 'react';
import {SbSentence} from '../types';

type SentenceCacheContext = {
  doSentencesQuery: boolean;
  setDoSentencesQuery: (value: React.SetStateAction<boolean>) => void;
  ignoreNextUpdate: boolean;
  setIgnoreNextUpdate: (value: React.SetStateAction<boolean>) => void;
  sentenceList: SbSentence[];
  setSentenceList: (value: React.SetStateAction<SbSentence[]>) => void;
};

export const SentenceCacheContext = createContext<SentenceCacheContext>(
  {} as SentenceCacheContext,
);

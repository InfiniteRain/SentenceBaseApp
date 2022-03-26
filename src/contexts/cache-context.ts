import {createContext} from 'react';

type CacheContext = {
  doPendingSentencesQuery: boolean;
  setDoPendingSentencesQuery: (value: boolean) => void;
};

export const CacheContext = createContext<CacheContext>({} as CacheContext);

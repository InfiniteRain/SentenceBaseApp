import {createContext} from 'react';
import {MecabMorpheme} from '../types';

type MecabContext = {
  mecabQuery: (query: string) => Promise<MecabMorpheme[]>;
};

export const MecabContext = createContext<MecabContext>({} as MecabContext);

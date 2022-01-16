export type SentenceEntry = {
  wordId: string;
  sentenceId: string;
  sentence: string;
  dictionaryForm: string;
  reading: string;
  frequency: number;
  dictionaryFrequency?: number;
};

export type DictionaryEntry = {
  frequency: number;
  pitchNums: number[][];
  pitchNames: string[][];
};

export const colors = {
  primary: '#1292B4',
  white: '#FFF',
  lighter: '#F3F3F3',
  light: '#DAE1E7',
  dark: '#444',
  darker: '#222',
  black: '#000',
  grey: '#AAAFB4',
};

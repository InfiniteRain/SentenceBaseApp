import type {Theme as NavigationTheme} from '@react-navigation/native';
import type {Theme as PaperTheme} from 'react-native-paper/lib/typescript/types';
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

export type CombinedTheme = PaperTheme & NavigationTheme;

export type RootNavigatorParamList = {
  Drawer: undefined;
  CreateBatch: undefined;
  Export: undefined;
};

export type RootNavigatorScreenProps = NativeStackScreenProps<
  RootNavigatorParamList,
  'Drawer'
>;

export type RootNavigationProps = NativeStackNavigationProp<
  RootNavigatorParamList,
  'Drawer'
>;

export type Morpheme = {
  surface: string;
  surfaceReading: string;
  dictionaryForm: string;
  dictionaryFormReading: string;
  pitchAccents: {
    descriptive: string;
    mora: number;
  }[];
  isBasic: boolean;
};

export type SbApiResponse<T = null> =
  | {
      success: false;
      errors: unknown[];
    }
  | {
      success: true;
      data: T;
    };

export type SbApiSentence = {
  sentenceId: string;
  dictionaryForm: string;
  reading: string;
  sentence: string;
  frequency: number;
  tags: string[];
};

export type SbSentence = SbApiSentence & {
  dictionaryFrequency: number;
};

export type SbApiGetPendingSentencesResponse = {
  sentences: SbApiSentence[];
};

import type {Theme as NavigationTheme} from '@react-navigation/native';
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import type {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';

export type AppTheme = NavigationTheme & {
  colors: {
    surface: string;
    surfaceText: string;
    surfaceBorder: string;
    dangerText: string;
    placeholderText: string;
    disabledText: string;
    disabledButton: string;
    disabledButtonText: string;
    divider: string;
  };
};

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
  partOfSpeech: string;
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

export type SbBatch = {
  createdAt: FirebaseFirestoreTypes.Timestamp;
  sentences: {
    sentenceId: string;
    sentence: string;
    wordDictionaryForm: string;
    wordReading: string;
    tags: string[];
  }[];
};

export type ExportSettings = {
  profile: string;
  noteType: string;
  deck: string;
  wordField: string;
  sentenceField: string;
  audioField: string;
  definitionField: string;
};

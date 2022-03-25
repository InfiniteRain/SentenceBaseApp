import type {Theme as NavigationTheme} from '@react-navigation/native';
import type {Theme as PaperTheme} from 'react-native-paper/lib/typescript/types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

export type CombinedTheme = PaperTheme & NavigationTheme;

type RootNavigatorParamList = {
  Drawer: undefined;
  Batch: undefined;
  Export: undefined;
};

export type RootNavigatorProps = NativeStackScreenProps<
  RootNavigatorParamList,
  'Drawer'
>;

export type Morpheme = {
  surface: string;
  dictionaryForm: string;
  reading: string;
};

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

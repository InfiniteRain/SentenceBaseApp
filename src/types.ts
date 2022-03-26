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

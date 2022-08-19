import React, {useEffect, useState} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {CreateBatch} from '../screens/create-batch/CreateBatch';
import {Export} from '../screens/Export';
import {Drawer} from './Drawer';
import {useNavigation} from '@react-navigation/native';
import {HeaderButtonContext} from '../../contexts/header-button-context';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {SentenceCacheContext} from '../../contexts/sentence-cache-context';
import {SbSentence} from '../../types';
import {MinedBatches} from '../screens/MinedBatches';

const StackNavigation = createNativeStackNavigator();

export const RootNavigator = () => {
  const navigation = useNavigation();

  const [bottomTabsRoute, setBottomTabsRoute] = useState<string | null>(null);
  const [onClear, setOnClear] = useState<(() => void) | undefined>();
  const [onPaste, setOnPaste] = useState<(() => void) | undefined>();
  const [onEdit, setOnEdit] = useState<(() => void) | undefined>();
  const [isClearDisabled, setClearDisabled] = useState(false);
  const [isPasteDisabled, setPasteDisabled] = useState(false);
  const [isEditDisabled, setEditDisabled] = useState(false);
  const [doSentencesQuery, setDoSentencesQuery] = useState(true);
  const [ignoreNextUpdate, setIgnoreNextUpdate] = useState(false);
  const [sentenceList, setSentenceList] = useState<SbSentence[]>([]);
  const [batchesCount, setBatchesCount] = useState<number>(0);

  useEffect(
    () =>
      navigation.addListener('state', data => {
        const bottomTabsState =
          data.data?.state?.routes[0].state?.routes[0]?.state;
        const index = bottomTabsState?.index;

        setBottomTabsRoute(
          typeof index === 'undefined'
            ? null
            : bottomTabsState?.routes[index].name ?? null,
        );
      }),
    [navigation],
  );

  return (
    <HeaderButtonContext.Provider
      value={{
        bottomTabsRoute,
        setBottomTabsRoute,
        onClear,
        setOnClear,
        onPaste,
        setOnPaste,
        onEdit,
        setOnEdit,
        isClearDisabled,
        setClearDisabled,
        isPasteDisabled,
        setPasteDisabled,
        isEditDisabled,
        setEditDisabled,
      }}>
      <SentenceCacheContext.Provider
        value={{
          doSentencesQuery,
          setDoSentencesQuery,
          sentenceList,
          setSentenceList,
          ignoreNextUpdate,
          setIgnoreNextUpdate,
          batchesCount,
          setBatchesCount,
        }}>
        <BottomSheetModalProvider>
          <StackNavigation.Navigator>
            <StackNavigation.Screen
              name="Drawer"
              component={Drawer}
              options={{headerShown: false}}
            />
            <StackNavigation.Screen
              name="CreateBatch"
              component={CreateBatch}
              options={{title: 'Create New Batch'}}
            />
            <StackNavigation.Screen
              name="MinedBatches"
              component={MinedBatches}
              options={{title: 'Mined Batches'}}
            />
            <StackNavigation.Screen
              name="Export"
              component={Export}
              options={{title: 'Export to Anki'}}
            />
          </StackNavigation.Navigator>
        </BottomSheetModalProvider>
      </SentenceCacheContext.Provider>
    </HeaderButtonContext.Provider>
  );
};

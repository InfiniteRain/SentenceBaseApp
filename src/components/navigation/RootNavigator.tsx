import React, {useEffect, useState} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Batch} from '../screens/Batch';
import {Export} from '../screens/Export';
import {Drawer} from './Drawer';
import {useNavigation} from '@react-navigation/native';
import {HeaderButtonContext} from '../../contexts/header-button-context';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';

const StackNavigation = createNativeStackNavigator();

export const RootNavigator = () => {
  const navigation = useNavigation();

  const [bottomTabsRoute, setBottomTabsRoute] = useState<string | null>(null);
  const [onClear, setOnClear] = useState<(() => void) | undefined>();
  const [onPaste, setOnPaste] = useState<(() => void) | undefined>();
  const [isClearDisabled, setClearDisabled] = useState(false);
  const [isPasteDisabled, setPasteDisabled] = useState(false);

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
        isClearDisabled,
        setClearDisabled,
        isPasteDisabled,
        setPasteDisabled,
      }}>
      <BottomSheetModalProvider>
        <StackNavigation.Navigator>
          <StackNavigation.Screen
            name="Drawer"
            component={Drawer}
            options={{headerShown: false}}
          />
          <StackNavigation.Screen name="Batch" component={Batch} />
          <StackNavigation.Screen name="Export" component={Export} />
        </StackNavigation.Navigator>
      </BottomSheetModalProvider>
    </HeaderButtonContext.Provider>
  );
};

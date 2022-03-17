import React, {useContext} from 'react';
import {Platform} from 'react-native';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {DrawerContent} from './DrawerContent';
import {BottomTabs} from './BottomTabs';
import {RootNavigatorProps} from '../../types';
import {ThemeContext} from '../../contexts/theme';

const DrawerNavigation = createDrawerNavigator();

export const Drawer = (props: RootNavigatorProps) => {
  const {theme} = useContext(ThemeContext);

  return (
    <DrawerNavigation.Navigator
      drawerContent={() => <DrawerContent {...props} />}
      screenOptions={{
        headerTintColor:
          Platform.OS === 'android' ? theme.colors.onSurface : undefined,
      }}>
      <DrawerNavigation.Screen
        name="BottomTabs"
        component={BottomTabs}
        options={{
          title: 'Sentence Base',
        }}
      />
    </DrawerNavigation.Navigator>
  );
};

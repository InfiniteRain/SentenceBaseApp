import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Batch} from '../screens/Batch';
import {Export} from '../screens/Export';
import {Drawer} from './Drawer';

const StackNavigation = createNativeStackNavigator();

export const RootNavigator = () => {
  return (
    <StackNavigation.Navigator>
      <StackNavigation.Screen
        name="Drawer"
        component={Drawer}
        options={{headerShown: false}}
      />
      <StackNavigation.Screen name="Batch" component={Batch} />
      <StackNavigation.Screen name="Export" component={Export} />
    </StackNavigation.Navigator>
  );
};

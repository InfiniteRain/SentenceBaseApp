import React from 'react';
import {Mining} from '../screens/Mining';
import {PendingSentences} from '../screens/PendingSentences';
import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import {ThemeContext} from '../../contexts/theme';

const TabNavigation = createMaterialBottomTabNavigator();

export const BottomTabs = () => {
  const {theme} = React.useContext(ThemeContext);

  return (
    <TabNavigation.Navigator
      shifting={true}
      sceneAnimationEnabled={true}
      barStyle={{backgroundColor: theme.colors.card}}
      activeColor={theme.colors.primary}>
      <TabNavigation.Screen
        name="Mining"
        component={Mining}
        options={{
          tabBarLabel: 'Mining',
          tabBarIcon: 'pickaxe',
        }}
      />
      <TabNavigation.Screen
        name="PendingSentences"
        component={PendingSentences}
        options={{
          tabBarLabel: 'Sentences',
          tabBarIcon: 'view-list',
        }}
      />
    </TabNavigation.Navigator>
  );
};

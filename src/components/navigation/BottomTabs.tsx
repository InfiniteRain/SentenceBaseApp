import React from 'react';
import {Mining} from '../screens/mining/Mining';
import {PendingSentences} from '../screens/pending-sentences/PendingSentences';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

const TabNavigation = createBottomTabNavigator();

export const BottomTabs = () => {
  return (
    <TabNavigation.Navigator
      initialRouteName="Mining"
      screenOptions={{
        headerShown: false,
      }}>
      <TabNavigation.Screen
        name="Mining"
        component={Mining}
        options={{
          tabBarLabel: 'Mining',
          tabBarIcon: ({color}) => (
            <MaterialCommunityIcon name="pickaxe" color={color} size={24} />
          ),
        }}
      />
      <TabNavigation.Screen
        name="PendingSentences"
        component={PendingSentences}
        options={{
          tabBarLabel: 'Sentences',
          tabBarIcon: ({color}) => (
            <MaterialCommunityIcon name="view-list" color={color} size={24} />
          ),
        }}
      />
    </TabNavigation.Navigator>
  );
};

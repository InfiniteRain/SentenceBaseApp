import React, {useContext} from 'react';
import {Platform, StyleSheet, View} from 'react-native';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {DrawerContent} from './DrawerContent';
import {BottomTabs} from './BottomTabs';
import {RootNavigatorScreenProps} from '../../types';
import {ThemeContext} from '../../contexts/theme';
import {IconButton} from '../elements/IconButton';
import {HeaderButtonContext} from '../../contexts/header-button-context';

const DrawerNavigation = createDrawerNavigator();

export const Drawer = (props: RootNavigatorScreenProps) => {
  const {theme} = useContext(ThemeContext);
  const {
    bottomTabsRoute,
    onClear,
    onPaste,
    onEdit,
    isClearDisabled,
    isPasteDisabled,
    isEditDisabled,
  } = React.useContext(HeaderButtonContext);

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
          headerTitleAlign: 'left',
          headerRight: () => (
            <View style={styles.rightHeaderView}>
              {['Mining', null].includes(bottomTabsRoute) && (
                <>
                  <IconButton
                    icon="close"
                    size={24}
                    color={theme.colors.notification}
                    onPress={onClear}
                    disabled={isClearDisabled}
                  />
                  <IconButton
                    icon="pencil"
                    size={24}
                    color={theme.colors.primary}
                    onPress={onEdit}
                    disabled={isEditDisabled}
                  />
                  <IconButton
                    icon="content-paste"
                    size={24}
                    color={theme.colors.primary}
                    onPress={onPaste}
                    disabled={isPasteDisabled}
                  />
                </>
              )}
            </View>
          ),
        }}
      />
    </DrawerNavigation.Navigator>
  );
};

const styles = StyleSheet.create({
  rightHeaderView: {
    flexDirection: 'row',
    marginRight: 4,
  },
});

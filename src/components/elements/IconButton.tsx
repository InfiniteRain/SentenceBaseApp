import React, {useContext} from 'react';
import {StyleProp, StyleSheet, ViewStyle} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {LayoutContext} from '../../contexts/layout-context';

export const IconButton = (props: {
  icon: string;
  color: string;
  size: number;
  disabled?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) => {
  const {theme} = useContext(LayoutContext);

  return (
    <TouchableOpacity
      onPress={props.onPress}
      style={[styles.container, props.style]}
      disabled={props.disabled}>
      <MaterialCommunityIcon
        name={props.icon}
        color={props.disabled ? theme.colors.disabled : props.color}
        size={props.size}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 10,
  },
});

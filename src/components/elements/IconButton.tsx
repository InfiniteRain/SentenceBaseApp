import React, {useContext} from 'react';
import {StyleSheet} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {ThemeContext} from '../../contexts/theme';

export const IconButton = (props: {
  icon: string;
  color: string;
  size: number;
  disabled?: boolean;
  onPress?: () => void;
}) => {
  const {theme} = useContext(ThemeContext);

  return (
    <TouchableOpacity
      onPress={props.onPress}
      style={styles.container}
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

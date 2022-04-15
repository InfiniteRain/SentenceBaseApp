import React, {useContext} from 'react';
import {
  ActivityIndicator,
  GestureResponderEvent,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import {LayoutContext} from '../../contexts/layout-context';

export type ButtonProps = {
  title: string;
  type?: 'default' | 'primary' | 'danger';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
  loading?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
};

export const Button = (props: ButtonProps) => {
  const {
    title,
    type = 'default',
    style,
    textStyle,
    disabled,
    loading,
    onPress,
  } = props;

  const {theme} = useContext(LayoutContext);

  let backgroundColor = theme.colors.surface;
  let textColor = theme.colors.onSurface;

  switch (true) {
    case disabled:
      backgroundColor = `rgba(${
        theme.dark ? '255, 255, 255' : '0, 0, 0'
      }, 0.12)`;
      textColor = `rgba(${theme.dark ? '255, 255, 255' : '0, 0, 0'}, 0.32)`;
      break;
    case type === 'primary':
      backgroundColor = theme.colors.primary;
      textColor = '#fff';
      break;
    case type === 'danger':
      backgroundColor = 'rgba(255, 45, 85, 1)';
      textColor = '#fff';
      break;
  }

  return (
    <TouchableOpacity
      style={[styles.mainView, {backgroundColor}, style]}
      disabled={disabled}
      onPress={onPress}>
      {loading && <ActivityIndicator style={styles.activityIndicator} />}
      <Text style={[styles.text, {color: textColor}, textStyle]}>
        {title.toUpperCase()}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  mainView: {
    paddingHorizontal: 15,
    height: 44,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  activityIndicator: {
    marginRight: 10,
  },
  text: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
});

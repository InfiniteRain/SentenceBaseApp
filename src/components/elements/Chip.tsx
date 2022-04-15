import React, {useContext, useMemo} from 'react';
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {LayoutContext} from '../../contexts/layout-context';
import {Text} from './Text';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {TouchableOpacity} from 'react-native-gesture-handler';
import color from 'color';

export type ChipProps = {
  icon?: string;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  onClose?: () => void;
  children: React.ReactNode;
};

export const Chip = (props: ChipProps) => {
  const {icon, style, onPress, onClose, children} = props;

  const {theme} = useContext(LayoutContext);

  const textColor = useMemo(
    () => color(theme.colors.text).alpha(0.87).rgb().string(),
    [theme],
  );
  const iconColor = useMemo(
    () => color(theme.colors.text).alpha(0.54).rgb().string(),
    [theme],
  );
  const mainViewExtraStyle = useMemo(
    () => ({
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.surfaceBorder,
      paddingRight: onClose ? 10 : 0,
      paddingLeft: icon ? 5 : 12,
    }),
    [theme, onClose, icon],
  );
  const textStyle = useMemo(
    () => ({
      paddingRight: onClose ? 24 : 12,
      color: textColor,
    }),
    [onClose, textColor],
  );

  return (
    <TouchableOpacity
      style={[styles.mainView, mainViewExtraStyle, style]}
      onPress={onPress}
      disabled={!onPress}>
      <View style={styles.container}>
        {icon && (
          <MaterialCommunityIcon
            style={styles.icon}
            name={icon}
            size={16}
            color={iconColor}
          />
        )}
        <Text numberOfLines={1} style={textStyle}>
          {children}
        </Text>
        {onClose && (
          <TouchableOpacity containerStyle={styles.closeIcon} onPress={onClose}>
            <MaterialCommunityIcon
              name="close-circle"
              size={16}
              color={iconColor}
            />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  mainView: {
    flexDirection: 'row',
    paddingLeft: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  container: {
    flexDirection: 'row',
  },
  icon: {
    marginLeft: 2,
    marginRight: 10,
    marginTop: 0.5,
  },
  closeIcon: {position: 'absolute', right: 0},
});

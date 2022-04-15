import React, {useContext} from 'react';
import {StyleSheet, View} from 'react-native';
import {LayoutContext} from '../../contexts/layout-context';

export const Divider = (props: React.ComponentProps<typeof View>) => {
  const {theme} = useContext(LayoutContext);

  return (
    <View
      {...props}
      style={[
        styles.divider,
        {backgroundColor: theme.colors.divider},
        props.style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
  },
});

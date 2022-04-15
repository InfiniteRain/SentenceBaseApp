import React, {useContext, useMemo} from 'react';
import {StyleSheet, Text} from 'react-native';
import {LayoutContext} from '../../contexts/layout-context';
import color from 'color';

export type CaptionProps = React.ComponentProps<typeof Text> & {
  children: React.ReactNode;
};

export const Caption = (props: CaptionProps) => {
  const {theme} = useContext(LayoutContext);

  const textColor = useMemo(
    () => color(theme.colors.surfaceText).alpha(0.54).rgb().string(),
    [theme],
  );

  return (
    <Text
      {...props}
      style={[
        styles.text,
        {
          color: textColor,
        },
        props.style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 12,
    fontFamily: 'System',
    fontWeight: '400',
    lineHeight: 20,
    marginVertical: 2,
    letterSpacing: 0.4,
  },
});

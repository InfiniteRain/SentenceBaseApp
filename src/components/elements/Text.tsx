import React, {useContext} from 'react';
import {Text as NativeText} from 'react-native';
import {LayoutContext} from '../../contexts/layout-context';

export const Text = (props: React.ComponentProps<typeof NativeText>) => {
  const {theme} = useContext(LayoutContext);

  return (
    <NativeText
      {...props}
      style={[{color: theme.colors.surfaceText}, props.style]}
    />
  );
};

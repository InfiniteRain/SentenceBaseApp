import React, {useCallback, useContext, useRef} from 'react';
import {
  TextInputProps,
  TextStyle,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';
import {LayoutContext} from '../../contexts/layout-context';

export type LabeledTextInputProps = TextInputProps & {
  label: string;
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  inpitStyle?: StyleProp<TextStyle>;
};

export const LabeledTextInput = (props: LabeledTextInputProps) => {
  const {theme} = useContext(LayoutContext);

  const inputRef = useRef<TextInput>({} as TextInput);

  const onPress = useCallback(() => {
    inputRef.current.focus();
  }, [inputRef]);

  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={[styles.mainContainer, props.containerStyle]}>
        <Text
          style={[
            styles.label,
            {color: theme.colors.placeholder},
            props.labelStyle,
          ]}>
          {props.label}
        </Text>
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            {
              color: theme.colors.onSurface,
            },
          ]}
          autoCapitalize="none"
          autoCorrect={false}
          placeholderTextColor={theme.colors.placeholder}
          disabled={props.disabled}
          {...props}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    height: 54,
    padding: 8,
    backgroundColor: 'rgba(151, 151, 151, 0.25)',
    borderRadius: 10,
  },
  label: {
    fontSize: 12,
  },
  input: {
    fontSize: 16,
    lineHeight: 20,
  },
});

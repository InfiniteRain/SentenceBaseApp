import React, {useContext} from 'react';
import {TextInputProps, TextStyle} from 'react-native';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';
import {ThemeContext} from '../../contexts/theme';

export type LabeledTextInputProps = TextInputProps & {
  label: string;
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  inpitStyle?: StyleProp<TextStyle>;
};

export const LabeledTextInput = (props: LabeledTextInputProps) => {
  const {theme} = useContext(ThemeContext);

  return (
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
        style={[
          styles.input,
          {
            color: theme.colors.onSurface,
          },
        ]}
        autoCapitalize="none"
        autoCorrect={false}
        placeholderTextColor={theme.colors.placeholder}
        {...props}
      />
    </View>
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

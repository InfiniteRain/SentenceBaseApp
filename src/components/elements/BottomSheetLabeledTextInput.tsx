import {useBottomSheetInternal} from '@gorhom/bottom-sheet';
import React, {useCallback} from 'react';
import {NativeSyntheticEvent, TextInputFocusEventData} from 'react-native';
import {LabeledTextInput, LabeledTextInputProps} from './LabeledTextInput';

export const BottomSheetLabeledTextInput = (props: LabeledTextInputProps) => {
  const {shouldHandleKeyboardEvents} = useBottomSheetInternal();

  const onFocus = useCallback(
    (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      shouldHandleKeyboardEvents.value = true;
      props.onFocus?.(e);
    },
    [props, shouldHandleKeyboardEvents],
  );
  const onBlur = useCallback(
    (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      shouldHandleKeyboardEvents.value = false;
      props.onBlur?.(e);
    },
    [props, shouldHandleKeyboardEvents],
  );

  return <LabeledTextInput {...props} onFocus={onFocus} onBlur={onBlur} />;
};

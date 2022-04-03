import {useBottomSheetInternal} from '@gorhom/bottom-sheet';
import React, {useCallback} from 'react';
import {LabeledTextInput, LabeledTextInputProps} from './LabeledTextInput';

export const BottomSheetLabeledTextInput = (props: LabeledTextInputProps) => {
  const {shouldHandleKeyboardEvents} = useBottomSheetInternal();

  const onFocus = useCallback(
    args => {
      shouldHandleKeyboardEvents.value = true;
      props.onFocus?.(args);
    },
    [props, shouldHandleKeyboardEvents],
  );
  const onBlur = useCallback(
    args => {
      shouldHandleKeyboardEvents.value = false;
      props.onBlur?.(args);
    },
    [props, shouldHandleKeyboardEvents],
  );

  return <LabeledTextInput {...props} onFocus={onFocus} onBlur={onBlur} />;
};

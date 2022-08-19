import {BottomSheetModal} from '@gorhom/bottom-sheet';
import React, {forwardRef, useCallback} from 'react';
import {StyleSheet, View} from 'react-native';
import {SbSentence} from '../../../types';
import {BottomSheetLabeledTextInput} from '../../elements/BottomSheetLabeledTextInput';
import {Button} from '../../elements/Button';
import {PropertySheet} from '../../elements/PropertySheet';

type WordOptionsSheetProps = {
  sentence: SbSentence;
  onMarkAsMined: (sentence: SbSentence) => void;
  onPushToTheEnd: (sentence: SbSentence) => void;
  onChangeIndex?: (index: number) => void;
};

export const WordOptionsSheet = forwardRef<
  BottomSheetModal,
  WordOptionsSheetProps
>((props, ref) => {
  const castedRef = ref as React.RefObject<BottomSheetModal>;

  const onMarkAsMinedPressed = useCallback(() => {
    castedRef.current?.close();
    props.onMarkAsMined(props.sentence);
  }, [castedRef, props]);
  const onPushToTheEndPressed = useCallback(() => {
    castedRef.current?.close();
    props.onPushToTheEnd(props.sentence);
  }, [castedRef, props]);

  return (
    <PropertySheet ref={ref} onChange={props.onChangeIndex}>
      <View style={styles.mainContainer}>
        <BottomSheetLabeledTextInput
          label="Sentence"
          containerStyle={styles.sentenceInput}
          multiline
          numberOfLines={2}
          defaultValue={props.sentence.sentence}
          editable={false}
        />
        <BottomSheetLabeledTextInput
          label="Tags (separated by space)"
          containerStyle={styles.tagsInput}
          defaultValue={props.sentence.tags.join(' ')}
          editable={false}
        />
        <Button
          title="Push to the End of Backlog"
          type="primary"
          style={styles.button}
          onPress={onPushToTheEndPressed}
        />
        <Button
          title="Mark as Mined"
          type="danger"
          style={styles.button}
          onPress={onMarkAsMinedPressed}
        />
      </View>
    </PropertySheet>
  );
});

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: 'column',
    alignItems: 'stretch',
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  sentenceInput: {
    maxHeight: 79,
    minHeight: 79,
  },
  tagsInput: {
    marginTop: 15,
  },
  button: {
    marginTop: 15,
  },
});

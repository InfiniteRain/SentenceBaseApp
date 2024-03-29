import {BottomSheetModal} from '@gorhom/bottom-sheet';
import React, {forwardRef, useCallback, useEffect, useState} from 'react';
import {Alert, Keyboard, StyleSheet, View} from 'react-native';
import {SbSentence} from '../../../types';
import {BottomSheetLabeledTextInput} from '../../elements/BottomSheetLabeledTextInput';
import {Button} from '../../elements/Button';
import {PropertySheet} from '../../elements/PropertySheet';

type EditSheetProps = {
  sentence: SbSentence;
  onDelete: (sentence: string) => void;
  onEdit: (sentenceId: string, sentence: string, tags: string[]) => void;
  // todo: sentence: SbSentence?
};

export const EditSheet = forwardRef<BottomSheetModal, EditSheetProps>(
  (props, ref) => {
    const castedRef = ref as React.RefObject<BottomSheetModal>;

    const [sentence, setSentence] = useState('');
    const [tags, setTags] = useState<string[]>([]);

    useEffect(() => {
      setSentence(props.sentence.sentence);
      setTags(props.sentence.tags);
    }, [props]);

    const onEditButtonPressed = useCallback(() => {
      castedRef.current?.close();
      props.onEdit(props.sentence.sentenceId, sentence.trim(), [
        ...new Set(tags),
      ]);
    }, [castedRef, props, sentence, tags]);
    const onDeleteButtonPressed = useCallback(() => {
      Alert.alert('Delete this sentence?', 'This action cannot be reversed.', [
        {
          text: 'Yes',
          onPress() {
            Keyboard.dismiss();
            castedRef.current?.close();
            props.onDelete(props.sentence.sentenceId);
          },
          style: 'destructive',
        },
        {
          text: 'No',
        },
      ]);
    }, [castedRef, props]);

    return (
      <PropertySheet ref={ref}>
        <View style={styles.mainContainer}>
          <BottomSheetLabeledTextInput
            label="Sentence"
            containerStyle={styles.sentenceInput}
            multiline
            numberOfLines={2}
            onChangeText={setSentence}
            blurOnSubmit
            defaultValue={props.sentence.sentence}
          />
          <BottomSheetLabeledTextInput
            label="Tags (separated by space)"
            containerStyle={styles.tagsInput}
            onChangeText={value => setTags(value.split(/\s+/))}
            defaultValue={props.sentence.tags.join(' ')}
          />
          <Button
            title="Edit"
            type="primary"
            style={styles.button}
            onPress={onEditButtonPressed}
          />
          <Button
            title="Delete"
            type="danger"
            style={styles.button}
            onPress={onDeleteButtonPressed}
          />
        </View>
      </PropertySheet>
    );
  },
);

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

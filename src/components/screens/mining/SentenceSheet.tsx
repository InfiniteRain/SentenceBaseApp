import {BottomSheetModal} from '@gorhom/bottom-sheet';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {Keyboard, StyleSheet, View} from 'react-native';
import {Button} from 'react-native-paper';
import {BottomSheetLabeledTextInput} from '../../elements/BottomSheetLabeledTextInput';
import {PropertySheet} from '../../elements/PropertySheet';

type SentenceSheetProps = {
  sentence: string;
  dictionaryForm: string;
  reading: string;
  onEdit: (sentence: string, dictionaryForm: string, reading: string) => void;
  onChangeIndex?: (index: number) => void;
};

export const SentenceSheet = forwardRef<BottomSheetModal, SentenceSheetProps>(
  (props, ref) => {
    const castedRef = ref as React.RefObject<BottomSheetModal>;

    const [sentence, setSentence] = useState('');
    const [dictionaryForm, setDictionaryForm] = useState('');
    const [reading, setReading] = useState('');

    const snapPoints = useMemo(() => ['35%'], []);

    useEffect(() => {
      setSentence(props.sentence);
      setDictionaryForm(props.dictionaryForm);
      setReading(props.reading);
    }, [props]);

    const onConfirm = useCallback(() => {
      props.onEdit(sentence, dictionaryForm, reading);
      Keyboard.dismiss();
      castedRef.current?.close();
    }, [props, castedRef, sentence, dictionaryForm, reading]);

    return (
      <PropertySheet
        ref={ref}
        snapPoints={snapPoints}
        onChange={props.onChangeIndex}>
        <View style={styles.mainView}>
          <BottomSheetLabeledTextInput
            label="Sentence"
            containerStyle={styles.sentenceInput}
            multiline
            numberOfLines={2}
            onChangeText={setSentence}
            blurOnSubmit
            defaultValue={props.sentence}
          />
          <View style={styles.secondaryView}>
            <View style={styles.secondaryInputView}>
              <BottomSheetLabeledTextInput
                label="Word"
                containerStyle={styles.wordInput}
                defaultValue={props.dictionaryForm}
                onChangeText={setDictionaryForm}
              />
            </View>
            <View style={styles.secondaryInputView}>
              <BottomSheetLabeledTextInput
                label="Reading"
                containerStyle={styles.readingInput}
                defaultValue={props.reading}
                onChangeText={setReading}
              />
            </View>
          </View>
          <Button
            mode="contained"
            onPress={onConfirm}
            style={styles.confirmButton}
            disabled={sentence.length === 0}>
            Confirm
          </Button>
        </View>
      </PropertySheet>
    );
  },
);

const styles = StyleSheet.create({
  mainView: {
    flexDirection: 'column',
    alignItems: 'stretch',
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  secondaryView: {
    flexDirection: 'row',
  },
  sentenceInput: {
    maxHeight: 79,
    minHeight: 79,
  },
  secondaryInputView: {
    flex: 1,
  },
  wordInput: {
    marginTop: 15,
    marginRight: 7.5,
  },
  readingInput: {
    marginTop: 15,
    marginLeft: 7.5,
  },
  confirmButton: {
    marginTop: 15,
    justifyContent: 'center',
    height: 44,
  },
});

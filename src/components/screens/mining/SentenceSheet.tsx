import {BottomSheetModal, BottomSheetTextInput} from '@gorhom/bottom-sheet';
import React, {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {Keyboard, StyleSheet, View} from 'react-native';
import {Button} from 'react-native-paper';
import {ThemeContext} from '../../../contexts/theme';
import {colors} from '../../../shared';
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

    const {theme} = useContext(ThemeContext);

    const [sentence, setSentence] = useState('');
    const [dictionaryForm, setDictionaryForm] = useState('');
    const [reading, setReading] = useState('');

    const snapPoints = useMemo(() => ['31%'], []);

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
          <BottomSheetTextInput
            style={{
              ...styles.primaryInput,
              ...{
                color: theme.colors.onSurface,
              },
            }}
            autoCapitalize="none"
            placeholder="Sentence"
            autoCorrect={false}
            multiline
            numberOfLines={2}
            onChangeText={setSentence}
            blurOnSubmit
            defaultValue={props.sentence}
            placeholderTextColor={theme.colors.placeholder}
          />
          <View style={styles.secondaryView}>
            <View style={styles.secondaryInputView}>
              <BottomSheetTextInput
                style={{
                  ...styles.secondaryInput,
                  ...{
                    color: theme.colors.onSurface,
                    marginRight: 7.5,
                  },
                }}
                autoCapitalize="none"
                placeholder="Word"
                autoCorrect={false}
                defaultValue={props.dictionaryForm}
                onChangeText={setDictionaryForm}
                placeholderTextColor={theme.colors.placeholder}
              />
            </View>
            <View style={styles.secondaryInputView}>
              <BottomSheetTextInput
                style={{
                  ...styles.secondaryInput,
                  ...{
                    color: theme.colors.onSurface,
                    marginLeft: 7.5,
                  },
                }}
                autoCapitalize="none"
                placeholder="Reading"
                autoCorrect={false}
                defaultValue={props.reading}
                onChangeText={setReading}
                placeholderTextColor={theme.colors.placeholder}
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

const inputStyle = {
  borderRadius: 10,
  fontSize: 16,
  lineHeight: 20,
  paddingHorizontal: 8,
  paddingTop: 12,
  paddingBottom: 12,
  minHeight: 44,
  backgroundColor: colors.input,
};

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
  primaryInput: {
    ...inputStyle,
    maxHeight: 69,
    minHeight: 69,
  },
  secondaryInputView: {
    flex: 1,
  },
  secondaryInput: {
    ...inputStyle,
    marginTop: 15,
  },
  confirmButton: {
    marginTop: 15,
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
  },
});

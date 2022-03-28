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

type EditSheetProps = {
  sentence: string;
  tags: string[];
  onEdit: (sentence: string, tags: string[]) => void;
  onChangeIndex?: (index: number) => void;
};

export const EditSheet = forwardRef<BottomSheetModal, EditSheetProps>(
  (props, ref) => {
    const castedRef = ref as React.RefObject<BottomSheetModal>;

    const {theme} = useContext(ThemeContext);

    const [sentence, setSentence] = useState('');
    const [tags, setTags] = useState<string[]>([]);

    const snapPoints = useMemo(() => ['39%'], []);

    useEffect(() => {
      setSentence(props.sentence);
      setTags(props.tags);
    }, [props]);

    const onConfirm = useCallback(() => {
      props.onEdit(sentence, tags);
      Keyboard.dismiss();
      castedRef.current?.close();
    }, [props, castedRef, sentence, tags]);

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
          <BottomSheetTextInput
            style={{
              ...styles.secondaryInput,
              ...{
                color: theme.colors.onSurface,
              },
            }}
            autoCapitalize="none"
            placeholder="Tags"
            autoCorrect={false}
            onChangeText={value => setTags(value.split(/\s+/))}
            defaultValue={props.tags.join(' ')}
            placeholderTextColor={theme.colors.placeholder}
          />
          <Button mode="contained" onPress={onConfirm} style={styles.button}>
            Confirm
          </Button>
          <Button
            mode="contained"
            onPress={onConfirm}
            style={styles.button}
            color={theme.colors.notification}>
            Delete
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
  primaryInput: {
    ...inputStyle,
    maxHeight: 69,
    minHeight: 69,
  },
  secondaryInput: {
    ...inputStyle,
    marginTop: 15,
  },
  button: {
    marginTop: 15,
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
  },
});

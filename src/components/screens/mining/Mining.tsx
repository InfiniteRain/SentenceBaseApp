import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {Button, Caption, Chip, Divider, Text} from 'react-native-paper';
import {ThemeContext} from '../../../contexts/theme';
import {useQuery} from 'react-query';
import {kotuQuery} from '../../../queries';
import {Morpheme} from '../../../types';
import Clipboard from '@react-native-clipboard/clipboard';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import {useAsyncStorage} from '../../../hooks/use-async-storage';
import {TagsBottomSheet} from './TagsBottomSheet';
import {HeaderButtonContext} from '../../../contexts/header-button-context';
import {useClipboard} from '../../../hooks/use-clipboard';

export const Mining = () => {
  const {theme} = useContext(ThemeContext);
  const {setOnClear, setOnPaste, setClearDisabled, setPasteDisabled} =
    useContext(HeaderButtonContext);

  const [morphemes, setMorphemes] = useState<Morpheme[]>([]);
  const [selectedMorpheme, setSelectedMorpheme] = useState<Morpheme | null>(
    null,
  );
  const [kotuString, setKotuString] = useState('');

  const [tags, updateTags] = useAsyncStorage<string[]>('tags', []);

  const clipboardEntry = useClipboard();

  const {data: morphemeQueryData, status: morphemeQueryStatus} = useQuery(
    ['kotu', kotuString],
    () => kotuQuery(kotuString),
    {enabled: kotuString !== ''},
  );

  const tagsBottomSheetRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    setKotuString(clipboardEntry);
  }, [clipboardEntry]);

  useEffect(() => {
    setOnClear(() => () => {
      setMorphemes([]);
      setSelectedMorpheme(null);
    });

    setOnPaste(() => async () => {
      setKotuString('');
      setKotuString(await Clipboard.getString());
      setSelectedMorpheme(null);
    });
  }, [setOnClear, setOnPaste]);

  useEffect(() => {
    setMorphemes(previousData => morphemeQueryData ?? previousData);
    setSelectedMorpheme(null);
  }, [morphemeQueryData]);

  useEffect(() => {
    setClearDisabled(morphemes.length === 0);
  }, [morphemes, setClearDisabled]);

  useEffect(() => {
    setPasteDisabled(morphemeQueryStatus === 'loading');
  }, [morphemeQueryStatus, setPasteDisabled]);

  const morphemeStyle = useMemo(
    () => ({
      color:
        selectedMorpheme === null
          ? theme.colors.disabled
          : theme.colors.primary,
    }),
    [selectedMorpheme, theme],
  );
  const guideSteps = useMemo(
    () => [
      'If on a tablet, use split screen',
      'Copy some text outside the app',
      'Select a word',
      'Mine the sentence',
    ],
    [],
  );

  const onAddTagButtonPressed = useCallback(() => {
    tagsBottomSheetRef.current?.present();
  }, []);

  const onDeleteTagButtonPressed = useCallback(
    (key: number) => {
      updateTags(currentTag => currentTag.filter((_, index) => index !== key));
    },
    [updateTags],
  );

  return (
    <>
      <ScrollView contentContainerStyle={styles.mainView}>
        <TouchableOpacity disabled={selectedMorpheme === null}>
          <View style={styles.selectedMorphemeView}>
            <Text
              style={{
                ...styles.selectedMorphemeDictionaryForm,
                ...morphemeStyle,
              }}
              numberOfLines={1}
              adjustsFontSizeToFit>
              「{selectedMorpheme?.dictionaryForm ?? 'Word'}」
            </Text>
            <Text
              style={{...styles.selectedMorphemeReading, ...morphemeStyle}}
              numberOfLines={1}
              adjustsFontSizeToFit>
              「{selectedMorpheme?.reading ?? 'Reading'}」
            </Text>
          </View>
        </TouchableOpacity>
        <Divider style={styles.divider} />
        {morphemes.length > 0 ? (
          <View style={styles.wordView}>
            {morphemes.map((morpheme, index) => (
              <TouchableOpacity
                key={index}
                style={{
                  ...styles.wordTouchableOpacity,
                  ...{backgroundColor: theme.colors.surface},
                }}
                onPress={() => setSelectedMorpheme(morpheme)}>
                <Text style={styles.wordText}>{morpheme.surface}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.guideView}>
            {guideSteps.map((stepText, index) => (
              <Caption key={index} style={styles.guideText}>
                {index + 1}. {stepText}
              </Caption>
            ))}
          </View>
        )}
      </ScrollView>
      <View style={styles.tagChipView}>
        {tags.map((tag, index) => (
          <Chip
            key={index}
            mode="outlined"
            style={styles.tagChip}
            onClose={() => onDeleteTagButtonPressed(index)}>
            {tag}
          </Chip>
        ))}
        <Chip
          mode="outlined"
          style={styles.tagChip}
          icon="plus"
          onPress={onAddTagButtonPressed}>
          Add Tag
        </Chip>
      </View>
      <Button
        mode="contained"
        style={styles.mineSentenceButton}
        color={theme.colors.primary}
        disabled={selectedMorpheme === null}>
        Mine Sentence
      </Button>
      <TagsBottomSheet ref={tagsBottomSheetRef} updateTags={updateTags} />
    </>
  );
};

const styles = StyleSheet.create({
  mainView: {
    flex: 1,
    flexDirection: 'column',
    alignContent: 'stretch',
    alignItems: 'stretch',
    paddingTop: 15,
  },
  selectedMorphemeView: {
    alignItems: 'center',
  },
  selectedMorphemeDictionaryForm: {
    fontSize: 48,
  },
  selectedMorphemeReading: {
    fontSize: 24,
  },
  divider: {
    marginTop: 15,
  },
  guideView: {
    flexGrow: 1,
    alignSelf: 'center',
    justifyContent: 'center',
    //paddingTop: 15,
  },
  guideText: {
    fontSize: 13,
    paddingHorizontal: 10,
  },
  wordView: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingBottom: 5,
    marginTop: 15,
    justifyContent: 'space-around',
    alignContent: 'space-around',
  },
  wordTouchableOpacity: {
    shadowOpacity: 0.1,
    shadowOffset: {
      width: 2,
      height: 2,
    },
    elevation: 5,
    padding: 5,
    margin: 5,
    borderRadius: 5,
  },
  wordText: {
    fontSize: 24,
  },
  tagChipView: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    padding: 10,
  },
  tagChip: {
    marginRight: 5,
    marginBottom: 5,
    shadowOpacity: 0,
  },
  mineSentenceButton: {
    marginHorizontal: 15,
    marginBottom: 15,
    height: 44,
    justifyContent: 'center',
  },
});

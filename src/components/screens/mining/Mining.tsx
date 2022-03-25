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
import {TagsSheet} from './TagsSheet';
import {HeaderButtonContext} from '../../../contexts/header-button-context';
import {useClipboard} from '../../../hooks/use-clipboard';
import DeviceInfo from 'react-native-device-info';
import {SentenceSheet} from './SentenceSheet';

const isTablet = DeviceInfo.isTablet();

export const Mining = () => {
  const {theme} = useContext(ThemeContext);
  const {
    setOnClear,
    setOnPaste,
    setOnEdit,
    setClearDisabled,
    setPasteDisabled,
    setEditDisabled,
  } = useContext(HeaderButtonContext);

  const [morphemes, setMorphemes] = useState<Morpheme[]>([]);
  const [selectedMorpheme, setSelectedMorpheme] = useState<Morpheme | null>(
    null,
  );
  const [isMorphemeEdited, setMorphemeEdited] = useState<boolean>(false);
  const [kotuString, setKotuString] = useState('');
  const [clipboardEnabled, setClipboardEnabled] = useState(true);
  const [tagsSheetIndex, setTagsSheetIndex] = useState(-1);
  const [sentenceSheetIndex, setSentenceSheetIndex] = useState(-1);

  const [tags, updateTags] = useAsyncStorage<string[]>('tags', []);

  const clipboardEntry = useClipboard({enabled: clipboardEnabled});

  const {data: morphemeQueryData, status: morphemeQueryStatus} = useQuery(
    ['kotu', kotuString],
    () => kotuQuery(kotuString),
    {enabled: kotuString !== ''},
  );

  const tagsSheetRef = useRef<BottomSheetModal>(null);
  const sentenceSheetRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    setMorphemeEdited(false);
    setKotuString(clipboardEntry.trim());
  }, [clipboardEntry]);
  useEffect(() => {
    setOnClear(() => () => {
      setKotuString('');
      setMorphemes([]);
      setSelectedMorpheme(null);
      setMorphemeEdited(false);
    });
    setOnPaste(() => async () => {
      setKotuString('');
      setKotuString((await Clipboard.getString()).trim());
      setSelectedMorpheme(null);
      setMorphemeEdited(false);
    });
    setOnEdit(() => () => {
      sentenceSheetRef.current?.present?.();
    });
  }, [setOnClear, setOnPaste, setOnEdit]);
  useEffect(() => {
    setMorphemes(previousData => morphemeQueryData ?? previousData);
    if (!isMorphemeEdited) {
      setSelectedMorpheme(null);
    }
  }, [morphemeQueryData, isMorphemeEdited]);
  useEffect(() => {
    setClearDisabled(morphemes.length === 0);
    setEditDisabled(morphemes.length === 0);
  }, [morphemes, setClearDisabled, setEditDisabled]);
  useEffect(() => {
    setPasteDisabled(morphemeQueryStatus === 'loading');
  }, [morphemeQueryStatus, setPasteDisabled]);
  useEffect(() => {
    setClipboardEnabled(tagsSheetIndex === -1 && sentenceSheetIndex === -1);
  }, [tagsSheetIndex, sentenceSheetIndex]);

  const morphemeStyle = useMemo(
    () => ({
      color:
        selectedMorpheme === null
          ? theme.colors.disabled
          : theme.colors.onSurface,
    }),
    [selectedMorpheme, theme],
  );
  const guideSteps = useMemo(
    () => [
      ...(isTablet ? ['Use split screen'] : []),
      'Copy some text outside the app',
      ...(!isTablet ? ['Paste it here'] : []),
      'Select a word',
      'Mine the sentence',
    ],
    [],
  );

  const onAddTagButtonPressed = useCallback(() => {
    tagsSheetRef.current?.present();
  }, []);
  const onDeleteTagButtonPressed = useCallback(
    (key: number) => {
      updateTags(currentTags =>
        currentTags.filter((_, index) => index !== key),
      );
    },
    [updateTags],
  );
  const onAddTag = useCallback(
    (tagsToAdd: string[]) => {
      updateTags(currentTags => [
        ...currentTags.filter(entry => !tagsToAdd.includes(entry)),
        ...tagsToAdd,
      ]);
    },
    [updateTags],
  );
  const onEditSentence = useCallback(
    (sentence: string, dictionaryForm: string, reading: string) => {
      setSelectedMorpheme(
        dictionaryForm !== '' && reading !== ''
          ? {
              surface: '',
              dictionaryForm,
              reading,
            }
          : null,
      );

      if (sentence !== kotuString) {
        setMorphemeEdited(true);
        setKotuString(sentence);
      }
    },
    [kotuString],
  );

  return (
    <>
      <ScrollView contentContainerStyle={styles.mainView}>
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
                onPress={() => setSelectedMorpheme({...morpheme})}>
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
      <TagsSheet
        ref={tagsSheetRef}
        onAdd={onAddTag}
        onChange={setTagsSheetIndex}
      />
      <SentenceSheet
        ref={sentenceSheetRef}
        onChangeIndex={setSentenceSheetIndex}
        onEdit={onEditSentence}
        sentence={kotuString}
        dictionaryForm={selectedMorpheme?.dictionaryForm ?? ''}
        reading={selectedMorpheme?.reading ?? ''}
      />
    </>
  );
};

const styles = StyleSheet.create({
  mainView: {
    flexGrow: 1,
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

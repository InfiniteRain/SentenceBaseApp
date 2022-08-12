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
import {Chip} from '../../elements/Chip';
import {LayoutContext} from '../../../contexts/layout-context';
import {useMutation, useQuery} from '@tanstack/react-query';
import {addSentence, kotuQuery} from '../../../queries';
import {Morpheme} from '../../../types';
import Clipboard from '@react-native-clipboard/clipboard';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import {useAsyncStorage} from '../../../hooks/use-async-storage';
import {TagsSheet} from './TagsSheet';
import {HeaderButtonContext} from '../../../contexts/header-button-context';
import {useClipboard} from '../../../hooks/use-clipboard';
import DeviceInfo from 'react-native-device-info';
import {SentenceSheet} from './SentenceSheet';
import Toast from 'react-native-toast-message';
import {useIsFocused} from '@react-navigation/native';
import {Button} from '../../elements/Button';
import {Caption} from '../../elements/Caption';
import {Text} from '../../elements/Text';
import {Divider} from '../../elements/Divider';

const isTablet = DeviceInfo.isTablet();
const filterRegex =
  /^“([^”]+)”\n\n\w+ \w+\n[^\n]+\n[^\n]+\n\w+ \w+ \w+ \w+ \w+ \w+ \w+.$/;
const proccessClipboardEntry = (entry: string): string => {
  entry = entry.trim();
  entry = entry.match(filterRegex)?.[1] ?? entry;
  return entry.replace(/\s+/g, '　');
};

export const Mining = () => {
  const {theme} = useContext(LayoutContext);
  const {
    onClear,
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
  const [isClipboardEnabled, setClipboardEnabled] = useState(true);
  const [tagsSheetIndex, setTagsSheetIndex] = useState(-1);
  const [sentenceSheetIndex, setSentenceSheetIndex] = useState(-1);

  const isFocused = useIsFocused();

  const [tags, updateTags] = useAsyncStorage<string[]>('tags', []);

  const clipboardEntry = useClipboard({
    enabled: isClipboardEnabled && isFocused,
  });

  const {data: kotuData, status: kotuStatus} = useQuery(
    ['kotu', kotuString],
    () => kotuQuery(kotuString),
    {enabled: kotuString !== ''},
  );

  const {mutate: addSentenceMutation, status: addSentenceStatus} = useMutation(
    (params: {
      dictionaryForm: string;
      reading: string;
      sentence: string;
      tags: string[];
    }) =>
      addSentence(
        params.dictionaryForm,
        params.reading,
        params.sentence,
        params.tags,
      ),
  );

  const tagsSheetRef = useRef<BottomSheetModal>(null);
  const sentenceSheetRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    setMorphemeEdited(false);
    setKotuString(proccessClipboardEntry(clipboardEntry));
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
      setKotuString(proccessClipboardEntry(await Clipboard.getString()));
      setSelectedMorpheme(null);
      setMorphemeEdited(false);
    });
    setOnEdit(() => () => {
      sentenceSheetRef.current?.present?.();
    });
  }, [setOnClear, setOnPaste, setOnEdit]);
  useEffect(() => {
    if (!kotuData) {
      return;
    }

    setMorphemes(kotuData);
    if (!isMorphemeEdited) {
      setSelectedMorpheme(null);
    }
  }, [kotuData, isMorphemeEdited]);
  useEffect(() => {
    setClearDisabled(morphemes.length === 0);
    setEditDisabled(morphemes.length === 0);
  }, [morphemes, setClearDisabled, setEditDisabled]);
  useEffect(() => {
    setPasteDisabled(kotuStatus === 'loading' && kotuString !== '');
  }, [kotuStatus, setPasteDisabled, kotuString]);
  useEffect(() => {
    setClipboardEnabled(tagsSheetIndex === -1 && sentenceSheetIndex === -1);
  }, [tagsSheetIndex, sentenceSheetIndex]);

  const morphemeStyle = useMemo(
    () => ({
      color:
        selectedMorpheme === null
          ? theme.colors.disabledText
          : theme.colors.surfaceText,
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
              surfaceReading: '',
              dictionaryForm,
              dictionaryFormReading: reading,
              pitchAccents: [],
              isBasic: false,
              partOfSpeech: '',
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
  const onMineSentence = useCallback(() => {
    const dictionaryForm = selectedMorpheme?.dictionaryForm ?? '';
    const reading = selectedMorpheme?.dictionaryFormReading ?? '';
    const sentence = kotuString;

    addSentenceMutation(
      {
        dictionaryForm,
        reading,
        sentence,
        tags,
      },
      {
        onError: () => {
          Toast.show({
            type: 'error',
            text1: 'Failed to add the sentence.',
            text2: 'Press this notification to restore the sentence.',
            position: 'top',
            visibilityTime: 10000,
            onPress: () => {
              setMorphemeEdited(true);
              setSelectedMorpheme({
                surface: '',
                surfaceReading: '',
                dictionaryForm,
                dictionaryFormReading: reading,
                pitchAccents: [],
                isBasic: false,
                partOfSpeech: '',
              });
              setKotuString(sentence);
              Toast.hide();
            },
          });
        },
      },
    );
    onClear?.();
  }, [addSentenceMutation, kotuString, selectedMorpheme, tags, onClear]);

  return (
    <>
      <ScrollView contentContainerStyle={styles.mainView}>
        <View style={styles.selectedMorphemeView}>
          <Text
            style={[styles.selectedMorphemeDictionaryForm, morphemeStyle]}
            numberOfLines={1}
            adjustsFontSizeToFit>
            「{selectedMorpheme?.dictionaryForm ?? 'Word'}」
          </Text>
          <Text
            style={[styles.selectedMorphemeReading, morphemeStyle]}
            numberOfLines={1}
            adjustsFontSizeToFit>
            「{selectedMorpheme?.dictionaryFormReading ?? 'Reading'}」
          </Text>
        </View>
        <Divider style={styles.divider} />
        {morphemes.length > 0 ? (
          <View style={styles.wordView}>
            {morphemes.map((morpheme, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.wordTouchableOpacity,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.surfaceBorder,
                  },
                ]}
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
            style={styles.tagChip}
            onClose={() => onDeleteTagButtonPressed(index)}>
            {tag}
          </Chip>
        ))}
        <Chip
          style={styles.tagChip}
          icon="plus"
          onPress={onAddTagButtonPressed}>
          Add Tag
        </Chip>
      </View>
      <Button
        title="Mine Sentence"
        type="primary"
        loading={addSentenceStatus === 'loading'}
        disabled={selectedMorpheme === null || addSentenceStatus === 'loading'}
        style={styles.mineSentenceButton}
        onPress={onMineSentence}
      />
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
        reading={selectedMorpheme?.dictionaryFormReading ?? ''}
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
    elevation: 5,
    padding: 5,
    margin: 5,
    borderRadius: 5,
    borderWidth: StyleSheet.hairlineWidth,
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
  },
});

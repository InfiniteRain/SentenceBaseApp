import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  NativeEventEmitter,
  NativeModules,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {Page, AppStateContext} from '../app-state-context';
import {colors} from '../common';
import Toast from 'react-native-toast-message';
import functions from '@react-native-firebase/functions';
import {getStorageItem, setStorageItem} from '../storage';
import Clipboard from '@react-native-clipboard/clipboard';

interface Morpheme {
  word: string;
  dictionary_form: string;
  reading: string;
}

const TAGS_KEY = 'tags';

const addSentence = functions().httpsCallable('addSentence');

const filterRegex =
  /^“([^”]+)”\n\nExcerpt From\n[^\n]+\n[^\n]+\nThis material may be protected by copyright.$/;

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 0,
  },
  pasteFromClipboardButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    margin: 7,
    marginTop: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  pasteFromClipboardButton: {
    color: colors.white,
  },
  backButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
    marginBottom: 50,
  },
  backButton: {
    color: colors.primary,
  },
  inputView: {
    backgroundColor: '#EEEEEE',
    borderRadius: 5,
    width: '80%',
    height: 45,
    alignItems: 'center',
    marginTop: 10,
  },
  tagsInputView: {
    marginBottom: 30,
  },
  input: {
    height: 50,
    flex: 1,
    padding: 10,
    fontSize: 30,
    color: '#000000',
  },
  tagsInput: {
    fontSize: 15,
  },
  wordTouchableOpacity: {
    marginLeft: 5,
    marginRight: 5,
  },
  wordTextView: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    justifyContent: 'space-between',
    alignContent: 'space-between',
  },
  wordText: {
    color: colors.primary,
    fontSize: 24,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: colors.primary,
    padding: 4,
    marginBottom: 10,
  },
  mineButton: {
    margin: 15,
  },
  mineButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
});

export const Mining = () => {
  const {isLoading, setLoading, setCurrentPage, setBatch, mecabQuery} =
    useContext(AppStateContext);

  const [currentMorphemes, setCurrentMorphemes] = useState<Morpheme[]>([]);
  const [currentDictionaryForm, setCurrentDictionaryForm] = useState('');
  const [currentReading, setCurrentReading] = useState('');
  const [tags, setTags] = useState('');

  const isLoadingRef = useRef<boolean>(false);

  isLoadingRef.current = isLoading;

  const onBack = () => {
    setCurrentPage(Page.MainMenu);
  };

  const onMine = async () => {
    const currentSentence = currentMorphemes
      .map(morpheme => morpheme.word)
      .join('');

    if (!currentDictionaryForm || !currentReading || !currentSentence) {
      return;
    }

    setLoading(true);

    try {
      await addSentence({
        dictionaryForm: currentDictionaryForm,
        reading: currentReading,
        sentence: currentSentence,
        tags: tags.split(/\s+/),
      });

      setCurrentMorphemes([]);
      setCurrentDictionaryForm('');
      setCurrentReading('');
      setBatch([]);

      Toast.show({
        type: 'success',
        text1: 'Mined!',
        text2: 'The sentence was successfully added to the pending list.',
        position: 'bottom',
      });
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Something went wrong.',
        position: 'bottom',
      });
    }

    setLoading(false);
  };

  const onPaste = async () => {
    const text = await Clipboard.getString();
    await analyzeSentence(text);
  };

  const saveTags = async () => {
    const currentTags = tags.trim().split(/\s+/).join(' ');

    await setStorageItem(TAGS_KEY, currentTags);
    setTags(currentTags);
  };

  const analyzeSentence = async (sentence: string) => {
    const filteredSentence = sentence.match(filterRegex)?.[1];
    const mecabResult = await mecabQuery(filteredSentence || sentence);
    const morphemes: Morpheme[] = [];

    for (const entry of mecabResult) {
      const dictionaryFormReading =
        entry.dictionary_form !== '*'
          ? (await mecabQuery(entry.dictionary_form))[0].reading ?? entry.word
          : entry.word;

      morphemes.push({
        word: entry.word,
        dictionary_form:
          entry.dictionary_form !== '*' ? entry.dictionary_form : entry.word,
        reading: dictionaryFormReading,
      });
    }

    setCurrentDictionaryForm('');
    setCurrentReading('');
    setCurrentMorphemes(morphemes);
  };

  useEffect(() => {
    const eventEmitter = new NativeEventEmitter(
      NativeModules.ClipboardListener,
    );
    eventEmitter.addListener(
      'clipboardUpdate',
      async (clipboardEntry: string) => {
        if (isLoadingRef.current) {
          return;
        }

        if (clipboardEntry !== '') {
          await analyzeSentence(clipboardEntry);
        }
      },
    );

    getStorageItem(TAGS_KEY).then(value => {
      if (typeof value !== 'string') {
        return;
      }

      setTags(value);
    });

    return () => {
      eventEmitter.removeAllListeners('clipboardUpdate');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mecabQuery]);

  return (
    <>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior="padding">
        <View style={styles.backButtonContainer}>
          <TouchableOpacity onPress={onBack} disabled={isLoading}>
            <Text style={styles.backButton}>Back to Menu</Text>
          </TouchableOpacity>
        </View>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView>
            <View style={styles.mainContainer}>
              <TouchableOpacity
                style={[
                  styles.mineButtonContainer,
                  {
                    backgroundColor:
                      currentDictionaryForm === '' ||
                      currentReading === '' ||
                      currentMorphemes.length === 0
                        ? colors.grey
                        : colors.primary,
                  },
                ]}
                onPress={onMine}
                disabled={
                  currentDictionaryForm === '' ||
                  currentReading === '' ||
                  currentMorphemes.length === 0 ||
                  isLoading
                }>
                <Text
                  style={[
                    styles.mineButton,
                    {
                      color: colors.white,
                    },
                  ]}>
                  Mine Current Sentence
                </Text>
              </TouchableOpacity>
              <View style={[styles.inputView, styles.tagsInputView]}>
                <TextInput
                  autoCapitalize="none"
                  placeholderTextColor={colors.dark}
                  value={tags}
                  onChangeText={setTags}
                  onEndEditing={saveTags}
                  editable={!isLoading}
                  style={[styles.input, styles.tagsInput]}
                />
              </View>
              <View style={styles.inputView}>
                <TextInput
                  autoCapitalize="none"
                  placeholderTextColor={colors.dark}
                  value={currentDictionaryForm}
                  onChangeText={setCurrentDictionaryForm}
                  editable={currentMorphemes.length > 0 && !isLoading}
                  style={styles.input}
                />
              </View>
              <View style={styles.inputView}>
                <TextInput
                  autoCapitalize="none"
                  placeholderTextColor={colors.dark}
                  value={currentReading}
                  onChangeText={setCurrentReading}
                  editable={currentMorphemes.length > 0 && !isLoading}
                  style={styles.input}
                />
              </View>
              <View style={styles.pasteFromClipboardButtonContainer}>
                <TouchableOpacity disabled={isLoading} onPress={onPaste}>
                  <Text style={styles.pasteFromClipboardButton}>
                    Paste From Clipboard
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.wordTextView}>
                {[...currentMorphemes.entries()].map(([key, morpheme]) => (
                  <TouchableOpacity
                    key={key}
                    style={styles.wordTouchableOpacity}
                    onPress={() => {
                      setCurrentDictionaryForm(morpheme.dictionary_form);
                      setCurrentReading(morpheme.reading);
                      Keyboard.dismiss();
                    }}
                    disabled={isLoading}>
                    <Text style={styles.wordText}>{morpheme.word}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </>
  );
};

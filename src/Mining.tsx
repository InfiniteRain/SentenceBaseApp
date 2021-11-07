import CheckBox from '@react-native-community/checkbox';
import Clipboard from '@react-native-community/clipboard';
import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useColorScheme,
  View,
} from 'react-native';
import {AppState, AppStateContext} from './AppStateContext';
import {colors} from './Colors';
import {sendEnsuredRequest, StandardResponse} from './Networking';
import Toast from 'react-native-toast-message';

interface Morpheme {
  morpheme: string;
  dictionary_form: string;
  reading: string;
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 0,
  },
  clipboardCheckboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
  },

  clipboardCheckbox: {
    alignSelf: 'center',
  },
  clipboardCheckboxLabel: {
    margin: 8,
    fontSize: 16,
  },
  backButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    marginBottom: 50,
  },
  backButton: {
    color: colors.primary,
  },
  wordInputView: {
    backgroundColor: '#EEEEEE',
    borderRadius: 5,
    width: '80%',
    height: 45,
    marginTop: 40,
    alignItems: 'center',
    margin: 20,
  },
  readingInputView: {
    backgroundColor: '#EEEEEE',
    borderRadius: 5,
    width: '80%',
    height: 45,
    alignItems: 'center',
    margin: 20,
  },
  input: {
    height: 50,
    flex: 1,
    padding: 10,
    fontSize: 30,
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
  const isDarkMode = useColorScheme() === 'dark';

  const {setAppState} = useContext(AppStateContext);

  const [isLoading, setLoading] = useState(false);
  const [currentMorphemes, setCurrentMorphemes] = useState<Morpheme[]>([]);
  const [currentDictionaryForm, setCurrentDictionaryForm] = useState('');
  const [currentReading, setCurrentReading] = useState('');
  const [isScanningClipboard, setScanningClipboard] = useState(true);

  const scanningRef = useRef<boolean>();
  const miningDataRef =
    useRef<{dictionary_form: string; reading: string; sentence: string}>();

  scanningRef.current = isScanningClipboard;
  miningDataRef.current = {
    dictionary_form: currentDictionaryForm,
    reading: currentReading,
    sentence: currentMorphemes.map(morpheme => morpheme.morpheme).join(''),
  };

  const onBack = () => {
    setAppState(AppState.UserMenu);
  };

  const onMine = async () => {
    let miningData = miningDataRef.current;

    if (!miningData) {
      return;
    }

    setLoading(true);

    let response: StandardResponse;
    try {
      response = await sendEnsuredRequest<{
        dictionary_form: string;
        reading: string;
        sentence: string;
      }>('/sentences', 'post', {
        dictionary_form: miningData.dictionary_form,
        reading: miningData.reading,
        sentence: miningData.sentence,
      });
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Network error.',
      });
      setLoading(false);
      return;
    }

    setCurrentMorphemes([]);
    setCurrentDictionaryForm('');
    setCurrentReading('');

    if (response.status === 'fail' || response.status === 'error') {
      Toast.show({
        type: 'error',
        text1: 'Something went wrong.',
        position: 'bottom',
      });
      return;
    }

    console.log(JSON.stringify(response, null, 2));
    Toast.show({
      type: 'success',
      text1: 'Mined!',
      text2: 'The sentence was successfully added to the pending list.',
      position: 'bottom',
    });

    setLoading(false);
  };

  const analyzeSentence = async (sentence: string) => {
    let response = await sendEnsuredRequest<
      {sentence: string},
      {
        morphemes: Morpheme[];
      }
    >('/analyze', 'post', {
      sentence,
    });

    if (response.status === 'success') {
      setCurrentDictionaryForm('');
      setCurrentReading('');
      setCurrentMorphemes(response.data.morphemes);
    }
  };

  useEffect(() => {
    const clipboardInterval = setInterval(async () => {
      if (!scanningRef.current) {
        return;
      }

      if (!Clipboard.hasString()) {
        return;
      }

      const clipboardEntry = await Clipboard.getString();
      await Clipboard.setString('');

      if (clipboardEntry !== '') {
        await analyzeSentence(clipboardEntry);
      }
    }, 1000);

    return () => {
      clearInterval(clipboardInterval);
    };
  }, []);

  return (
    <KeyboardAvoidingView style={{flex: 1}} behavior="padding">
      <View style={styles.clipboardCheckboxContainer}>
        <CheckBox
          value={isScanningClipboard}
          onValueChange={setScanningClipboard}
          style={styles.clipboardCheckbox}
          disabled={isLoading}
        />
        <Text
          style={[
            styles.clipboardCheckboxLabel,
            {
              color: isDarkMode ? colors.white : colors.black,
            },
          ]}>
          Scan Clipboard for Sentences
        </Text>
      </View>
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
            <View style={styles.wordInputView}>
              <TextInput
                autoCapitalize="none"
                placeholderTextColor={colors.dark}
                value={currentDictionaryForm}
                onChangeText={setCurrentDictionaryForm}
                editable={currentMorphemes.length > 0 && !isLoading}
                style={styles.input}
              />
            </View>
            <View style={styles.readingInputView}>
              <TextInput
                autoCapitalize="none"
                placeholderTextColor={colors.dark}
                value={currentReading}
                onChangeText={setCurrentReading}
                editable={currentMorphemes.length > 0 && !isLoading}
                style={styles.input}
              />
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
                  <Text style={styles.wordText}>{morpheme.morpheme}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

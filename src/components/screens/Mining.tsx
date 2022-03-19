import React, {useContext, useState} from 'react';
import {
  Keyboard,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {Button, Chip, Divider, Text} from 'react-native-paper';
import {ThemeContext} from '../../contexts/theme';
import {IconButton} from '../elements/IconButton';

type Morpheme = {
  word: string;
  dictionaryForm: string;
  reading: string;
};

let testSentence: Morpheme[] = [
  {
    word: '唐突',
    dictionaryForm: '唐突',
    reading: 'とうとつ',
  },
  {
    word: 'に',
    dictionaryForm: 'に',
    reading: 'に',
  },
  {
    word: '、',
    dictionaryForm: '、',
    reading: '、',
  },
  {
    word: '波',
    dictionaryForm: '波',
    reading: 'なみ',
  },
  {
    word: 'の',
    dictionaryForm: 'の',
    reading: 'の',
  },
  {
    word: '奥',
    dictionaryForm: '奥',
    reading: 'おく',
  },
  {
    word: 'で',
    dictionaryForm: 'で',
    reading: 'で',
  },
  {
    word: '血',
    dictionaryForm: '血',
    reading: 'ち',
  },
  {
    word: 'しぶき',
    dictionaryForm: 'しぶき',
    reading: 'しぶき',
  },
  {
    word: 'が',
    dictionaryForm: 'が',
    reading: 'が',
  },
  {
    word: '上がっ',
    dictionaryForm: '上がる',
    reading: 'あがる',
  },
  {
    word: 'た',
    dictionaryForm: 'た',
    reading: 'た',
  },
  {
    word: '。',
    dictionaryForm: '。',
    reading: '。',
  },
];
testSentence = [
  ...testSentence,
  // ...testSentence,
  // ...testSentence,
  // ...testSentence,
  // ...testSentence,
  // ...testSentence,
];

const testTags = ['無職転生１７', '本'];

export const Mining = () => {
  const {theme} = useContext(ThemeContext);

  const [selectedMorpheme, setSelectedMorpheme] = useState<Morpheme | null>(
    null,
  );

  const surfaceStyle = {
    ...styles.wordText,
    backgroundColor: theme.colors.surface,
  };

  const morphemeStyle = {
    color:
      selectedMorpheme === null ? theme.colors.disabled : theme.colors.primary,
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <>
        <ScrollView style={styles.mainView}>
          <TouchableOpacity disabled={selectedMorpheme === null}>
            <View style={styles.selectedMorphemeView}>
              <Text
                style={{
                  ...styles.selectedMorphemeDictionaryForm,
                  ...morphemeStyle,
                }}>
                「{selectedMorpheme?.dictionaryForm ?? '読み'}」
              </Text>
              <Text
                style={{...styles.selectedMorphemeReading, ...morphemeStyle}}>
                「{selectedMorpheme?.reading ?? 'よみ'}」
              </Text>
            </View>
          </TouchableOpacity>
          <Divider style={styles.divider} />
          <View style={styles.utilityView}>
            <IconButton
              icon="close"
              size={24}
              color={theme.colors.notification}
              onPress={() => console.log('Pressed')}
            />
            <IconButton
              icon="content-paste"
              size={24}
              color={theme.colors.primary}
              onPress={() => console.log('Pressed')}
            />
          </View>
          <View style={styles.wordView}>
            {[...testSentence.entries()].map(([key, morpheme]) => (
              <TouchableOpacity
                key={key}
                style={styles.wordTouchableOpacity}
                onPress={() => setSelectedMorpheme(morpheme)}>
                <Text style={surfaceStyle}>{morpheme.word}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        <View style={styles.tagChipView}>
          {testTags.map(tag => (
            <Chip
              mode="outlined"
              style={styles.tagChip}
              onClose={() => console.log('Pressed')}>
              {tag}
            </Chip>
          ))}
          <Chip
            mode="outlined"
            style={styles.tagChip}
            icon="plus"
            onPress={() => console.log('Pressed')}>
            Add Tag
          </Chip>
        </View>
        <Button
          mode="contained"
          onPress={() => console.log('Pressed')}
          style={styles.mineSentenceButton}
          color={theme.colors.primary}>
          Mine Sentence
        </Button>
      </>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  mainView: {
    flex: 1,
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
  utilityView: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 5,
  },
  divider: {
    marginTop: 15,
  },
  wordView: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-around',
    alignContent: 'space-around',
  },
  wordTouchableOpacity: {
    shadowOpacity: 0.1,
    shadowOffset: {
      width: 5,
      height: 5,
    },
  },
  wordText: {
    fontSize: 24,
    padding: 5,
    margin: 5,
    borderRadius: 5,
    overflow: 'hidden',
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
  },
  mineSentenceButton: {
    marginHorizontal: 15,
    marginBottom: 15,
  },
});

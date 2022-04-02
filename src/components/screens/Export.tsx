import React, {useContext, useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Button} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useQuery} from 'react-query';
import {ThemeContext} from '../../contexts/theme';
import {getMostRecentBatch} from '../../queries';
import {LabeledTextInput} from '../elements/LabeledTextInput';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useAsyncStorage} from '../../hooks/use-async-storage';

type ExportSettings = {
  profile: string;
  noteType: string;
  deck: string;
  wordField: string;
  sentenceField: string;
  audioField: string;
  definitionField: string;
};

export const Export = () => {
  const {theme} = useContext(ThemeContext);

  const [exportSettings, updateExportSettings] =
    useAsyncStorage<ExportSettings>('exportSettings', {
      profile: '',
      noteType: '',
      deck: '',
      wordField: '',
      sentenceField: '',
      audioField: '',
      definitionField: '',
    });

  const {data: batchData, status: batchStatus} = useQuery('batch', () =>
    getMostRecentBatch(),
  );
  const updateExportSetting = (
    setting: keyof ExportSettings,
    value: string,
  ) => {
    updateExportSettings(settings => ({
      ...settings,
      [setting]: value,
    }));
  };

  const dateCreated = useMemo(() => {
    const date = new Date(0);
    date.setUTCSeconds(batchData?.createdAt.seconds ?? 0);
    return date;
  }, [batchData]);
  const isBadInput = useMemo(
    () =>
      exportSettings.profile === '' ||
      exportSettings.noteType === '' ||
      exportSettings.deck === '' ||
      (exportSettings.wordField === '' &&
        exportSettings.sentenceField === '' &&
        exportSettings.audioField === '' &&
        exportSettings.definitionField === ''),
    [exportSettings],
  );

  return (
    <SafeAreaView style={styles.mainContainer} edges={['bottom']}>
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollableView}>
        <View style={styles.noticeView}>
          {batchData === null ? (
            <Text style={[styles.notice, {color: theme.colors.error}]}>
              You haven't created any batches yet!
            </Text>
          ) : (
            <>
              <Text>Your most recent sentence batch was created at:</Text>
              <Text style={styles.boldFont}>
                {dateCreated.toLocaleString()}
              </Text>
            </>
          )}
        </View>
        <View style={styles.inputView}>
          <LabeledTextInput
            containerStyle={styles.input}
            label="Profile *"
            placeholder="User 1"
            defaultValue={exportSettings.profile}
            onChangeText={value => updateExportSetting('profile', value)}
          />
          <LabeledTextInput
            containerStyle={styles.input}
            label="Note Type *"
            placeholder="Basic"
            defaultValue={exportSettings.noteType}
            onChangeText={value => updateExportSetting('noteType', value)}
          />
          <LabeledTextInput
            containerStyle={styles.input}
            label="Deck *"
            placeholder="Default"
            defaultValue={exportSettings.deck}
            onChangeText={value => updateExportSetting('deck', value)}
          />
          <LabeledTextInput
            containerStyle={styles.input}
            label="Word Field"
            placeholder="Front"
            defaultValue={exportSettings.wordField}
            onChangeText={value => updateExportSetting('wordField', value)}
          />
          <LabeledTextInput
            containerStyle={styles.input}
            label="Sentence Field"
            placeholder="Front"
            defaultValue={exportSettings.sentenceField}
            onChangeText={value => updateExportSetting('sentenceField', value)}
          />
          <LabeledTextInput
            containerStyle={styles.input}
            label="Word Audio Field"
            placeholder="Back"
            defaultValue={exportSettings.audioField}
            onChangeText={value => updateExportSetting('audioField', value)}
          />
          <LabeledTextInput
            containerStyle={styles.input}
            label="Word Definition Field"
            placeholder="Back"
            defaultValue={exportSettings.definitionField}
            onChangeText={value =>
              updateExportSetting('definitionField', value)
            }
          />
        </View>
      </KeyboardAwareScrollView>
      <View style={styles.exportBatchButtonView}>
        <Button
          mode="contained"
          style={styles.exportBatchButton}
          color={theme.colors.primary}
          disabled={isBadInput || batchData === null}>
          Export Most Recent Batch
        </Button>
      </View>
    </SafeAreaView>
  );
};

// 'anki://x-callback-url/addnote?profile=User%201&type=Basic-27e55&deck=Personal&fldFront=front%20text&fldBack=back%20text2&dupes=1&x-success=sentencebase://',

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  scrollableView: {
    flex: 1,
    margin: 30,
  },
  noticeView: {
    alignItems: 'center',
  },
  notice: {
    fontSize: 16,
  },
  boldFont: {
    fontWeight: 'bold',
  },
  inputView: {
    flexDirection: 'column',
    alignItems: 'stretch',
    marginTop: 15,
  },
  input: {
    marginTop: 15,
  },
  exportBatchButtonView: {
    margin: 30,
  },
  exportBatchButton: {
    height: 44,
    justifyContent: 'center',
  },
});

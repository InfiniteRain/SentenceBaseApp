import React, {useCallback, useContext, useMemo, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Button} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useQuery} from 'react-query';
import {ThemeContext} from '../../contexts/theme';
import {getMostRecentBatch} from '../../queries';
import {LabeledTextInput} from '../elements/LabeledTextInput';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useAsyncStorage} from '../../hooks/use-async-storage';
import {exportBatch} from '../../export';
import {ExportSettings, RootNavigationProps} from '../../types';
import {
  CommonActions,
  DrawerActions,
  useNavigation,
} from '@react-navigation/native';

export const Export = () => {
  const {theme} = useContext(ThemeContext);

  const navigation = useNavigation<RootNavigationProps>();

  const [isExporting, setExporting] = useState(false);

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

  const onExportBatch = useCallback(() => {
    if (!batchData) {
      return;
    }

    setExporting(true);
    exportBatch(batchData, exportSettings, {
      onProgress(index, lastIndex) {
        console.log('progress', index, lastIndex);
      },
      onSuccess() {
        navigation.dispatch(DrawerActions.closeDrawer());
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{name: 'Mining'}],
          }),
        );
        navigation.popToTop();
      },
      onSettled() {
        setExporting(false);
      },
    });
  }, [navigation, batchData, exportSettings]);

  const dateCreated = useMemo(() => {
    const date = new Date(0);
    date.setUTCSeconds(batchData?.createdAt.seconds ?? 0);
    return date;
  }, [batchData]);
  const isBadInput = useMemo(() => {
    const {
      profile,
      noteType,
      deck,
      wordField,
      sentenceField,
      audioField,
      definitionField,
    } = exportSettings;

    return (
      // All required input have to be filled.
      profile === '' ||
      noteType === '' ||
      deck === '' ||
      // At least one field input has to be filled.
      (wordField === '' &&
        sentenceField === '' &&
        audioField === '' &&
        definitionField === '') ||
      // Sound input field has to be unique.
      ([wordField, sentenceField, definitionField].includes(audioField) &&
        audioField !== '')
    );
  }, [exportSettings]);

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
              <Text style={{color: theme.colors.onSurface}}>
                Your most recent batch was created on:
              </Text>
              <Text style={[styles.boldFont, {color: theme.colors.onSurface}]}>
                {dateCreated.toLocaleString()}
              </Text>
            </>
          )}
        </View>
        <View style={styles.inputView}>
          <LabeledTextInput
            containerStyle={styles.input}
            label="Profile (required)"
            placeholder="User 1"
            defaultValue={exportSettings.profile}
            onChangeText={value => updateExportSetting('profile', value)}
          />
          <LabeledTextInput
            containerStyle={styles.input}
            label="Note Type (required)"
            placeholder="Basic"
            defaultValue={exportSettings.noteType}
            onChangeText={value => updateExportSetting('noteType', value)}
          />
          <LabeledTextInput
            containerStyle={styles.input}
            label="Deck (required)"
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
            label="Word Audio Field (has to be unique)"
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
          disabled={
            isBadInput ||
            batchStatus === 'loading' ||
            batchData === null ||
            isExporting
          }
          onPress={onExportBatch}
          loading={isExporting}>
          Export Most Recent Batch
        </Button>
      </View>
    </SafeAreaView>
  );
};

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

import React, {useCallback, useContext, useMemo, useState} from 'react';
import {Alert, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useQuery} from 'react-query';
import {LayoutContext} from '../../contexts/layout-context';
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
import {Button} from '../elements/Button';

export const Export = () => {
  const {theme, setLoading, setProgress, setProgressText} =
    useContext(LayoutContext);

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
    setLoading(true);
    exportBatch(batchData, exportSettings, {
      onProgress(index, lastIndex) {
        setProgress(index / lastIndex);
        setProgressText(`Exporting card ${index + 1}/${lastIndex + 1}...`);
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
        Alert.alert('Success', 'Cards were exported successfully.', [
          {
            text: 'Ok',
          },
        ]);
      },
      onError(error) {
        Alert.alert('Failure', error.message, [
          {
            text: 'Ok',
          },
        ]);
      },
      onSettled() {
        setExporting(false);
        setLoading(false);
      },
    });
  }, [
    navigation,
    batchData,
    exportSettings,
    setLoading,
    setProgress,
    setProgressText,
  ]);

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
  const areInputsDisabled = useMemo(
    () => isExporting || batchStatus === 'loading',
    [isExporting, batchStatus],
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
            disabled={areInputsDisabled}
          />
          <LabeledTextInput
            containerStyle={styles.input}
            label="Note Type (required)"
            placeholder="Basic"
            defaultValue={exportSettings.noteType}
            onChangeText={value => updateExportSetting('noteType', value)}
            disabled={areInputsDisabled}
          />
          <LabeledTextInput
            containerStyle={styles.input}
            label="Deck (required)"
            placeholder="Default"
            defaultValue={exportSettings.deck}
            onChangeText={value => updateExportSetting('deck', value)}
            disabled={areInputsDisabled}
          />
          <LabeledTextInput
            containerStyle={styles.input}
            label="Word Field"
            placeholder="Front"
            defaultValue={exportSettings.wordField}
            onChangeText={value => updateExportSetting('wordField', value)}
            disabled={areInputsDisabled}
          />
          <LabeledTextInput
            containerStyle={styles.input}
            label="Sentence Field"
            placeholder="Front"
            defaultValue={exportSettings.sentenceField}
            onChangeText={value => updateExportSetting('sentenceField', value)}
            disabled={areInputsDisabled}
          />
          <LabeledTextInput
            containerStyle={styles.input}
            label="Word Audio Field (has to be unique)"
            placeholder="Back"
            defaultValue={exportSettings.audioField}
            onChangeText={value => updateExportSetting('audioField', value)}
            disabled={areInputsDisabled}
          />
          <LabeledTextInput
            containerStyle={styles.input}
            label="Word Definition Field"
            placeholder="Back"
            defaultValue={exportSettings.definitionField}
            onChangeText={value =>
              updateExportSetting('definitionField', value)
            }
            disabled={areInputsDisabled}
          />
        </View>
      </KeyboardAwareScrollView>
      <View style={styles.exportBatchButtonView}>
        <Button
          title="Export Most Recent Batch"
          type="primary"
          disabled={
            isBadInput ||
            batchStatus === 'loading' ||
            batchData === null ||
            isExporting
          }
          onPress={onExportBatch}
        />
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
});

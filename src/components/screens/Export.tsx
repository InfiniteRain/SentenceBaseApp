import React, {useCallback, useContext, useMemo, useState} from 'react';
import {Alert, Platform, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useQuery} from '@tanstack/react-query';
import {LayoutContext} from '../../contexts/layout-context';
import {LabeledTextInput} from '../elements/LabeledTextInput';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useAsyncStorage} from '../../hooks/use-async-storage';
import {exportBatch} from '../../export';
import {
  ExportSettings,
  RootNavigationProps,
  RootNavigatorParamList,
} from '../../types';
import {
  CommonActions,
  DrawerActions,
  useNavigation,
} from '@react-navigation/native';
import {Button} from '../elements/Button';
import {Text} from '../elements/Text';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {getSentenceBatchById} from '../../queries';

type Props = NativeStackScreenProps<RootNavigatorParamList, 'Export'>;

export const Export: React.FC<Props> = ({route}) => {
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

  const {data: batchData, status: batchStatus} = useQuery(['batch'], () =>
    getSentenceBatchById(route.params.batchId),
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
      (Platform.OS === 'ios' && profile === '') ||
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
  const areInputsEditable = useMemo(
    () => !isExporting && batchStatus !== 'loading',
    [isExporting, batchStatus],
  );

  return (
    <SafeAreaView style={styles.mainContainer} edges={['bottom']}>
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollableView}>
        <View style={styles.noticeView}>
          {batchStatus === 'error' ? (
            <Text style={[styles.notice, {color: theme.colors.dangerText}]}>
              Unexpected error occcurred.
            </Text>
          ) : batchStatus === 'success' ? (
            <>
              <Text>Batch #{route.params.index} was created on:</Text>
              <Text style={styles.boldFont}>
                {dateCreated.toLocaleString()}
              </Text>
            </>
          ) : (
            <Text>Loading...</Text>
          )}
        </View>
        <View style={styles.inputView}>
          {Platform.OS !== 'android' && (
            <LabeledTextInput
              containerStyle={styles.input}
              label="Profile (required)"
              placeholder="User 1"
              defaultValue={exportSettings.profile}
              onChangeText={value => updateExportSetting('profile', value)}
              editable={areInputsEditable}
            />
          )}
          <LabeledTextInput
            containerStyle={styles.input}
            label="Note Type (required)"
            placeholder="Basic"
            defaultValue={exportSettings.noteType}
            onChangeText={value => updateExportSetting('noteType', value)}
            editable={areInputsEditable}
          />
          <LabeledTextInput
            containerStyle={styles.input}
            label="Deck (required)"
            placeholder="Default"
            defaultValue={exportSettings.deck}
            onChangeText={value => updateExportSetting('deck', value)}
            editable={areInputsEditable}
          />
          <LabeledTextInput
            containerStyle={styles.input}
            label="Word Field"
            placeholder="Front"
            defaultValue={exportSettings.wordField}
            onChangeText={value => updateExportSetting('wordField', value)}
            editable={areInputsEditable}
          />
          <LabeledTextInput
            containerStyle={styles.input}
            label="Sentence Field"
            placeholder="Front"
            defaultValue={exportSettings.sentenceField}
            onChangeText={value => updateExportSetting('sentenceField', value)}
            editable={areInputsEditable}
          />
          <LabeledTextInput
            containerStyle={styles.input}
            label="Word Audio Field (has to be unique)"
            placeholder="Back"
            defaultValue={exportSettings.audioField}
            onChangeText={value => updateExportSetting('audioField', value)}
            editable={areInputsEditable}
          />
          <LabeledTextInput
            containerStyle={styles.input}
            label="Word Definition Field"
            placeholder="Back"
            defaultValue={exportSettings.definitionField}
            onChangeText={value =>
              updateExportSetting('definitionField', value)
            }
            editable={areInputsEditable}
          />
        </View>
      </KeyboardAwareScrollView>
      <View style={styles.exportBatchButtonView}>
        <Button
          title="Export Most Recent Batch"
          type="primary"
          disabled={isBadInput || batchStatus !== 'success' || isExporting}
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
    marginBottom: 30,
    marginHorizontal: 30,
  },
});

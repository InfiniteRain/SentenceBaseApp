import React, {useContext, useEffect, useRef, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {AppStateContext, Page} from './AppStateContext';
import {colors} from './Colors';
import {
  checkExportSettings,
  StorageSettings,
  updateExportSettings,
} from './Storage';
import {Picker} from '@react-native-picker/picker';
import AnkiDroid from 'react-native-ankidroid';

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
    paddingBottom: 20,
    marginTop: 50,
  },
  backButton: {
    color: colors.primary,
  },
  menuPicker: {
    width: '80%',
    height: 50,
    marginTop: 40,
  },
  firstMenuPicker: {
    marginTop: 0,
  },
  menuButton: {
    width: '80%',
    borderRadius: 5,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    backgroundColor: colors.primary,
  },
  menuButtonText: {
    color: colors.lighter,
  },
});

export const Export = () => {
  const {setCurrentPage} = useContext(AppStateContext);

  const [isLoading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedWordField, setSelectedWordField] = useState<number | null>(
    null,
  );
  const [selectedSentenceField, setSelectedSentenceField] = useState<
    number | null
  >(null);
  const [selectedDefinitionField, setSelectedDefinitionField] = useState<
    number | null
  >(null);
  const [selectedAudioField, setSelectedAudioField] = useState<number | null>(
    null,
  );
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
  const [possibleModels, setPossibleModels] = useState<
    {
      id: string;
      name: string;
    }[]
  >([]);
  const [possibleFields, setPossibleFields] = useState<string[]>([]);
  const [possibleDecks, setPossibleDecks] = useState<
    {
      id: string;
      name: string;
    }[]
  >([]);

  const currentSettingsRef = useRef<StorageSettings>();

  currentSettingsRef.current = {
    modelExport: selectedModel,
    wordFieldExport: selectedWordField,
    sentenceFieldExport: selectedSentenceField,
    definitionFieldExport: selectedDefinitionField,
    audioFieldExport: selectedAudioField,
    deckExport: selectedDeck,
  };

  const onBack = () => {
    setCurrentPage(Page.UserMenu);
  };

  const onModelSelect = async (value: string | null) => {
    setSelectedModel(value);

    setSelectedWordField(null);
    setSelectedSentenceField(null);
    setSelectedDefinitionField(null);
    setSelectedAudioField(null);

    if (value === null) {
      setPossibleFields([]);
      return;
    }

    setLoading(true);

    const [fieldsError, fieldsArray] = await AnkiDroid.getFieldList(
      undefined,
      value,
    );

    if (fieldsError === null && Array.isArray(fieldsArray)) {
      setPossibleFields(fieldsArray);
    }

    setLoading(false);
  };

  const saveSettings = async () => {
    const currentSettings = currentSettingsRef.current;

    if (!currentSettings) {
      return;
    }

    setLoading(true);
    await updateExportSettings(currentSettings);
    setLoading(false);
  };

  const onExport = () => {
    const currentSettings = currentSettingsRef.current;

    if (!currentSettings) {
      return;
    }
  };

  useEffect(() => {
    const init = async () => {
      const [modelsError, modelsArray] = await AnkiDroid.getModelList();
      const [decksError, decksArray] = await AnkiDroid.getDeckList();

      if (modelsError === null && Array.isArray(modelsArray)) {
        setPossibleModels(modelsArray);
      }

      if (decksError === null && Array.isArray(decksArray)) {
        setPossibleDecks(decksArray);
      }

      const details = await checkExportSettings();

      if (typeof details === 'undefined') {
        return;
      }

      const settings = details.settingsValues;

      setSelectedModel(settings.modelExport);
      setSelectedWordField(settings.wordFieldExport);
      setSelectedSentenceField(settings.sentenceFieldExport);
      setSelectedDefinitionField(settings.definitionFieldExport);
      setSelectedAudioField(settings.audioFieldExport);
      setSelectedDeck(settings.deckExport);

      setPossibleFields(details.modelFields);
    };

    init();
  }, []);

  const currentSettingsAreInvalid =
    selectedModel === null ||
    selectedWordField === null ||
    selectedSentenceField === null ||
    selectedDefinitionField === null ||
    selectedAudioField === null ||
    selectedDeck === null;

  return (
    <>
      <View style={styles.backButtonContainer}>
        <TouchableOpacity onPress={onBack} disabled={isLoading}>
          <Text style={styles.backButton}>Back to Menu</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.mainContainer}>
        <Picker
          selectedValue={selectedModel}
          onValueChange={value => {
            if (currentSettingsRef.current) {
              currentSettingsRef.current.modelExport = value;
            }
            onModelSelect(value);
            saveSettings();
          }}
          style={[styles.menuPicker, styles.firstMenuPicker]}
          enabled={!isLoading}>
          <Picker.Item label="Select the Note Type" value={null} key={null} />
          {possibleModels.map(model => (
            <Picker.Item label={model.name} value={model.id} key={model.id} />
          ))}
        </Picker>
        <Picker
          selectedValue={selectedWordField}
          onValueChange={value => {
            if (currentSettingsRef.current) {
              currentSettingsRef.current.wordFieldExport = value;
            }
            setSelectedWordField(value);
            saveSettings();
          }}
          style={styles.menuPicker}
          enabled={possibleFields.length > 0 && !isLoading}>
          <Picker.Item label="Select the Word Field" value={null} key={null} />
          {possibleFields.map((name, index) => (
            <Picker.Item label={name} value={index} key={index} />
          ))}
        </Picker>
        <Picker
          selectedValue={selectedSentenceField}
          onValueChange={value => {
            if (currentSettingsRef.current) {
              currentSettingsRef.current.sentenceFieldExport = value;
            }
            setSelectedSentenceField(value);
            saveSettings();
          }}
          style={styles.menuPicker}
          enabled={possibleFields.length > 0 && !isLoading}>
          <Picker.Item
            label="Select the Sentence Field"
            value={null}
            key={null}
          />
          {possibleFields.map((name, index) => (
            <Picker.Item label={name} value={index} key={index} />
          ))}
        </Picker>
        <Picker
          selectedValue={selectedDefinitionField}
          onValueChange={value => {
            if (currentSettingsRef.current) {
              currentSettingsRef.current.definitionFieldExport = value;
            }
            setSelectedDefinitionField(value);
            saveSettings();
          }}
          style={styles.menuPicker}
          enabled={possibleFields.length > 0 && !isLoading}>
          <Picker.Item
            label="Select the Definition Field"
            value={null}
            key={null}
          />
          {possibleFields.map((name, index) => (
            <Picker.Item label={name} value={index} key={index} />
          ))}
        </Picker>
        <Picker
          selectedValue={selectedAudioField}
          onValueChange={value => {
            if (currentSettingsRef.current) {
              currentSettingsRef.current.audioFieldExport = value;
            }
            setSelectedAudioField(value);
            saveSettings();
          }}
          style={styles.menuPicker}
          enabled={possibleFields.length > 0 && !isLoading}>
          <Picker.Item label="Select the Audio Field" value={null} key={null} />
          {possibleFields.map((name, index) => (
            <Picker.Item label={name} value={index} key={index} />
          ))}
        </Picker>
        <Picker
          selectedValue={selectedDeck}
          onValueChange={value => {
            if (currentSettingsRef.current) {
              currentSettingsRef.current.deckExport = value;
            }
            setSelectedDeck(value);
            saveSettings();
          }}
          style={styles.menuPicker}
          enabled={!isLoading}>
          <Picker.Item label="Select the Deck" value={null} key={null} />
          {possibleDecks.map(deck => (
            <Picker.Item label={deck.name} value={deck.id} key={deck.id} />
          ))}
        </Picker>
        <TouchableOpacity
          style={[
            styles.menuButton,
            {
              backgroundColor:
                isLoading || currentSettingsAreInvalid
                  ? colors.grey
                  : colors.primary,
            },
          ]}
          disabled={isLoading || currentSettingsAreInvalid}
          onPress={onExport}>
          <Text style={styles.menuButtonText}>EXPORT</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

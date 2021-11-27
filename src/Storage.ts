import AsyncStorage from '@react-native-async-storage/async-storage';
import AnkiDroid from 'react-native-ankidroid';
//import RNFS from 'react-native-fs';

export interface StorageSettings {
  modelExport: string | null;
  wordFieldExport: number | null;
  sentenceFieldExport: number | null;
  definitionFieldExport: number | null;
  audioFieldExport: number | null;
  deckExport: string | null;
}

//const FILE_DIRECTORY_NAME = 'SentenceBase';

const MODEL_EXPORT_KEY = 'modelExport';
const WORD_FIELD_EXPORT_KEY = 'wordFieldExport';
const SENTENCE_FIELD_EXPORT_KEY = 'sentenceFieldExport';
const DEFINITION_FIELD_EXPORT_KEY = 'definitionFieldExport';
const AUDIO_FIELD_EXPORT_KEY = 'audioFieldExport';
const DECK_EXPORT_KEY = 'deckExport';

export const getStorageItem = async (key: string): Promise<string | null> => {
  let value: string | null;

  try {
    value = await AsyncStorage.getItem(key);
  } catch {
    return null;
  }

  return value;
};

const setStorageItem = async (key: string, value: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch {}
};

const removeStorageItem = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch {}
};

export const updateExportSettings = async (settings: StorageSettings) => {
  try {
    const fieldsToCheck: [string, number | string | null][] = [
      [MODEL_EXPORT_KEY, settings.modelExport],
      [WORD_FIELD_EXPORT_KEY, settings.wordFieldExport],
      [SENTENCE_FIELD_EXPORT_KEY, settings.sentenceFieldExport],
      [DEFINITION_FIELD_EXPORT_KEY, settings.definitionFieldExport],
      [AUDIO_FIELD_EXPORT_KEY, settings.audioFieldExport],
      [DECK_EXPORT_KEY, settings.deckExport],
    ];

    for (const [key, value] of fieldsToCheck) {
      if (value === null) {
        await removeStorageItem(key);
        continue;
      }

      await setStorageItem(key, value.toString());
    }
  } catch {}
};

const resetExportSettings = async () => {
  try {
    await AsyncStorage.removeItem(MODEL_EXPORT_KEY);
    await AsyncStorage.removeItem(WORD_FIELD_EXPORT_KEY);
    await AsyncStorage.removeItem(SENTENCE_FIELD_EXPORT_KEY);
    await AsyncStorage.removeItem(DEFINITION_FIELD_EXPORT_KEY);
    await AsyncStorage.removeItem(AUDIO_FIELD_EXPORT_KEY);
    await AsyncStorage.removeItem(DECK_EXPORT_KEY);
  } catch {}
};

export const checkExportSettings = async () => {
  const [modelsError, modelsArray] = await AnkiDroid.getModelList();
  const [decksError, decksArray] = await AnkiDroid.getDeckList();

  if (
    modelsError !== null ||
    decksError !== null ||
    !Array.isArray(modelsArray) ||
    !Array.isArray(decksArray)
  ) {
    await resetExportSettings();
    return;
  }

  const modelExport = await getStorageItem(MODEL_EXPORT_KEY);
  const wordFieldExport = await getStorageItem(WORD_FIELD_EXPORT_KEY);
  const sentenceFieldExport = await getStorageItem(SENTENCE_FIELD_EXPORT_KEY);
  const definitionFieldExport = await getStorageItem(
    DEFINITION_FIELD_EXPORT_KEY,
  );
  const audioFieldExport = await getStorageItem(AUDIO_FIELD_EXPORT_KEY);
  const deckExport = await getStorageItem(DECK_EXPORT_KEY);

  const selectedModel = modelsArray.find(model => model.id === modelExport);

  if (typeof selectedModel === 'undefined') {
    await resetExportSettings();
    return;
  }

  const [fieldsError, fieldsArray] = await AnkiDroid.getFieldList(
    undefined,
    selectedModel.id,
  );

  if (fieldsError !== null || !Array.isArray(fieldsArray)) {
    await resetExportSettings();
    return;
  }

  const fieldsToCheck = [
    wordFieldExport,
    sentenceFieldExport,
    definitionFieldExport,
    audioFieldExport,
  ];

  for (const fieldToCheck of fieldsToCheck) {
    if (
      fieldToCheck === null ||
      typeof fieldsArray[Number(fieldToCheck)] === 'undefined'
    ) {
      await resetExportSettings();
      return;
    }
  }

  const selectedDeck = decksArray.find(deck => deck.id === deckExport);

  if (typeof selectedDeck === 'undefined') {
    await resetExportSettings();
    return;
  }

  return {
    instance: new AnkiDroid({
      modelId: selectedModel.id,
      deckId: selectedDeck.id,
    }),
    modelFields: fieldsArray,
    settingsValues: {
      modelExport: modelExport,
      wordFieldExport: wordFieldExport ? Number(wordFieldExport) : null,
      sentenceFieldExport: sentenceFieldExport
        ? Number(sentenceFieldExport)
        : null,
      definitionFieldExport: definitionFieldExport
        ? Number(definitionFieldExport)
        : null,
      audioFieldExport: audioFieldExport ? Number(audioFieldExport) : null,
      deckExport: deckExport,
    },
  };
};

/*
export const uploadMedia = async (
  url: string,
  mimeType: 'audio' | 'image',
): Promise<string | null> => {
  try {
    await RNFS.mkdir(
      `${RNFS.ExternalStorageDirectoryPath}/${FILE_DIRECTORY_NAME}`,
    );
  } catch {
    return null;
  }

  const fileName = url.substring(url.lastIndexOf('/') + 1);
  const filePath = `${RNFS.ExternalStorageDirectoryPath}/${FILE_DIRECTORY_NAME}/${fileName}`;

  const {promise} = RNFS.downloadFile({
    fromUrl: url,
    toFile: filePath,
  });

  try {
    await promise;
  } catch {
    return null;
  }

  const [uploadError, formattedString] = await AnkiDroid.uploadMediaFromUri(
    `file://${filePath}`,
    fileName.substring(0, fileName.lastIndexOf('.')),
    mimeType,
  );

  if (uploadError || typeof formattedString !== 'string') {
    return null;
  }

  return formattedString;
};*/

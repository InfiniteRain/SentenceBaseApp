import {Linking, Platform} from 'react-native';
import {generateExtendedFormat} from './format-generation';
import {wordFrequency} from './helpers';
import {forvoQuery, jishoQuery} from './queries';
import {ExportSettings, SbBatch} from './types';
import AnkiDroid from 'react-native-ankidroid';
import {
  NewDeckProperties,
  NewModelProperties,
} from 'react-native-ankidroid/dist/types';

type ExportEvents = {
  onProgress?: (index: number, lastIndex: number) => void;
  onError?: (error: Error) => void;
  onSuccess?: () => void;
  onSettled?: () => void;
};
const frequencyRanges = [
  [0, 1500],
  [1500, 5000],
  [5000, 15000],
  [15000, 30000],
  [30000, 60000],
];
const starChar = '★';
const sentenceBaseLink = 'sentencebase://';
const ankiLinkBase = 'anki://x-callback-url/addnote?';

const frequencyToStars = (frequency: number): string => {
  for (const [key, frequencyRange] of frequencyRanges.entries()) {
    if (frequency >= frequencyRange[0] && frequency < frequencyRange[1]) {
      return starChar.repeat(frequencyRanges.length - key);
    }
  }

  return '';
};

const generateDefinitionString = async (
  dictionaryForm: string,
  reading: string,
) => {
  const frequency = wordFrequency(dictionaryForm, reading);
  const frequencyStars = frequencyToStars(frequency);
  const jishoResponse = await jishoQuery(dictionaryForm);
  let finalDefinition = '';

  if (jishoResponse.data) {
    const entries = jishoResponse.data.filter(
      datum =>
        datum.slug === dictionaryForm ||
        (datum?.japanese ?? []).find(jpData => jpData?.reading === reading),
    );

    for (const [key, entry] of entries.entries()) {
      let count = 1;
      finalDefinition += `${key !== 0 ? '<br>' : ''}【${
        entry.slug
      }】 ${reading} ${frequencyStars}`;

      for (const sense of entry.senses ?? []) {
        finalDefinition += `<br>${count++}. ${sense.english_definitions?.join(
          '; ',
        )}`;
      }
    }
  }

  return finalDefinition;
};

export const exportBatch = async (
  batch: SbBatch,
  exportSettings: ExportSettings,
  events?: ExportEvents,
) => {
  if (Platform.OS === 'ios') {
    exportIos(batch, exportSettings, events);
    return;
  }

  exportAndroid(batch, exportSettings, events);
};

const exportIos = async (
  batch: SbBatch,
  exportSettings: ExportSettings,
  events?: ExportEvents,
) => {
  const wrapError = (error: Error) => {
    console.log(error);
    events?.onSettled?.();
    events?.onError?.(error);
  };

  for (const [index, sentence] of batch.sentences.entries()) {
    events?.onProgress?.(index, batch.sentences.length - 1);

    const parameters = new Map<string, string>();
    const upsertField = (key: string, value: string) => {
      if (key === '' || value === '') {
        return;
      }

      key = `fld${encodeURIComponent(key)}`;
      const field = parameters.get(key);

      if (!field) {
        parameters.set(key, encodeURIComponent(value));
        return;
      }

      parameters.set(key, field + encodeURIComponent(`<br>${value}`));
    };
    const insertParam = (key: string, value: string) => {
      if (value === '') {
        return;
      }

      parameters.set(encodeURIComponent(key), encodeURIComponent(value));
    };

    let wordFieldValue: string;
    let sentenceFieldValue: string;
    let definitionFieldValue: string;
    let audioFieldValue: string;

    try {
      wordFieldValue = await generateExtendedFormat(
        sentence.wordDictionaryForm,
      );
      sentenceFieldValue = await generateExtendedFormat(sentence.sentence);
      definitionFieldValue = await generateDefinitionString(
        sentence.wordDictionaryForm,
        sentence.wordReading,
      );
      audioFieldValue = (await forvoQuery(sentence.wordDictionaryForm)) ?? '';
    } catch {
      wrapError(new Error('Failed to fetch word information.'));
      return;
    }

    insertParam('profile', exportSettings.profile);
    insertParam('type', exportSettings.noteType);
    insertParam('deck', exportSettings.deck);
    upsertField(exportSettings.wordField, wordFieldValue);
    upsertField(exportSettings.sentenceField, sentenceFieldValue);
    upsertField(exportSettings.definitionField, definitionFieldValue);
    upsertField(exportSettings.audioField, audioFieldValue);
    insertParam('tags', sentence.tags.join(' '));
    insertParam('dupes', '1');
    insertParam('x-success', sentenceBaseLink);

    const paramString = [...parameters.entries()]
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    const ankiLink = `${ankiLinkBase}${paramString}`;

    try {
      // Timer is necessary to prevent the process from crashing.
      await new Promise<void>(resolve => setTimeout(resolve, 1000));
      await Linking.openURL(ankiLink);
    } catch (error) {
      wrapError(
        new Error(
          'Failed to export cards. Make sure you have AnkiMobile installed.',
        ),
      );
      return;
    }
  }

  events?.onSettled?.();
  events?.onSuccess?.();
};

const exportAndroid = async (
  batch: SbBatch,
  exportSettings: ExportSettings,
  events?: ExportEvents,
) => {
  const wrapError = (error: Error) => {
    console.log(error);
    events?.onSettled?.();
    events?.onError?.(error);
  };

  const [permissionRequestError, permissionRequest] =
    await AnkiDroid.requestPermission();

  if (permissionRequestError || permissionRequest !== 'granted') {
    wrapError(
      permissionRequestError
        ? permissionRequestError
        : new Error('Insufficient permissions.'),
    );
    return;
  }

  const [modelsError, modelsArray] = await AnkiDroid.getModelList();

  if (modelsError) {
    wrapError(modelsError);
    return;
  }

  const modelId = modelsArray?.filter(
    model => model.name === exportSettings.noteType,
  )[0]?.id;

  if (!modelId) {
    wrapError(
      new Error(`Invalid note type provided: ${exportSettings.noteType}`),
    );
    return;
  }

  const [decksError, decksArray] = await AnkiDroid.getDeckList();

  if (decksError) {
    wrapError(decksError);
    return;
  }

  const deckId = decksArray?.filter(
    deck => deck.name === exportSettings.deck,
  )[0]?.id;

  if (!deckId) {
    wrapError(new Error(`Invalid deck provided: ${exportSettings.deck}`));
    return;
  }

  const [fieldListError, fieldList] = await AnkiDroid.getFieldList(
    undefined,
    modelId,
  );

  if (fieldListError) {
    wrapError(fieldListError);
    return;
  }

  const fieldIndexes: Record<string, number> = {};
  const {wordField, sentenceField, audioField, definitionField} =
    exportSettings;

  for (const field of [wordField, sentenceField, audioField, definitionField]) {
    if (field === '') {
      continue;
    }

    if (!fieldList?.includes(field)) {
      wrapError(new Error(`Invalid field provided: ${field}`));
      return;
    }

    fieldIndexes[field] = fieldList.indexOf(field);
  }

  for (const [index, sentence] of batch.sentences.entries()) {
    events?.onProgress?.(index, batch.sentences.length - 1);

    const ankiDeck = new AnkiDroid({
      modelId: modelId,
      modelProperties: {
        tags: sentence.tags,
      } as NewModelProperties,
      deckId: deckId,
      deckProperties: {} as NewDeckProperties,
    });
    const valueFields = Array(fieldList!.length).fill('');
    const setValueField = (key: number | undefined, content: string) => {
      if (key === undefined) {
        return;
      }
      valueFields[key] += `${valueFields[key] ? '<br>' : ''}${content}`;
    };

    let wordFieldValue: string;
    let sentenceFieldValue: string;
    let definitionFieldValue: string;
    let audioFieldValue: string;

    try {
      wordFieldValue = await generateExtendedFormat(
        sentence.wordDictionaryForm,
      );
      sentenceFieldValue = await generateExtendedFormat(sentence.sentence);
      definitionFieldValue = await generateDefinitionString(
        sentence.wordDictionaryForm,
        sentence.wordReading,
      );
      audioFieldValue =
        (await forvoQuery(sentence.wordDictionaryForm, true)) ?? '';
    } catch {
      wrapError(new Error('Failed to fetch word information.'));
      return;
    }

    setValueField(fieldIndexes[wordField], wordFieldValue);
    setValueField(fieldIndexes[sentenceField], sentenceFieldValue);
    setValueField(fieldIndexes[definitionField], definitionFieldValue);
    setValueField(fieldIndexes[audioField], audioFieldValue);

    try {
      await ankiDeck.addNote(valueFields, fieldList!);
    } catch (error) {
      wrapError(error as Error);
      return;
    }
  }

  events?.onSettled?.();
  events?.onSuccess?.();
};

import {Linking} from 'react-native';
import {generateExtendedFormat} from './format-generation';
import {wordFrequency} from './helpers';
import {forvoQuery, jishoQuery} from './queries';
import {ExportSettings, SbBatch} from './types';

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
  events?: {
    onProgress?: (index: number, lastIndex: number) => void;
    onError?: (error: Error) => void;
    onSuccess?: () => void;
    onSettled?: () => void;
  },
) => {
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
      events?.onSettled?.();
      events?.onError?.(new Error('Failed to fetch word information.'));
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      await Linking.openURL(ankiLink);
    } catch (error) {
      console.error(error);
      events?.onSettled?.();
      events?.onError?.(
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

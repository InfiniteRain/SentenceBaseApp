import {MecabMorpheme} from './app-state-context';
import {Batch, DictionaryEntry} from './common';
import {generateExtendedFormat, katakanaToHiragana} from './format-generator';
import {StorageSettings, uploadMedia} from './storage';
import {Buffer} from 'buffer';
import AnkiDroid from 'react-native-ankidroid';
import {
  NewDeckProperties,
  NewModelProperties,
} from 'react-native-ankidroid/dist/types';

type JishoResponse = {
  data?: {
    slug?: string;
    japanese?: {
      word?: string;
      reading?: string;
    }[];
    senses?: {
      english_definitions?: string[];
      parts_of_speech?: string[];
    }[];
  }[];
};

const jishoApi = 'https://jisho.org/api/v1/search/words';
const forvoUri = 'https://forvo.com/word';
const frequencyRanges = [
  [0, 1500],
  [1500, 5000],
  [5000, 15000],
  [15000, 30000],
  [30000, 60000],
];
const starChar = '★';

export const exportBatch = async (
  batch: Batch,
  storageSettings: StorageSettings,
  mecabQuery: (query: string) => Promise<MecabMorpheme[]>,
  dictionaryQuery: (
    dictionaryForm: string,
    reading: string,
  ) => Promise<DictionaryEntry>,
) => {
  if (
    storageSettings.modelExport === null ||
    storageSettings.wordFieldExport === null ||
    storageSettings.sentenceFieldExport === null ||
    storageSettings.definitionFieldExport === null ||
    storageSettings.audioFieldExport === null ||
    storageSettings.deckExport === null
  ) {
    return;
  }

  for (const sentence of batch.sentences) {
    const ankiDeck = new AnkiDroid({
      modelId: storageSettings.modelExport,
      modelProperties: {
        tags: sentence.tags,
      } as NewModelProperties,
      deckId: storageSettings.deckExport,
      deckProperties: {} as NewDeckProperties,
    });

    const [error, modelFields] = await AnkiDroid.getFieldList(
      undefined,
      storageSettings.modelExport,
    );

    if (error || !modelFields) {
      return;
    }

    const valueFields = Array(modelFields.length).fill('');
    const word = sentence.wordDictionaryForm;
    const reading = katakanaToHiragana(
      (await mecabQuery(word))[0].reading ?? word,
    );
    const frequency = (await dictionaryQuery(word, reading)).frequency;
    const formattedWord = await generateExtendedFormat(
      sentence.wordDictionaryForm,
      mecabQuery,
      dictionaryQuery,
    );
    const formattedSentence = await generateExtendedFormat(
      sentence.sentence,
      mecabQuery,
      dictionaryQuery,
    );
    const definition = await getDefinitionString(word, reading, frequency);
    const forvo = await getForvo(word);

    const setValueField = (index: number, content: string) => {
      valueFields[index] += `${valueFields[index] ? '<br>' : ''}${content}`;
    };

    setValueField(storageSettings.wordFieldExport, formattedWord);
    setValueField(storageSettings.sentenceFieldExport, formattedSentence);
    setValueField(storageSettings.definitionFieldExport, definition);
    setValueField(storageSettings.audioFieldExport, forvo);

    await ankiDeck.addNote(valueFields, modelFields);
  }
};

const frequencyToStars = (frequency: number): string => {
  for (const [key, frequencyRange] of frequencyRanges.entries()) {
    if (frequency >= frequencyRange[0] && frequency < frequencyRange[1]) {
      return starChar.repeat(frequencyRanges.length - key);
    }
  }

  return '';
};

const getDefinitionString = async (
  word: string,
  reading: string,
  frequency: number,
): Promise<string> => {
  const frequencyStars = frequencyToStars(frequency);
  const request = await fetch(`${jishoApi}?keyword=${word}`);
  const json = (await request.json()) as JishoResponse;
  let finalDefinition = '';

  if (json?.data) {
    const entries = json.data.filter(
      datum =>
        datum.slug === word ||
        (datum?.japanese ?? []).find(jpData => jpData?.reading === reading),
    );

    for (const [key, entry] of entries.entries()) {
      let count = 1;
      finalDefinition += `${key !== 0 ? '<br>' : ''}【${
        entry.slug
      }】 ${reading} ${frequencyStars}`;

      for (const sense of entry.senses ?? []) {
        finalDefinition += `<br>${count++}. [${sense.parts_of_speech?.join(
          ', ',
        )}]<br>${sense.english_definitions?.join('; ')}`;
      }
    }
  }

  return finalDefinition;
};

const getForvo = async (word: string): Promise<string> => {
  const uri = `${forvoUri}/${word}/#ja`;
  const headers = new Headers({
    'User-Agent':
      'Mozilla/5.0 (X11; Linux x86_64; rv:10.0) Gecko/20100101 Firefox/10.0',
  });
  const request = await fetch(uri, {
    headers,
  });
  const html = await request.text();
  const pronunciationsRegex = /var pronunciations = \[([\w\W\n]*?)\];/;
  const pronunciationsValue = html.match(pronunciationsRegex)?.[0];

  if (!pronunciationsValue) {
    return '';
  }

  const dataRegex =
    /Japanese.*?Pronunciation by (?:<a.*?>)?(\w+).*?class="lang_xx">(.*?)<.*?,.*?,.*?,.*?,'(.+?)',.*?,.*?,.*?'(.+?)'/gm;
  const filenameBase64 = [...pronunciationsValue.matchAll(dataRegex)][0]?.[3];
  const audioHostRegex = /var _AUDIO_HTTP_HOST='(.+?)';/;
  const audioHost = html.match(audioHostRegex)?.[1];
  const protocol = 'https';

  if (!filenameBase64) {
    return '';
  }

  const filenameDecoded = Buffer.from(filenameBase64, 'base64').toString();
  const url = `${protocol}://${audioHost}/mp3/${filenameDecoded}`;

  return (await uploadMedia(url, 'audio')) ?? '';
};

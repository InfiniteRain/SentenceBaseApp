import {
  Morpheme,
  SbApiGetPendingSentencesResponse,
  SbApiResponse,
  SbApiSentence,
  SbBatch,
} from './types';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {Buffer} from 'buffer';

type KotuResponse = {
  accentPhrases: {
    components: {
      surface: string;
      kana: string;
      surfaceOriginal: string;
      originalKana: string;
      pitchAccents: {
        descriptive: string;
        mora: number;
      }[];
      isBasic: boolean;
      partOfSpeech: string;
    }[];
  }[];
}[];

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

const sentenceBaseApiUrl =
  'https://us-central1-sentence-base.cloudfunctions.net/api/v1';
const kotuUrl = 'https://kotu.io/api/dictionary/parse';
const jishoUrl = 'https://jisho.org/api/v1/search/words';
const forvoUrl = 'https://forvo.com/word';

export const kotuQuery = async (query: string): Promise<Morpheme[]> => {
  const response = await fetch(kotuUrl, {method: 'post', body: query});
  const sentences = (await response.json()) as KotuResponse;
  const components = sentences
    .flatMap(sentence => sentence.accentPhrases)
    .flatMap(accentPhrase => accentPhrase.components);

  const morphemes: Morpheme[] = [];
  for (const component of components) {
    morphemes.push({
      surface: component.surface.trim(),
      surfaceReading: component.kana.trim(),
      dictionaryForm: (component.surfaceOriginal || component.surface).trim(),
      dictionaryFormReading: (
        component.originalKana || component.surface
      ).trim(),
      pitchAccents: component.pitchAccents,
      isBasic: component.isBasic,
      partOfSpeech: component.partOfSpeech,
    });
  }

  return morphemes;
};

export const jishoQuery = async (keyword: string) => {
  const response = await fetch(`${jishoUrl}?keyword=${keyword}`);
  return (await response.json()) as JishoResponse;
};

export const forvoQuery = async (
  dictionaryForm: string,
): Promise<string | null> => {
  const url = `${forvoUrl}/${dictionaryForm}/`;
  const headers = new Headers({
    'User-Agent':
      'Mozilla/5.0 (X11; Linux x86_64; rv:10.0) Gecko/20100101 Firefox/10.0',
  });
  const request = await fetch(url, {headers});
  const html = await request.text();
  const pronunciationsRegex = /var pronunciations = \[([\w\W\n]*?)\];/;
  const pronunciationsValue = html.match(pronunciationsRegex)?.[0];

  if (!pronunciationsValue) {
    return null;
  }

  const dataRegex =
    /Japanese.*?Pronunciation by (?:<a.*?>)?(\w+).*?class="lang_xx">(.*?)<.*?,.*?,.*?,.*?,'(.+?)',.*?,.*?,.*?'(.+?)'/gm;
  const filenameBase64 = [...pronunciationsValue.matchAll(dataRegex)][0]?.[3];
  const audioHostRegex = /var _AUDIO_HTTP_HOST='(.+?)';/;
  const audioHost = html.match(audioHostRegex)?.[1];
  const protocol = 'https';

  if (!filenameBase64) {
    console.log('b');
    return null;
  }

  const filenameDecoded = Buffer.from(filenameBase64, 'base64').toString();
  const audioUrl = `${protocol}://${audioHost}/mp3/${filenameDecoded}`;

  return audioUrl;
};

const sentenceBaseApiRequest = async <T = null>(
  method: 'get' | 'post' | 'delete',
  endpoint: string,
  body?: Record<string, unknown>,
) => {
  endpoint = endpoint.replace(/^\/+|\/+$/g, '');

  const response = await fetch(`${sentenceBaseApiUrl}/${endpoint}`, {
    method,
    ...(body ? {body: JSON.stringify(body)} : {}),
    headers: new Headers({
      ...(body ? {'Content-Type': 'application/json'} : {}),
      Authorization: `Bearer ${await auth().currentUser?.getIdToken()}`,
    }),
  });
  const json = (await response.json()) as SbApiResponse<T>;

  if (!json.success) {
    throw new Error(
      `Request ${method.toUpperCase()} -> ${endpoint} responded with { "success": false }`,
    );
  }

  return json.data;
};

export const addSentence = async (
  dictionaryForm: string,
  reading: string,
  sentence: string,
  tags: string[],
) =>
  await sentenceBaseApiRequest('post', 'sentences', {
    dictionaryForm,
    reading,
    sentence,
    tags,
  });

export const getPendingSentences = async (): Promise<SbApiSentence[]> =>
  (
    await sentenceBaseApiRequest<SbApiGetPendingSentencesResponse>(
      'get',
      'sentences',
    )
  ).sentences;

export const deleteSentence = async (sentenceId: string) =>
  await sentenceBaseApiRequest('delete', `sentences/${sentenceId}`);

export const editSentence = async (
  sentenceId: string,
  sentence: string,
  tags: string[],
) =>
  await sentenceBaseApiRequest('post', `sentences/${sentenceId}`, {
    sentence,
    tags,
  });

export const createBatch = async (sentenceIds: string[]) =>
  await sentenceBaseApiRequest('post', 'batches', {
    sentences: sentenceIds,
  });

export const getMostRecentBatch = async (): Promise<SbBatch | null> => {
  const snapshot = await firestore()
    .collection('batches')
    .where('userUid', '==', auth().currentUser?.uid)
    .orderBy('createdAt', 'desc')
    .limit(1)
    .get();

  if (snapshot.docs.length === 0) {
    return null;
  }

  return snapshot.docs[0].data() as SbBatch;
};

import {
  Morpheme,
  QueryDocumentSnapshot,
  SbApiResponse,
  SbApiSentence,
  SbBatch,
} from './types';
import {Buffer} from 'buffer';
import {uploadMedia} from './helpers';
import firebase from '@react-native-firebase/app';

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

const auth = firebase.auth();
const firestore = firebase.firestore();

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
    if (component.surface.trim() === '') {
      continue;
    }

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
  isAndroid: boolean = false,
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
    return null;
  }

  const filenameDecoded = Buffer.from(filenameBase64, 'base64').toString();
  const audioUrl = `${protocol}://${audioHost}/mp3/${filenameDecoded}`;

  return isAndroid ? uploadMedia(audioUrl, 'audio') : audioUrl;
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
      Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`,
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

const getPendingSentencesPage = async (
  startAfter?: QueryDocumentSnapshot,
): Promise<[SbApiSentence[], QueryDocumentSnapshot?]> => {
  let sentenceQuery = firestore
    .collection('sentences')
    .where('userUid', '==', auth.currentUser?.uid)
    .where('isPending', '==', true)
    .orderBy('createdAt', 'desc')
    .limit(50);

  if (startAfter) {
    sentenceQuery = sentenceQuery.startAfter(startAfter);
  }

  const sentenceSnapshot = await sentenceQuery.get();

  if (sentenceSnapshot.docs.length === 0) {
    return [[]];
  }

  const wordMap = new Map();
  const wordIds = [
    ...new Set(sentenceSnapshot.docs.map(doc => doc.data().wordId)),
  ];
  const words = await Promise.all(
    wordIds.map(wordId =>
      firestore
        .collection('words')
        .where(firebase.firestore.FieldPath.documentId(), '==', wordId)
        .limit(1)
        .get(),
    ),
  );

  for (const snap of words) {
    wordMap.set(snap.docs[0].id, snap.docs[0].data());
  }

  const sentences = sentenceSnapshot.docs.map(sentenceDoc => {
    const sentenceData = sentenceDoc.data();
    const wordData = wordMap.get(sentenceData.wordId);

    return {
      sentenceId: sentenceDoc.id,
      wordId: sentenceData.wordId,
      dictionaryForm: wordData?.dictionaryForm ?? 'unknown',
      reading: wordData?.reading ?? 'unknown',
      sentence: sentenceData.sentence,
      frequency: wordData?.frequency ?? 0,
      tags: sentenceData.tags,
    };
  });

  return [
    sentences,
    sentenceSnapshot.docs.length > 0
      ? sentenceSnapshot.docs[sentenceSnapshot.docs.length - 1]
      : undefined,
  ];
};

export const getPendingSentences = async (): Promise<SbApiSentence[]> => {
  let [currentPage, startAfter] = await getPendingSentencesPage();
  let sentences: SbApiSentence[] = [...currentPage];

  while (startAfter) {
    const result = await getPendingSentencesPage(startAfter);
    sentences = [...sentences, ...result[0]];
    startAfter = result[1];
  }

  return sentences;
};

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
  await sentenceBaseApiRequest<{batchId: string}>('post', 'batches', {
    sentences: sentenceIds,
  });

export const getSentenceBatchById = async (id: string): Promise<SbBatch> => {
  const snapshot = await firestore
    .collection('batches')
    .where('userUid', '==', auth.currentUser?.uid)
    .where(firebase.firestore.FieldPath.documentId(), '==', id)
    .limit(1)
    .get();

  return {
    id: snapshot.docs[0].id,
    ...snapshot.docs[0].data(),
  } as SbBatch;
};

export const getSentenceBatchesPage = async (
  startAfter?: QueryDocumentSnapshot,
): Promise<[SbBatch[], QueryDocumentSnapshot?]> => {
  let query = firestore
    .collection('batches')
    .where('userUid', '==', auth.currentUser?.uid)
    .orderBy('createdAt', 'desc')
    .limit(20);

  if (startAfter) {
    query = query.startAfter(startAfter);
  }

  const snapshot = await query.get();

  return [
    snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as SbBatch[],
    snapshot.docs.length > 0
      ? snapshot.docs[snapshot.docs.length - 1]
      : undefined,
  ];
};

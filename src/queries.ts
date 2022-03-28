import {
  Morpheme,
  SbApiGetPendingSentencesResponse,
  SbApiResponse,
  SbApiSentenence,
} from './types';
import auth from '@react-native-firebase/auth';

type KotuResponse = {
  accentPhrases: {
    components: {
      surface: string;
      surfaceOriginal: string;
      originalKana: string;
    }[];
  }[];
}[];

const sentenceBaseApiUrl =
  'https://us-central1-sentence-base.cloudfunctions.net/api/v1';
const kotuUrl = 'https://kotu.io/api/dictionary/parse';

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
      dictionaryForm: (component.surfaceOriginal || component.surface).trim(),
      reading: (component.originalKana || component.surface).trim(),
    });
  }

  return morphemes;
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

export const getPendingSentences = async (): Promise<SbApiSentenence[]> =>
  (
    await sentenceBaseApiRequest<SbApiGetPendingSentencesResponse>(
      'get',
      'sentences',
    )
  ).sentences;

export const deleteSentence = async (sentenceId: string) =>
  await sentenceBaseApiRequest('delete', `sentences/${sentenceId}`);

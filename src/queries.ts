import {katakanaToHiragana} from './helpers';
import {MecabMorpheme, Morpheme} from './types';
import auth from '@react-native-firebase/auth';

type KotuResponse = {
  accentPhrases: {
    components: {
      surface: string;
      frequencySurface: string;
      kana: string;
      original: string;
    }[];
  }[];
}[];

const sentenceBaseApiUrl =
  'https://us-central1-sentence-base.cloudfunctions.net/api/v1';
const kotuUrl = 'https://kotu.io/api/dictionary/parse';

export const kotuQuery = async (
  query: string,
  mecabQuery: (query: string) => Promise<MecabMorpheme[]>,
): Promise<Morpheme[]> => {
  const response = await fetch(kotuUrl, {method: 'post', body: query});
  const sentences = (await response.json()) as KotuResponse;
  const components = sentences
    .flatMap(sentence => sentence.accentPhrases)
    .flatMap(accentPhrase => accentPhrase.components);

  const morphemes: Morpheme[] = [];
  for (const component of components) {
    const surface = component.surface.trim();
    const frequencySurface = component.frequencySurface.trim();
    const dictionaryForm = frequencySurface || surface;
    const mecabMorphemes = await mecabQuery(dictionaryForm);
    const isParticle =
      mecabMorphemes.length === 1 &&
      ['助動詞', '助詞'].includes(mecabMorphemes[0]?.pos);

    morphemes.push({
      surface: surface,
      dictionaryForm: frequencySurface || surface,
      reading: !isParticle
        ? mecabMorphemes
            .map(morpheme => katakanaToHiragana(morpheme.reading ?? surface))
            .join('')
            .trim()
        : surface,
    });
  }

  return morphemes;
};

const sentenceBaseApiRequest = async (
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
  const json = await response.json();

  if (!json.success) {
    console.log(json);
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
) => {
  return sentenceBaseApiRequest('post', 'sentences', {
    dictionaryForm,
    reading,
    sentence,
    tags,
  });
};

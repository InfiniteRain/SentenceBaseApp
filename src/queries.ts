import {Morpheme} from './types';

type KotuResponse = {
  accentPhrases: {
    components: {
      surface: string;
      frequencySurface: string;
      kana: string;
    }[];
  }[];
}[];

const kotuUrl = 'https://kotu.io/api/dictionary/parse';

export const kotuQuery = async (query: string): Promise<Morpheme[]> => {
  const response = await fetch(kotuUrl, {method: 'post', body: query});
  const sentences = (await response.json()) as KotuResponse;
  return sentences
    .flatMap(sentence => sentence.accentPhrases)
    .flatMap(accentPhrase => accentPhrase.components)
    .map(component => ({
      surface: component.surface,
      dictionaryForm: component.frequencySurface || component.surface,
      reading: component.kana,
    }));
};

// 唐突に、波の奥で血しぶきが上がった。
// 猫が鳴いている。

// todo: display different text on tag history when no query found

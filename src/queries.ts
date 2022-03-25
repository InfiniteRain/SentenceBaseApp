import {Morpheme} from './types';

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

const kotuUrl = 'https://kotu.io/api/dictionary/parse';

const dictionaryFormReading = (
  surface: string,
  kana: string,
  frequencySurface: string,
  original: string,
) => {
  if (frequencySurface === kana) {
    return kana;
  }

  if (!/[一-龯]/.test(frequencySurface)) {
    return frequencySurface;
  }

  const surfaceToCheck = surface === kana ? original : surface;
  const surfaceReverse = [...surfaceToCheck].reverse().join('');
  const kanaReverse = [...kana].reverse().join('');

  console.log(surfaceToCheck, surfaceReverse, kanaReverse);

  for (let i = 0; i < kanaReverse.length; i++) {
    if (kanaReverse[i] === surfaceReverse[i]) {
      continue;
    }

    const beginning = [...kanaReverse.substring(i)].reverse().join('');
    const ending = frequencySurface.substring(surface.length - i);
    const reading = `${beginning}${ending}`;

    console.log(`"${beginning}" + "${ending}"`);

    return reading;
  }

  return kana;
};

export const kotuQuery = async (query: string): Promise<Morpheme[]> => {
  const response = await fetch(kotuUrl, {method: 'post', body: query});
  const sentences = (await response.json()) as KotuResponse;
  return sentences
    .flatMap(sentence => sentence.accentPhrases)
    .flatMap(accentPhrase => accentPhrase.components)
    .map(component => ({
      surface: component.surface,
      dictionaryForm: !/[一-龯]/.test(component.surface)
        ? component.frequencySurface
        : component.frequencySurface === component.kana
        ? component.original
        : component.frequencySurface,
      reading: dictionaryFormReading(
        component.surface,
        component.kana,
        component.frequencySurface,
        component.original,
      ),
    }));
};

// 唐突に、波の奥で血しぶきが上がった。
// 唐突に、波の奥で血飛沫が上がった。
// 猫が鳴いている。

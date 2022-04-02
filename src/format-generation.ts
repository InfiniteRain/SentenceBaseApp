import {katakanaToHiragana} from './helpers';
import {kotuQuery} from './queries';
import {Morpheme} from './types';

const caclulateBracketPosition = (
  morpheme: Morpheme,
): {
  bracketPosition: number;
  furigana: string;
} => {
  if (!morpheme.surfaceReading) {
    return {
      bracketPosition: morpheme.surface.length,
      furigana: '',
    };
  }

  const reverseReading = katakanaToHiragana(
    morpheme.surfaceReading.split('').reverse().join(''),
  );
  const reverseWord = katakanaToHiragana(
    morpheme.surface.split('').reverse().join(''),
  );

  for (let i = 0; i < reverseReading.length; i++) {
    if (reverseReading[i] !== reverseWord[i]) {
      return {
        bracketPosition: morpheme.surface.length - i,
        furigana: reverseReading.substring(i).split('').reverse().join(''),
      };
    }
  }

  return {
    bracketPosition: morpheme.surface.length,
    furigana: '',
  };
};

const getPitchAccentString = (morpheme: Morpheme) =>
  morpheme.pitchAccents
    .filter(pitchAccent => pitchAccent.mora !== -1)
    .map(pitchAccent => {
      switch (pitchAccent.descriptive) {
        case 'atamadaka':
          return 'a';
        case 'nakadaka':
          return `n${pitchAccent.mora}`;
        case 'odaka':
          return 'o';
        case 'heiban':
          return 'h';
        case 'kihuku':
          return `k${pitchAccent.mora}`;
        default:
          return '';
      }
    })
    .join(',');

export const generateExtendedFormat = async (text: string) => {
  const morphemes = await kotuQuery(text);
  const formattedSegments: string[] = [];

  for (const morpheme of morphemes) {
    if (morpheme.isBasic) {
      formattedSegments.push(morpheme.surface);
      continue;
    }

    const {bracketPosition, furigana} = caclulateBracketPosition(morpheme);
    const dictionaryFormPart =
      // todo: [verb, adjective].includes(pos);
      morpheme.dictionaryFormReading !== morpheme.surfaceReading
        ? `,${morpheme.dictionaryFormReading}`
        : '';
    const pitchPart = `;${getPitchAccentString(morpheme)}`;
    const bracketContent = `[${furigana}${dictionaryFormPart}${pitchPart}]`;
    const formattedSegment =
      bracketContent !== '[;]'
        ? morpheme.surface.slice(0, bracketPosition) +
          bracketContent +
          morpheme.surface.slice(bracketPosition)
        : morpheme.surface;

    formattedSegments.push(formattedSegment);
  }

  return formattedSegments.join(' ');
};

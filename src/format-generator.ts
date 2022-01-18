import {MecabMorpheme} from './app-state-context';
import {DictionaryEntry} from './common';

type AnalyzedMorpheme = {
  originalMorpheme: MecabMorpheme;
  textEntry: string;
};

const verb = '動詞';
const auxiliary = '助動詞';
const particle = '助詞';
const symbol = '記号';
const adjective = '形容詞';
const auxiliaryVerbs = ['せる', 'れる', 'られる', 'させる'];
const ignoreWords = [
  'ある',
  'で',
  'そうして',
  'こうして',
  'どんなに',
  'あんなに',
  'こんなに',
  'そんなに',
  'たる',
  'だが',
  'ああ',
  'こう',
  'こんな',
  'ときの',
  'どんな',
  'あんな',
  'そんな',
  'どの',
  'ために',
  'ような',
  'だし',
  'どう',
  'そう',
  'ことに',
  'ですから',
  'よう',
  'あの',
  'この',
  'その',
  'いた',
  'うら',
  'あるは',
  'なさ',
  'あり',
  'ん',
  'す',
  'しま',
  'てる',
  'さん',
  'さ',
  'し',
  'せ',
  'うか',
  'あ',
  'う',
  'な',
  'こん',
  'そん',
  'あん',
  'かん',
  'どん',
  'せん',
  'だから',
  'どうで',
  'あれで',
  'なる',
];

const combinationMap = [
  ['ない', 'でしょ', 'う'],
  ['ない', 'で'],
  ['ない'],
  ['ます'],
  ['ませ', 'ん', 'でし', 'たら'],
  ['ませ', 'ん', 'でし', 'た'],
  ['ませ', 'ん'],
  ['ませ', 'ば'],
  ['ますれ', 'ば'],
  ['う'],
  ['ましょ', 'う'],
  ['ましょ'],
  ['まし', 'た'],
  ['まし', 'たら'],
  ['まし', 'たろ', 'う'],
  ['て'],
  ['た', 'でしょ', 'う'],
  ['た'],
  ['たら'],
  ['なかっ', 'た', 'でしょ', 'う'],
  ['なかっ', 'た'],
  ['なかっ', 'たら'],
  ['なけれ', 'ば'],
  ['ば'],
  ['せ', 'た'],
  ['せ', 'ない'],
  ['せ', 'なかっ', 'た'],
  ['せ', 'て'],
  ['せ', 'ます'],
  ['せ', 'ませ', 'ん'],
  ['せる'],
  ['れ', 'た'],
  ['れ', 'ない'],
  ['れ', 'なかっ', 'た'],
  ['れ', 'て'],
  ['れ', 'ます'],
  ['れ', 'ませ', 'ん'],
  ['れる'],
  ['られ', 'た'],
  ['られ', 'ない'],
  ['られ', 'なかっ', 'た'],
  ['られ', 'て'],
  ['られ', 'ます'],
  ['られ', 'ませ', 'ん'],
  ['られる'],
  ['させ', 'た'],
  ['させ', 'ない'],
  ['させ', 'なかっ', 'た'],
  ['させ', 'て'],
  ['させ', 'ます'],
  ['させ', 'ませ', 'ん'],
  ['させる'],
];

const combineVerbs = (morphemes: MecabMorpheme[]): AnalyzedMorpheme[] => {
  const analyzedMorphemes: AnalyzedMorpheme[] = [];

  for (let i = 0; i < morphemes.length; i++) {
    const morpheme = morphemes[i];

    if (morpheme.pos !== verb) {
      analyzedMorphemes.push({
        originalMorpheme: morpheme,
        textEntry: morpheme.word,
      });
      continue;
    }

    let textEntry = morpheme.word;

    for (const combination of combinationMap) {
      let match = true;
      let combinationTextEntry = morpheme.word;

      for (const [key, word] of combination.entries()) {
        const futureIndex = i + key + 1;
        const futureMorpheme = morphemes[futureIndex];
        const isAllowedPOS =
          [auxiliary, particle].includes(futureMorpheme?.pos) ||
          (futureMorpheme?.pos === verb &&
            auxiliaryVerbs.includes(futureMorpheme?.dictionary_form));

        if (!futureMorpheme || !isAllowedPOS || futureMorpheme.word !== word) {
          match = false;
          break;
        }

        combinationTextEntry += futureMorpheme.word;
      }

      if (match) {
        i += combination.length;
        textEntry = combinationTextEntry;
        break;
      }
    }

    analyzedMorphemes.push({
      originalMorpheme: morpheme,
      textEntry: textEntry,
    });
  }

  return analyzedMorphemes;
};

export const katakanaToHiragana = (text: string): string => {
  const hiragana =
    'がぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽ' +
    'あいうえおかきくけこさしすせそたちつてと' +
    'なにぬねのはひふへほまみむめもやゆよらりるれろ' +
    'わをんぁぃぅぇぉゃゅょっゐゑ';
  const katakana =
    'ガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポ' +
    'アイウエオカキクケコサシスセソタチツテト' +
    'ナニヌネノハヒフヘホマミムメモヤユヨラリルレロ' +
    'ワヲンァィゥェォャュョッヰヱ';

  let finalWord = '';

  for (const char of text) {
    const key = katakana.indexOf(char);

    finalWord += key === -1 ? char : hiragana[key];
  }

  return finalWord;
};

const caclulateBracketPosition = (
  morpheme: MecabMorpheme,
): {
  bracketPosition: number;
  furigana: string;
} => {
  if (!morpheme.reading) {
    return {
      bracketPosition: morpheme.word.length,
      furigana: '',
    };
  }

  const reverseReading = katakanaToHiragana(
    morpheme.reading.split('').reverse().join(''),
  );
  const reverseWord = katakanaToHiragana(
    morpheme.word.split('').reverse().join(''),
  );

  for (let i = 0; i < reverseReading.length; i++) {
    if (reverseReading[i] !== reverseWord[i]) {
      return {
        bracketPosition: morpheme.word.length - i,
        furigana: reverseReading.substring(i).split('').reverse().join(''),
      };
    }
  }

  return {
    bracketPosition: morpheme.word.length,
    furigana: '',
  };
};

const getPitchAccentString = (
  morpheme: MecabMorpheme,
  dictionaryEntry: DictionaryEntry,
) =>
  dictionaryEntry.pitchNames
    .map((group, groupKey) =>
      group
        .map((pitchName, pitchKey) => {
          const dropNum = dictionaryEntry.pitchNums[groupKey]?.[pitchKey] ?? 1;

          if (
            [verb, adjective].includes(morpheme.pos) &&
            !['平板', '尾高'].includes(pitchName)
          ) {
            return `k${dropNum}`;
          }

          switch (pitchName) {
            case '頭高':
              return 'a';
            case '中高':
              return `n${dropNum}`;
            case '尾高':
              return 'o';
            case '平板':
              return 'h';
          }
        })
        .join(''),
    )
    .join(',');

export const generateExtendedFormat = async (
  text: string,
  mecabQuery: (query: string) => Promise<MecabMorpheme[]>,
  dictionaryQuery: (
    dictionaryForm: string,
    reading: string,
  ) => Promise<DictionaryEntry>,
) => {
  const morphemes = await mecabQuery(text);
  const analyzedMorphemes = combineVerbs(morphemes);
  const formattedSegments: string[] = [];

  for (const morpheme of analyzedMorphemes) {
    const dictionaryFormReadingMorpheme = (
      await mecabQuery(morpheme.originalMorpheme.dictionary_form)
    )[0];

    if (
      [particle, auxiliary, symbol].includes(morpheme.originalMorpheme.pos) ||
      !morpheme.originalMorpheme.reading ||
      !dictionaryFormReadingMorpheme.reading ||
      ignoreWords.includes(morpheme.originalMorpheme.dictionary_form)
    ) {
      formattedSegments.push(morpheme.textEntry);
      continue;
    }

    const {bracketPosition, furigana} = caclulateBracketPosition(
      morpheme.originalMorpheme,
    );
    const dictionaryFormReading = katakanaToHiragana(
      dictionaryFormReadingMorpheme.reading,
    );
    const dictionaryFormPart = [verb, adjective].includes(
      morpheme.originalMorpheme.pos,
    )
      ? `,${dictionaryFormReading}`
      : '';
    const dictionaryEntry = await dictionaryQuery(
      dictionaryFormReadingMorpheme.dictionary_form,
      dictionaryFormReading,
    );
    const pitchString = getPitchAccentString(
      morpheme.originalMorpheme,
      dictionaryEntry,
    );
    const pitchPart = `;${pitchString}`;
    const bracketContent = `[${furigana}${dictionaryFormPart}${pitchPart}]`;

    const formattedSegment =
      bracketContent !== '[;]'
        ? morpheme.textEntry.slice(0, bracketPosition) +
          bracketContent +
          morpheme.textEntry.slice(bracketPosition)
        : morpheme.textEntry;

    formattedSegments.push(formattedSegment);
  }

  return formattedSegments.join(' ');
};

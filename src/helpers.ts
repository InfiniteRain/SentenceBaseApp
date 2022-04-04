const frequencyList0 = new Map<string, number>(
  Object.entries({
    ...require('./frequency-lists/jp-dict-1.json'),
    ...require('./frequency-lists/jp-dict-2.json'),
    ...require('./frequency-lists/jp-dict-3.json'),
  }),
);
const frequencyList1 = new Map<string, number>(
  Object.entries({
    ...require('./frequency-lists/jp-dict-4.json'),
    ...require('./frequency-lists/jp-dict-5.json'),
  }),
);

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

export const wordFrequency = (
  dictionaryForm: string,
  reading: string,
): number => {
  const key = `${dictionaryForm}|${katakanaToHiragana(reading)}`;

  return frequencyList0.get(key) ?? frequencyList1.get(key) ?? 999999;
};

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

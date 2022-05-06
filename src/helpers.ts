import RNFS from 'react-native-fs';
import AnkiDroid from 'react-native-ankidroid';
import uuid from 'react-native-uuid';

const fileDirectoryNAme = 'media';

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

const cleanMediaFolder = async () => {
  try {
    const files = await RNFS.readDir(
      `${RNFS.ExternalDirectoryPath}/${fileDirectoryNAme}`,
    );

    for (const file of files) {
      RNFS.unlink(file.path);
    }
  } catch {}
};

export const uploadMedia = async (
  url: string,
  mimeType: 'audio' | 'image',
): Promise<string | null> => {
  await cleanMediaFolder();

  try {
    await RNFS.mkdir(`${RNFS.ExternalDirectoryPath}/${fileDirectoryNAme}`);
  } catch {
    return null;
  }

  const extension = /(?:\.([^.]+))?$/.exec(url)?.[1];
  const fileName = `${uuid.v4().toString()}${extension ? '.' + extension : ''}`;
  const filePath = `${RNFS.ExternalDirectoryPath}/${fileDirectoryNAme}/${fileName}`;

  const {promise} = RNFS.downloadFile({
    fromUrl: url,
    toFile: filePath,
  });

  try {
    await promise;
  } catch {
    return null;
  }

  const [uploadError, formattedString] = await AnkiDroid.uploadMediaFromUri(
    `file://${filePath}`,
    fileName.substring(0, fileName.lastIndexOf('.')),
    mimeType,
  );

  if (uploadError || typeof formattedString !== 'string') {
    return null;
  }

  return formattedString;
};

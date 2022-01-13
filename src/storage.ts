import AsyncStorage from '@react-native-async-storage/async-storage';

export const getStorageItem = async (key: string): Promise<string | null> => {
  let value: string | null;

  try {
    value = await AsyncStorage.getItem(key);
  } catch {
    return null;
  }

  return value;
};

export const setStorageItem = async (
  key: string,
  value: string,
): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch {}
};

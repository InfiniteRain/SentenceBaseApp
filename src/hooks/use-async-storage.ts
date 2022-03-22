import AsyncStorage from '@react-native-async-storage/async-storage';
import {useState, useEffect, useCallback, useRef} from 'react';

// Code from: https://github.com/react-native-async-storage/async-storage/issues/32#issuecomment-798922343
// Slightly modified to feet the needs of the app.

export const useAsyncStorage = <T>(
  key: string,
  defaultValue: T,
): [T, (mutator: (currentValue: T) => T) => void, boolean] => {
  const [state, setState] = useState({
    hydrated: false,
    storageValue: defaultValue,
  });
  const {hydrated, storageValue} = state;
  const valueRef = useRef<T>(state.storageValue);

  valueRef.current = state.storageValue;

  useEffect(() => {
    const pullFromStorage = async () => {
      let value = defaultValue;
      try {
        const fromStorage = await AsyncStorage.getItem(key);
        if (fromStorage) {
          value = JSON.parse(fromStorage);
        }
      } catch (e) {
        console.log('Could not read from storage for key: ', key, e);
      }

      return value;
    };
    pullFromStorage().then(value => {
      setState({hydrated: true, storageValue: value});
    });

    // We don't want to update when the defaultValue changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const updateStorage = useCallback(
    async (mutator: (currentValue: T) => T) => {
      const newValue = mutator(valueRef.current);
      setState({hydrated: true, storageValue: newValue});
      const stringifiedValue = JSON.stringify(newValue);
      await AsyncStorage.setItem(key, stringifiedValue);
    },
    [key],
  );

  return [storageValue, updateStorage, hydrated];
};

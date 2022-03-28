import Clipboard from '@react-native-clipboard/clipboard';
import {useEffect, useState} from 'react';
import {NativeEventEmitter, NativeModules, Platform} from 'react-native';

const clipboardEventEmitter = new NativeEventEmitter(
  NativeModules.ClipboardListener,
);

export const useClipboard = (options?: {enabled?: boolean}) => {
  const [clipboardEntry, setClipboardEntry] = useState<string>('');

  useEffect(() => {
    if (options?.enabled === false) {
      return;
    }

    if (Platform.OS === 'ios') {
      clipboardEventEmitter.addListener('clipboardUpdate', (entry: string) => {
        setClipboardEntry(entry);
      });

      return () => {
        clipboardEventEmitter.removeAllListeners('clipboardUpdate');
      };
    }

    let lastEntry: string | undefined;
    const timeout = setInterval(async () => {
      const entry = await Clipboard.getString();

      if (typeof lastEntry === 'undefined') {
        lastEntry = entry;
        return;
      }

      if (entry !== lastEntry) {
        setClipboardEntry(entry);
      }

      lastEntry = entry;
    }, 100);

    return () => {
      clearTimeout(timeout);
    };
  }, [options?.enabled]);

  return clipboardEntry;
};

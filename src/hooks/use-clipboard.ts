import Clipboard from '@react-native-clipboard/clipboard';
import {useEffect, useState} from 'react';
import {NativeEventEmitter, NativeModules, Platform} from 'react-native';

const clipboardEventEmitter = new NativeEventEmitter(
  NativeModules.ClipboardListener,
);

export const useClipboard = () => {
  const [clipboardEntry, setClipboardEntry] = useState<string>('');

  useEffect(() => {
    if (Platform.OS === 'ios') {
      clipboardEventEmitter.addListener('clipboardUpdate', (entry: string) => {
        setClipboardEntry(entry);
      });

      return () => {
        clipboardEventEmitter.removeAllListeners('clipboardUpdate');
      };
    }

    let lastEntry = '';
    const timeout = setInterval(async () => {
      const entry = await Clipboard.getString();

      if (entry !== lastEntry) {
        setClipboardEntry(entry);
      }

      lastEntry = entry !== '' ? entry : lastEntry;
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return clipboardEntry;
};

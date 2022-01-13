import React, {useContext, useEffect, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import AnkiDroid from 'react-native-ankidroid';
import {Page, AppStateContext} from '../app-state-context';
import {colors} from '../colors';
import auth from '@react-native-firebase/auth';

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  firstMenuButton: {
    width: '80%',
    borderRadius: 5,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  menuButton: {
    width: '80%',
    borderRadius: 5,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    backgroundColor: colors.primary,
  },
  menuButtonText: {
    color: colors.lighter,
  },
});

export const MainMenu = () => {
  const {setCurrentPage} = useContext(AppStateContext);

  const [isLoading, setLoading] = useState(false);
  const [isApiAvailable, setApiAvailable] = useState(false);

  const onMining = async () => {
    // setCurrentPage(Page.Mining);
  };

  const onPending = async () => {
    // setCurrentPage(Page.PendingSentences);
  };

  const onNewBatch = async () => {
    // setCurrentPage(Page.NewBatch);
  };

  const onLogout = async () => {
    // setLoading(true);
    // await clearTokens();
    // setCurrentPage(Page.LoginScreen);
    await auth().signOut();
  };

  const onExport = async () => {
    const [requestError, requestAnswer] = await AnkiDroid.requestPermission();

    if (requestError !== null || requestAnswer !== 'granted') {
      return;
    }

    // setCurrentPage(Page.Export);
  };

  useEffect(() => {
    AnkiDroid.isApiAvailable().then(apiAvailable => {
      setApiAvailable(apiAvailable);
    });
  }, []);

  return (
    <View style={styles.mainContainer}>
      <TouchableOpacity
        style={styles.firstMenuButton}
        onPress={onMining}
        disabled={isLoading}>
        <Text style={styles.menuButtonText}>MINING</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.menuButton}
        onPress={onPending}
        disabled={isLoading}>
        <Text style={styles.menuButtonText}>PENDING SENTENCES</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.menuButton}
        onPress={onNewBatch}
        disabled={isLoading}>
        <Text style={styles.menuButtonText}>NEW BATCH</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.menuButton,
          {
            backgroundColor: isApiAvailable ? colors.primary : colors.grey,
          },
        ]}
        onPress={onExport}
        disabled={isLoading || !isApiAvailable}>
        <Text style={styles.menuButtonText}>EXPORT</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.menuButton}
        onPress={onLogout}
        disabled={isLoading}>
        <Text style={styles.menuButtonText}>LOGOUT</Text>
      </TouchableOpacity>
    </View>
  );
};

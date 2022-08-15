import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {View, StyleSheet} from 'react-native';
import {DrawerItem, DrawerContentScrollView} from '@react-navigation/drawer';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import {LayoutContext} from '../../contexts/layout-context';
import {RootNavigatorScreenProps} from '../../types';
import {SentenceCacheContext} from '../../contexts/sentence-cache-context';
import {Caption} from '../elements/Caption';
import {Text} from '../elements/Text';
import {Divider} from '../elements/Divider';
import firebase from '@react-native-firebase/app';

const auth = firebase.auth();
const firestore = firebase.firestore();

export function DrawerContent({navigation}: RootNavigatorScreenProps) {
  const {theme} = useContext(LayoutContext);
  const {setDoSentencesQuery, ignoreNextUpdate, setIgnoreNextUpdate} =
    useContext(SentenceCacheContext);

  const [pendingSentences, setPendingSentences] = useState(0);
  const [minedBatches, setMinedBatches] = useState(0);
  const [lastPendingSentencesCount, setLastPendingSentencesCount] = useState<
    number | null
  >(null);
  const [lastMinedBatchesCount, setLastMinedBatchesCount] = useState<
    number | null
  >(null);

  const email = useMemo<string>(() => {
    return auth.currentUser?.email ?? '';
  }, []);

  useEffect(() => {
    const userUid = auth.currentUser?.uid;

    if (!userUid) {
      return;
    }

    return firestore
      .collection('users')
      .doc(userUid)
      .onSnapshot(snap => {
        const data = snap.data();
        const pendingSentencesCount = data?.pendingSentences ?? 0;
        const minedBatchesCount = data?.counters?.batches ?? 0;

        setPendingSentences(pendingSentencesCount);
        setMinedBatches(minedBatchesCount);

        const countsChanged =
          lastPendingSentencesCount !== pendingSentencesCount ||
          lastMinedBatchesCount !== minedBatchesCount;

        if (!countsChanged) {
          return;
        }

        setLastPendingSentencesCount(pendingSentencesCount);
        setLastMinedBatchesCount(minedBatchesCount);

        if (ignoreNextUpdate) {
          setIgnoreNextUpdate(false);
          return;
        }

        setDoSentencesQuery(true);
      });
  }, [
    setDoSentencesQuery,
    ignoreNextUpdate,
    setIgnoreNextUpdate,
    lastPendingSentencesCount,
    lastMinedBatchesCount,
  ]);

  const logout = useCallback(async () => {
    await auth.signOut();
  }, []);

  return (
    <DrawerContentScrollView>
      <View style={styles.iconView}>
        <FontAwesomeIcon
          name="user-circle-o"
          size={64}
          style={[styles.icon, {color: theme.colors.surfaceText}]}
        />
        <Caption style={styles.caption}>{email}</Caption>
      </View>
      <View style={styles.userInfoSection}>
        <View style={styles.stats}>
          <View style={styles.section}>
            <Text style={[styles.paragraph, styles.caption]}>
              {pendingSentences}
            </Text>
            <Caption style={styles.caption}>Sentences Pending</Caption>
          </View>
          <View style={styles.section}>
            <Text style={[styles.paragraph, styles.caption]}>
              {minedBatches}
            </Text>
            <Caption style={styles.caption}>Batches mined</Caption>
          </View>
        </View>
      </View>
      <View style={styles.drawerSection}>
        <Divider />
        <DrawerItem
          icon={({color, size}) => (
            <MaterialCommunityIcon name="table" color={color} size={size} />
          )}
          label="Mined Batches"
          onPress={() => {
            navigation.push('MinedBatches');
          }}
        />
        <DrawerItem
          icon={({color, size}) => (
            <MaterialCommunityIcon name="tune" color={color} size={size} />
          )}
          label="Preferences"
          onPress={() => {}}
        />
        <Divider />
        <View>
          <DrawerItem label="Logout" onPress={logout} />
        </View>
        <Divider />
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  iconView: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  icon: {
    marginBottom: 10,
  },
  userInfoSection: {
    paddingLeft: 20,
  },
  caption: {
    fontSize: 14,
    lineHeight: 14,
    paddingTop: 5,
  },
  stats: {
    marginTop: 15,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginTop: 5,
  },
  paragraph: {
    fontWeight: 'bold',
    marginRight: 3,
    paddingTop: 5,
  },
  drawerSection: {
    marginTop: 15,
  },
});

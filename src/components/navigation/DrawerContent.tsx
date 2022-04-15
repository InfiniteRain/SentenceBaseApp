import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {View, StyleSheet} from 'react-native';
import {DrawerItem, DrawerContentScrollView} from '@react-navigation/drawer';
import {Caption, Paragraph, Drawer} from 'react-native-paper';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import {LayoutContext} from '../../contexts/layout-context';
import {RootNavigatorScreenProps} from '../../types';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {SentenceCacheContext} from '../../contexts/sentence-cache-context';

export function DrawerContent({navigation}: RootNavigatorScreenProps) {
  const {theme} = useContext(LayoutContext);
  const {setDoSentencesQuery} = useContext(SentenceCacheContext);

  const [pendingSentences, setPendingSentences] = useState(0);
  const [minedBatches, setMinedBatches] = useState(0);

  const email = useMemo<string>(() => {
    return auth().currentUser?.email ?? '';
  }, []);

  useEffect(() => {
    const userUid = auth().currentUser?.uid;

    if (!userUid) {
      return;
    }

    let lastPendingSentencesCount: number | null = null;
    let lastMinedBatchesCount: number | null = null;

    return firestore()
      .collection('users')
      .doc(userUid)
      .onSnapshot(snap => {
        const data = snap.data();
        const pendingSentencesCount = data?.pendingSentences ?? 0;
        const minedBatchesCount = data?.counters.batches ?? 0;

        setPendingSentences(pendingSentencesCount);
        setMinedBatches(minedBatchesCount);

        if (
          lastPendingSentencesCount !== pendingSentencesCount ||
          lastMinedBatchesCount !== minedBatchesCount
        ) {
          setDoSentencesQuery(true);

          lastPendingSentencesCount = pendingSentencesCount;
          lastMinedBatchesCount = minedBatchesCount;
        }
      });
  }, [setDoSentencesQuery]);

  const logout = useCallback(async () => {
    await auth().signOut();
  }, []);

  return (
    <DrawerContentScrollView>
      <View style={styles.iconView}>
        <FontAwesomeIcon
          name="user-circle-o"
          size={64}
          style={[styles.icon, {color: theme.colors.onSurface}]}
        />
        <Caption style={styles.caption}>{email}</Caption>
      </View>
      <View style={styles.userInfoSection}>
        <View style={styles.stats}>
          <View style={styles.section}>
            <Paragraph style={[styles.paragraph, styles.caption]}>
              {pendingSentences}
            </Paragraph>
            <Caption style={styles.caption}>Sentences Pending</Caption>
          </View>
          <View style={styles.section}>
            <Paragraph style={[styles.paragraph, styles.caption]}>
              {minedBatches}
            </Paragraph>
            <Caption style={styles.caption}>Batches mined</Caption>
          </View>
        </View>
      </View>
      <Drawer.Section style={styles.drawerSection}>
        <DrawerItem
          icon={({color, size}) => (
            <MaterialCommunityIcon name="export" color={color} size={size} />
          )}
          label="Export Batch"
          onPress={() => {
            navigation.push('Export');
          }}
        />
        <DrawerItem
          icon={({color, size}) => (
            <MaterialCommunityIcon name="tune" color={color} size={size} />
          )}
          label="Preferences"
          onPress={() => {}}
        />
      </Drawer.Section>
      <Drawer.Section>
        <DrawerItem label="Logout" onPress={logout} />
      </Drawer.Section>
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

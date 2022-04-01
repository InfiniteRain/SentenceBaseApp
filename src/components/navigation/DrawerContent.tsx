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
import {ThemeContext} from '../../contexts/theme';
import {RootNavigatorProps} from '../../types';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export function DrawerContent({navigation}: RootNavigatorProps) {
  const {theme} = useContext(ThemeContext);

  const [pendingSentences, setPendingSentences] = useState(0);
  const [batchesMined, setBatchesMined] = useState(0);

  const email = useMemo<string>(() => {
    return auth().currentUser?.email ?? '';
  }, []);

  useEffect(() => {
    const userUid = auth().currentUser?.uid;

    if (!userUid) {
      return;
    }

    return firestore()
      .collection('users')
      .doc(userUid)
      .onSnapshot(snap => {
        const data = snap.data();

        setPendingSentences(data?.pendingSentences ?? 0);
        setBatchesMined(data?.counters.batches ?? 0);
      });
  }, []);

  const logout = useCallback(async () => {
    await auth().signOut();
  }, []);

  return (
    <DrawerContentScrollView>
      <View style={styles.iconView}>
        <FontAwesomeIcon
          name="user-circle-o"
          size={64}
          style={{
            ...styles.icon,
            ...{
              color: theme.colors.onSurface,
            },
          }}
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
              {batchesMined}
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
  },
  drawerSection: {
    marginTop: 15,
  },
});

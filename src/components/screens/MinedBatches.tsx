import {useInfiniteQuery} from '@tanstack/react-query';
import React, {useCallback, useContext, useMemo, useState} from 'react';
import {FlatList, RefreshControl, StyleSheet} from 'react-native';
import {ScrollView, TouchableOpacity} from 'react-native-gesture-handler';
import {SafeAreaView} from 'react-native-safe-area-context';
import {LayoutContext} from '../../contexts/layout-context';
import {getSentenceBatchesPage} from '../../queries';
import {QueryDocumentSnapshot, RootNavigationProps} from '../../types';
import {Caption} from '../elements/Caption';
import {Divider} from '../elements/Divider';
import {Text} from '../elements/Text';
import TimeAgo from 'javascript-time-ago';
import {SentenceCacheContext} from '../../contexts/sentence-cache-context';
import {useNavigation} from '@react-navigation/native';

const timeAgo = new TimeAgo('en-US');

const fetchBatches = ({
  pageParam = undefined,
}: {
  pageParam?: QueryDocumentSnapshot;
}) => getSentenceBatchesPage(pageParam);

export const MinedBatches = () => {
  const {theme} = useContext(LayoutContext);

  const navigation = useNavigation<RootNavigationProps>();

  const [isRefreshing, setRefreshing] = useState(false);

  const {batchesCount} = useContext(SentenceCacheContext);

  const {data, fetchNextPage, refetch} = useInfiniteQuery(
    ['batches'],
    fetchBatches,
    {
      getNextPageParam: ([_, startAfter]) => startAfter,
      cacheTime: 0,
    },
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().then(() => {
      setRefreshing(false);
    });
  }, [refetch]);
  const onBatchPress = useCallback(
    (batchId: string, index: number) => {
      navigation.navigate('Export', {batchId, index});
    },
    [navigation],
  );

  const batchesList = useMemo(
    () => data?.pages.flatMap(([page]) => page) ?? [],
    [data],
  );
  const refreshControl = useMemo(
    () => <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />,
    [isRefreshing, onRefresh],
  );

  return (
    <SafeAreaView style={styles.mainContainer} edges={['bottom']}>
      {batchesList.length > 0 ? (
        <FlatList
          ItemSeparatorComponent={() => <Divider />}
          data={batchesList}
          renderItem={({item, index}) => {
            const createdAt = new Date(item.createdAt.seconds * 1000);
            const formattedCreatedAt = timeAgo.format(createdAt);
            const batchIndex = batchesCount - index;
            const batchLabel = `#${batchIndex}: Mined ${formattedCreatedAt}`;

            return (
              <TouchableOpacity
                style={styles.listItemContainer}
                onPress={() => onBatchPress(item.id, batchIndex)}>
                <Text style={styles.minedOnText}>{batchLabel}</Text>
                <Text
                  style={[
                    styles.batchWordsText,
                    {color: theme.colors.disabledText},
                  ]}>
                  Words:{' '}
                  {item.sentences
                    .map(sentence => sentence.wordDictionaryForm)
                    .join(', ')}
                </Text>
              </TouchableOpacity>
            );
          }}
          onEndReachedThreshold={0.2}
          onEndReached={() => fetchNextPage()}
          refreshControl={refreshControl}
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.emptyNoticeView}
          refreshControl={refreshControl}>
          <Caption style={styles.emptyNoticeText}>
            There are no pending sentences yet.
          </Caption>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  listItemContainer: {
    padding: 10,
  },
  minedOnText: {
    fontSize: 18,
  },
  batchWordsText: {
    fontSize: 18,
  },
  emptyNoticeView: {
    flexGrow: 1,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  emptyNoticeText: {
    fontSize: 13,
    paddingHorizontal: 10,
  },
});

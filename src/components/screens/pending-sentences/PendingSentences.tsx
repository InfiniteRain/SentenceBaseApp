import {BottomSheetModal} from '@gorhom/bottom-sheet';
import {useIsFocused} from '@react-navigation/native';
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Button, Caption, Divider} from 'react-native-paper';
import {useQuery} from 'react-query';
import {CacheContext} from '../../../contexts/cache-context';
import {ThemeContext} from '../../../contexts/theme';
import {getPendingSentences} from '../../../queries';
import {SbApiSentenence} from '../../../types';
import {EditSheet} from './EditSheet';

export const PendingSentences = () => {
  const {theme} = useContext(ThemeContext);
  const {doPendingSentencesQuery, setDoPendingSentencesQuery} =
    useContext(CacheContext);

  const [sentences, setSentences] = useState<SbApiSentenence[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isFocused = useIsFocused();

  const editSheetRef = useRef<BottomSheetModal>(null);

  const {
    data: sentencesData,
    status: getSentencesStatus,
    refetch,
  } = useQuery(['getSentences', isFocused], () => getPendingSentences(), {
    enabled: isFocused && doPendingSentencesQuery,
    onSettled: () => {
      setIsRefreshing(false);
    },
  });

  useEffect(() => {
    if (sentencesData) {
      setSentences(sentencesData);
    }
  }, [sentencesData]);
  useEffect(() => {
    if (doPendingSentencesQuery && isFocused) {
      setDoPendingSentencesQuery(false);
    }
  }, [doPendingSentencesQuery, isFocused, setDoPendingSentencesQuery]);
  useEffect(() => {
    if (isFocused) {
      setIsRefreshing(false);
    }
  }, [isFocused]);

  const onSentencePressed = useCallback(() => {
    editSheetRef.current?.present();
  }, []);

  return (
    <View style={styles.mainContainer}>
      {sentences.length > 0 || getSentencesStatus === 'loading' ? (
        <FlatList
          ItemSeparatorComponent={() => <Divider />}
          renderItem={({item}: {item: SbApiSentenence}) => (
            <View>
              <TouchableOpacity
                style={styles.sentenceItemContainer}
                onPress={onSentencePressed}>
                <Text
                  style={{
                    ...styles.sentenceItemWordText,
                    ...{color: theme.colors.primary},
                  }}>
                  {item.dictionaryForm}（{item.reading}）
                </Text>
                <Text
                  style={{
                    ...styles.sentenceItemText,
                    ...{color: theme.colors.onSurface},
                  }}>
                  {item.sentence}
                </Text>
                <View style={styles.tagsContainer}>
                  {item.tags.map((tag, index) => (
                    <Text
                      key={index}
                      style={{
                        ...styles.tagsText,
                        ...{color: theme.colors.disabled},
                      }}>
                      {tag}
                    </Text>
                  ))}
                </View>
              </TouchableOpacity>
            </View>
          )}
          data={sentences ?? []}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing || getSentencesStatus === 'loading'}
              onRefresh={() => {
                setIsRefreshing(true);
                refetch();
              }}
            />
          }
        />
      ) : (
        <View style={styles.emptyNoticeView}>
          <Caption style={styles.emptyNoticeText}>
            There are no pending sentences yet.
          </Caption>
        </View>
      )}
      <Button
        mode="contained"
        style={styles.addNewBatch}
        color={theme.colors.primary}
        disabled={isRefreshing || getSentencesStatus === 'loading'}
        onPress={() => {}}>
        Add New Batch
      </Button>
      <EditSheet ref={editSheetRef} sentence={''} tags={[]} onEdit={() => {}} />
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  sentenceItemContainer: {
    padding: 5,
  },
  sentenceItemWordText: {
    fontSize: 20,
  },
  sentenceItemText: {
    fontSize: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
  },
  tagsText: {
    marginRight: 10,
  },
  addNewBatch: {
    marginHorizontal: 15,
    marginVertical: 15,
    height: 44,
    justifyContent: 'center',
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

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
import Toast from 'react-native-toast-message';
import {useMutation, useQuery} from 'react-query';
import {CacheContext} from '../../../contexts/cache-context';
import {ThemeContext} from '../../../contexts/theme';
import {deleteSentence, getPendingSentences} from '../../../queries';
import {SbApiSentenence} from '../../../types';
import {EditSheet} from './EditSheet';

export const PendingSentences = () => {
  const {theme} = useContext(ThemeContext);
  const {doPendingSentencesQuery, setDoPendingSentencesQuery} =
    useContext(CacheContext);

  const [sentences, setSentences] = useState<SbApiSentenence[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editSentenceId, setEditSentenceId] = useState('');
  const [editSentence, setEditSentence] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);

  const isFocused = useIsFocused();

  const editSheetRef = useRef<BottomSheetModal>(null);

  const {
    data: sentencesData,
    status: sentencesStatus,
    refetch: refetchSentences,
  } = useQuery(['getSentences', isFocused], () => getPendingSentences(), {
    enabled: isFocused && doPendingSentencesQuery,
    onSettled: () => {
      setIsRefreshing(false);
    },
    keepPreviousData: true,
  });

  const {mutate: mutateDeleteSentence, status: deleteSentenceStatus} =
    useMutation(({sentenceId}: {sentenceId: string}) =>
      deleteSentence(sentenceId),
    );

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

  const onSentencePressed = useCallback(
    (sentenceId: string, sentence: string, tags: string[]) => {
      setEditSentenceId(sentenceId);
      setEditSentence(sentence);
      setEditTags(tags);
      editSheetRef.current?.present();
    },
    [],
  );
  const onSentenceDelete = useCallback(
    (sentenceId: string) => {
      mutateDeleteSentence(
        {sentenceId},
        {
          onSuccess: () => {
            setSentences(currentSentences =>
              currentSentences.filter(
                sentence => sentence.sentenceId !== sentenceId,
              ),
            );
          },
          onError: () => {
            Toast.show({
              type: 'error',
              text1: 'Failed to delete the sentence.',
              position: 'top',
              visibilityTime: 10000,
            });
          },
        },
      );
    },
    [mutateDeleteSentence],
  );

  return (
    <View style={styles.mainContainer}>
      {sentences.length > 0 || sentencesStatus === 'loading' ? (
        <FlatList
          ItemSeparatorComponent={() => <Divider />}
          renderItem={({item}: {item: SbApiSentenence}) => (
            <View>
              <TouchableOpacity
                style={styles.sentenceItemContainer}
                onPress={() =>
                  onSentencePressed(item.sentenceId, item.sentence, item.tags)
                }
                disabled={deleteSentenceStatus === 'loading'}>
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
              refreshing={
                isRefreshing ||
                sentencesStatus === 'loading' ||
                deleteSentenceStatus === 'loading'
              }
              onRefresh={() => {
                setIsRefreshing(true);
                refetchSentences();
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
        disabled={
          isRefreshing ||
          sentencesStatus === 'loading' ||
          deleteSentenceStatus === 'loading'
        }
        onPress={() => {}}>
        Add New Batch
      </Button>
      <EditSheet
        ref={editSheetRef}
        sentenceId={editSentenceId}
        sentence={editSentence}
        tags={editTags}
        onDelete={onSentenceDelete}
      />
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

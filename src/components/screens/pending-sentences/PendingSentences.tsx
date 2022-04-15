import {BottomSheetModal} from '@gorhom/bottom-sheet';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {RefreshControl, ScrollView, StyleSheet, View} from 'react-native';
import {Caption} from 'react-native-paper';
import Toast from 'react-native-toast-message';
import {useMutation} from 'react-query';
import {SentenceCacheContext} from '../../../contexts/sentence-cache-context';
import {usePendingSentences} from '../../../hooks/use-pending-sentences';
import {deleteSentence, editSentence} from '../../../queries';
import {RootNavigatorParamList} from '../../../types';
import {SentenceList} from '../../elements/SentenceList';
import {EditSheet} from './EditSheet';
import {Button} from '../../elements/Button';

export const PendingSentences = () => {
  const {setSentenceList} = useContext(SentenceCacheContext);

  const [isRefreshing, setRefreshing] = useState(false);
  const [sentenceIdToEdit, setSentenceIdToEdit] = useState('');
  const [sentenceToEdit, setSentenceToEdit] = useState('');
  const [tagsToEdit, setTagsToEdit] = useState<string[]>([]);

  const {
    sentenceList,
    isFetching: isFetchingSentences,
    refetch: refetchSentences,
  } = usePendingSentences(() => {
    setRefreshing(false);
  });

  const navigation =
    useNavigation<NativeStackNavigationProp<RootNavigatorParamList>>();

  const isFocused = useIsFocused();

  const editSheetRef = useRef<BottomSheetModal>(null);

  const {mutate: deleteSentenceMutation, status: deleteSentenceStatus} =
    useMutation((props: {sentenceId: string}) =>
      deleteSentence(props.sentenceId),
    );
  const {mutate: editSentenceMutation, status: editSentenceStatus} =
    useMutation(
      (props: {sentenceId: string; sentence: string; tags: string[]}) =>
        editSentence(props.sentenceId, props.sentence, props.tags),
    );

  useEffect(() => {
    if (isFocused) {
      setRefreshing(false);
    }
  }, [isFocused]);

  const onListRefresh = useCallback(() => {
    setRefreshing(true);
    refetchSentences();
  }, [refetchSentences]);
  const onSentencePressed = useCallback(
    (sentenceId: string, sentence: string, tags: string[]) => {
      setSentenceIdToEdit(sentenceId);
      setSentenceToEdit(sentence);
      setTagsToEdit(tags);
      editSheetRef.current?.present();
    },
    [],
  );
  const onSentenceDelete = useCallback(
    (sentenceId: string) => {
      deleteSentenceMutation(
        {sentenceId},
        {
          onSuccess: () => {
            setSentenceList(currentSentences =>
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
    [deleteSentenceMutation, setSentenceList],
  );
  const onSentenceEdit = useCallback(
    (sentenceId: string, sentence: string, tags: string[]) => {
      editSentenceMutation(
        {sentenceId, sentence, tags},
        {
          onSuccess: () => {
            setSentenceList(currentSentences =>
              currentSentences.map(currentSentence =>
                currentSentence.sentenceId === sentenceId
                  ? {
                      ...currentSentence,
                      sentence,
                      tags,
                    }
                  : currentSentence,
              ),
            );
          },
          onError: () => {
            Toast.show({
              type: 'error',
              text1: 'Failed to edit the sentence.',
              position: 'top',
              visibilityTime: 10000,
            });
          },
        },
      );
    },
    [editSentenceMutation, setSentenceList],
  );

  const isDisabled = useMemo(
    () =>
      isRefreshing ||
      isFetchingSentences ||
      deleteSentenceStatus === 'loading' ||
      editSentenceStatus === 'loading',
    [
      isRefreshing,
      isFetchingSentences,
      deleteSentenceStatus,
      editSentenceStatus,
    ],
  );
  const refreshControl = useMemo(
    () => <RefreshControl refreshing={isDisabled} onRefresh={onListRefresh} />,
    [isDisabled, onListRefresh],
  );

  return (
    <View style={styles.mainContainer}>
      {sentenceList.length > 0 || isFetchingSentences ? (
        <SentenceList
          sentenceList={sentenceList ?? []}
          disabled={isDisabled}
          onSentencePressed={onSentencePressed}
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
      <Button
        title="Create New Batch"
        type="primary"
        disabled={isDisabled || sentenceList.length === 0}
        style={styles.addNewBatch}
        onPress={() => navigation.navigate('CreateBatch')}
      />
      <EditSheet
        ref={editSheetRef}
        sentenceId={sentenceIdToEdit}
        sentence={sentenceToEdit}
        tags={tagsToEdit}
        onDelete={onSentenceDelete}
        onEdit={onSentenceEdit}
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

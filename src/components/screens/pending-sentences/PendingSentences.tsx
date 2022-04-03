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
import {Button, Caption} from 'react-native-paper';
import Toast from 'react-native-toast-message';
import {useMutation} from 'react-query';
import {CacheContext} from '../../../contexts/cache-context';
import {LayoutContext} from '../../../contexts/layout-context';
import {usePendingSentences} from '../../../hooks/use-pending-sentences';
import {deleteSentence, editSentence} from '../../../queries';
import {RootNavigatorParamList} from '../../../types';
import {SentenceList} from '../../elements/SentenceList';
import {EditSheet} from './EditSheet';

export const PendingSentences = () => {
  const {theme} = useContext(LayoutContext);
  const {setSentenceList} = useContext(CacheContext);

  const [isRefreshing, setRefreshing] = useState(false);
  const [sentenceIdToEdit, setSentenceIdToEdit] = useState('');
  const [sentenceToEdit, setSentenceToEdit] = useState('');
  const [tagsToEdit, setTagsToEdit] = useState<string[]>([]);

  const {
    sentenceList,
    status: sentencesStatus,
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
      sentencesStatus === 'loading' ||
      deleteSentenceStatus === 'loading' ||
      editSentenceStatus === 'loading',
    [isRefreshing, sentencesStatus, deleteSentenceStatus, editSentenceStatus],
  );
  const refreshControl = useMemo(
    () => <RefreshControl refreshing={isDisabled} onRefresh={onListRefresh} />,
    [isDisabled, onListRefresh],
  );

  return (
    <View style={styles.mainContainer}>
      {sentenceList.length > 0 || sentencesStatus === 'loading' ? (
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
        mode="contained"
        style={styles.addNewBatch}
        color={theme.colors.primary}
        disabled={isDisabled || sentenceList.length === 0}
        onPress={() => navigation.navigate('CreateBatch')}>
        Create New Batch
      </Button>
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

import React, {useCallback, useContext, useMemo, useRef, useState} from 'react';
import {Platform, RefreshControl, StyleSheet, View} from 'react-native';
import {LayoutContext} from '../../../contexts/layout-context';
import {useSentences} from '../../../hooks/use-sentences';
import {SentenceList} from '../../elements/SentenceList';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import {Caption} from '../../elements/Caption';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useMutation} from '@tanstack/react-query';
import {
  RootNavigationProps,
  RootNavigatorParamList,
  SbSentence,
} from '../../../types';
import {useNavigation} from '@react-navigation/native';
import {createBatch, createBatchFromBacklog} from '../../../queries';
import {Button} from '../../elements/Button';
import {SentenceCacheContext} from '../../../contexts/sentence-cache-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ScrollView} from 'react-native-gesture-handler';
import {WordOptionsSheet} from './WordOptionsSheet';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import {getDummySbSentence} from '../../../helpers';

// todo: using buryLevel mechanics means that the cards
// will never surface back up so long as new cards
// with buryLevel 0 are being added.

type Props = NativeStackScreenProps<RootNavigatorParamList, 'CreateBatch'>;

const sentneceLimit = 10;

export const CreateBatch: React.FC<Props> = ({route}) => {
  const {theme} = useContext(LayoutContext);
  const {batchesCount} = useContext(SentenceCacheContext);

  const [optionsSentence, setOptionsSentence] = useState(getDummySbSentence());

  const navigation = useNavigation<RootNavigationProps>();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedSentencesIds, setSelectedSentenceIds] = useState<string[]>([]);
  const [wordsToMarkAsMined, setWordsToMarkAsMined] = useState<string[]>([]);
  const [wordsToPushToTheEnd, setWordsToPushToTheEnd] = useState<string[]>([]);

  const wordOptionsSheetRef = useRef<BottomSheetModal>(null);

  const {
    sentenceList,
    isFetching: isFetchingSentences,
    refetch: refetchSentences,
  } = useSentences(route.params.mode, () => {
    setIsRefreshing(false);
  });

  const {mutate: createBatchMutation, status: createBatchStatus} = useMutation(
    (props: {sentenceIds: string[]}) => createBatch(props.sentenceIds),
    {
      onSuccess({batchId}) {
        navigation.popToTop();
        navigation.navigate('Export', {
          batchId,
          index: batchesCount + 1,
          // todo: potential race?
        });
      },
    },
  );
  const {
    mutate: createBatchFromBacklogMutation,
    status: createBatchFromBacklogStatus,
  } = useMutation(
    (props: {
      sentenceIds: string[];
      markAsMined: string[];
      pushToTheEnd: string[];
    }) => {
      return createBatchFromBacklog(
        props.sentenceIds,
        props.markAsMined,
        props.pushToTheEnd,
      );
    },
    {
      onSuccess({batchId}) {
        navigation.popToTop();
        navigation.navigate('Export', {
          batchId,
          index: batchesCount + 1,
          // todo: potential race?
        });
      },
    },
  );

  const onListRefresh = useCallback(() => {
    setIsRefreshing(true);
    refetchSentences();
  }, [refetchSentences]);
  const onSentencePressed = useCallback(
    (sentence: SbSentence) => {
      if (wordsToMarkAsMined.includes(sentence.wordId)) {
        setWordsToMarkAsMined(words =>
          words.filter(wordId => wordId !== sentence.wordId),
        );
        return;
      }

      if (wordsToPushToTheEnd.includes(sentence.wordId)) {
        setWordsToPushToTheEnd(words =>
          words.filter(wordId => wordId !== sentence.wordId),
        );
        return;
      }

      if (selectedSentencesIds.includes(sentence.sentenceId)) {
        setSelectedSentenceIds(sentences =>
          sentences.filter(sentenceId => sentenceId !== sentence.sentenceId),
        );
        return;
      }

      setSelectedSentenceIds(list => [...list, sentence.sentenceId]);
    },
    [wordsToMarkAsMined, wordsToPushToTheEnd, selectedSentencesIds],
  );
  const onSentenceLongPressed = useCallback((sentence: SbSentence) => {
    setOptionsSentence(sentence);
    wordOptionsSheetRef.current?.present();
  }, []);
  const onMarkAsMined = useCallback((sentence: SbSentence) => {
    setWordsToMarkAsMined(words => [...words, sentence.wordId]);
  }, []);
  const onPushToTheEnd = useCallback((sentence: SbSentence) => {
    setWordsToPushToTheEnd(words => [...words, sentence.wordId]);
  }, []);
  const onConfirmBatchPressed = useCallback(() => {
    if (route.params.mode === 'pending') {
      createBatchMutation({sentenceIds: selectedSentencesIds});
      return;
    }

    createBatchFromBacklogMutation({
      sentenceIds: selectedSentencesIds,
      markAsMined: wordsToMarkAsMined,
      pushToTheEnd: wordsToPushToTheEnd,
    });
  }, [
    createBatchMutation,
    route,
    selectedSentencesIds,
    createBatchFromBacklogMutation,
    wordsToMarkAsMined,
    wordsToPushToTheEnd,
  ]);

  const sortedSentencesList = useMemo(
    () =>
      [...sentenceList].sort(
        (a, b) =>
          b.frequency - a.frequency ||
          a.dictionaryFrequency - b.dictionaryFrequency,
      ),
    [sentenceList],
  );
  const refreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={isRefreshing || isFetchingSentences}
        onRefresh={onListRefresh}
      />
    ),
    [isRefreshing, isFetchingSentences, onListRefresh],
  );
  const guideSteps = useMemo(
    () => [
      `Select top ${sentneceLimit} juiciest sentences`,
      'Confirm the sentence batch',
      'Export the batch to Anki',
    ],
    [],
  );
  const isLimitReached = useMemo(
    () =>
      selectedSentencesIds.length === sortedSentencesList.length ||
      selectedSentencesIds.length >= sentneceLimit,
    [selectedSentencesIds, sortedSentencesList],
  );
  const divider = useMemo(
    () => (
      <View
        style={[
          styles.dividerView,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.disabledText,
          },
        ]}>
        <FontAwesomeIcon
          name="caret-up"
          color={
            !isLimitReached
              ? theme.colors.surfaceText
              : theme.colors.disabledText
          }
          size={48}
          style={styles.leftCaret}
        />
        <FontAwesomeIcon
          name="caret-down"
          color={
            selectedSentencesIds.length > 0
              ? theme.colors.surfaceText
              : theme.colors.disabledText
          }
          size={48}
        />
      </View>
    ),
    [theme, isLimitReached, selectedSentencesIds],
  );
  const guide = useMemo(
    () => (
      <View style={styles.guideView}>
        {guideSteps.map((stepText, index) => (
          <Caption key={index} style={styles.guideText}>
            {index + 1}. {stepText}
          </Caption>
        ))}
      </View>
    ),
    [guideSteps],
  );

  const calculateDisabled = useCallback(
    (sentence: SbSentence): boolean => {
      if (
        isRefreshing ||
        isFetchingSentences ||
        createBatchStatus === 'loading' ||
        createBatchFromBacklogStatus === 'loading'
      ) {
        return true;
      }

      return (
        isLimitReached && !selectedSentencesIds.includes(sentence.sentenceId)
      );
    },
    [
      isRefreshing,
      isFetchingSentences,
      createBatchStatus,
      createBatchFromBacklogStatus,
      isLimitReached,
      selectedSentencesIds,
    ],
  );

  return (
    <SafeAreaView style={styles.mainContainer} edges={['bottom']}>
      {sortedSentencesList.length > 0 || route.params.mode === 'pending' ? (
        <SentenceList
          sentenceList={[
            ...(selectedSentencesIds.length > 0
              ? sortedSentencesList.filter(sentence =>
                  selectedSentencesIds.includes(sentence.sentenceId),
                )
              : [guide]),
            divider,
            ...sortedSentencesList.filter(
              sentence => !selectedSentencesIds.includes(sentence.sentenceId),
            ),
          ]}
          disabled={calculateDisabled}
          onSentencePressed={onSentencePressed}
          onSentenceLongPressed={
            route.params.mode === 'backlog' ? onSentenceLongPressed : undefined
          }
          refreshControl={refreshControl}
          wordsToMarkAsMined={wordsToMarkAsMined}
          wordsToPushToTheEnd={wordsToPushToTheEnd}
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.emptyNoticeView}
          refreshControl={refreshControl}>
          <Caption style={styles.emptyNoticeText}>
            There are no sentences in the backlog yet.
          </Caption>
        </ScrollView>
      )}
      <Button
        title="Confirm Batch"
        type="primary"
        loading={
          createBatchStatus === 'loading' ||
          createBatchFromBacklogStatus === 'loading'
        }
        disabled={
          isRefreshing ||
          isFetchingSentences ||
          !isLimitReached ||
          selectedSentencesIds.length === 0 ||
          createBatchStatus === 'loading' ||
          createBatchFromBacklogStatus === 'loading'
        }
        style={styles.addNewBatch}
        onPress={onConfirmBatchPressed}
      />
      <WordOptionsSheet
        ref={wordOptionsSheetRef}
        sentence={optionsSentence}
        onMarkAsMined={onMarkAsMined}
        onPushToTheEnd={onPushToTheEnd}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  dividerView: {
    flexDirection: 'row',
    justifyContent: 'center',
    elevation: 3,
    borderTopWidth: Platform.OS === 'ios' ? 0.2 : 0,
    borderBottomWidth: Platform.OS === 'ios' ? 0.2 : 0,
  },
  leftCaret: {
    marginRight: 32,
  },
  addNewBatch: {
    marginHorizontal: 15,
    marginVertical: 15,
  },
  guideView: {
    flexGrow: 1,
    alignSelf: 'center',
    justifyContent: 'center',
    padding: 15,
    maxHeight: 128,
  },
  guideText: {
    fontSize: 13,
    paddingHorizontal: 10,
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

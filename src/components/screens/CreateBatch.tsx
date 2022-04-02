import React, {useCallback, useContext, useMemo, useState} from 'react';
import {Platform, RefreshControl, StyleSheet, View} from 'react-native';
import {ThemeContext} from '../../contexts/theme';
import {usePendingSentences} from '../../hooks/use-pending-sentences';
import {SentenceList} from '../elements/SentenceList';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import {Button, Caption} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';

const sentneceLimit = 10;

export const CreateBatch = () => {
  const {theme} = useContext(ThemeContext);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedSentencesIds, setSelectedSentenceIds] = useState<string[]>([]);

  const {
    sentenceList,
    status: sentencesStatus,
    refetch: refetchSentences,
  } = usePendingSentences(() => {
    setIsRefreshing(false);
  });

  const onListRefresh = useCallback(() => {
    setIsRefreshing(true);
    refetchSentences();
  }, [refetchSentences]);

  const pendingSentencesList = useMemo(
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
        refreshing={isRefreshing || sentencesStatus === 'loading'}
        onRefresh={onListRefresh}
      />
    ),
    [isRefreshing, sentencesStatus, onListRefresh],
  );
  const guideSteps = useMemo(
    () => [
      'Select top 10 juiciest sentences',
      'Confirm the sentence batch',
      'Export the batch to Anki',
    ],
    [],
  );
  const isLimitReached = useMemo(
    () =>
      selectedSentencesIds.length === pendingSentencesList.length ||
      selectedSentencesIds.length >= sentneceLimit,
    [selectedSentencesIds, pendingSentencesList],
  );
  const divider = useMemo(
    () => (
      <View
        style={{
          ...styles.dividerView,
          ...{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.disabled,
          },
        }}>
        <FontAwesomeIcon
          name="caret-up"
          color={
            !isLimitReached ? theme.colors.onSurface : theme.colors.disabled
          }
          size={48}
          style={styles.leftCaret}
        />
        <FontAwesomeIcon
          name="caret-down"
          color={
            selectedSentencesIds.length > 0
              ? theme.colors.onSurface
              : theme.colors.disabled
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

  return (
    <SafeAreaView style={styles.mainContainer} edges={['bottom']}>
      <SentenceList
        sentenceList={[
          ...(selectedSentencesIds.length > 0
            ? pendingSentencesList.filter(sentence =>
                selectedSentencesIds.includes(sentence.sentenceId),
              )
            : [guide]),
          divider,
          ...pendingSentencesList.filter(
            sentence => !selectedSentencesIds.includes(sentence.sentenceId),
          ),
        ]}
        disabled={sentence => {
          if (isRefreshing || sentencesStatus === 'loading') {
            return true;
          }

          return (
            isLimitReached &&
            !selectedSentencesIds.includes(sentence.sentenceId)
          );
        }}
        onSentencePressed={sentenceId => {
          if (selectedSentencesIds.includes(sentenceId)) {
            setSelectedSentenceIds(list =>
              list.filter(id => id !== sentenceId),
            );
            return;
          }

          setSelectedSentenceIds(list => [...list, sentenceId]);
        }}
        refreshControl={refreshControl}
      />
      <Button
        mode="contained"
        style={styles.addNewBatch}
        color={theme.colors.primary}
        disabled={
          isRefreshing ||
          sentencesStatus === 'loading' ||
          !isLimitReached ||
          selectedSentencesIds.length === 0
        }
        onPress={() => {}}>
        Confirm Batch
      </Button>
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
    height: 44,
    justifyContent: 'center',
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
});
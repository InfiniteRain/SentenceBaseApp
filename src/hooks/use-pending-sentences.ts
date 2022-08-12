import {useIsFocused} from '@react-navigation/native';
import {useContext} from 'react';
import {useQuery} from '@tanstack/react-query';
import {SentenceCacheContext} from '../contexts/sentence-cache-context';
import {wordFrequency} from '../helpers';
import {getPendingSentences} from '../queries';
import {SbApiSentence} from '../types';

export const usePendingSentences = (
  onQuerySettled?: (data: SbApiSentence[] | undefined, error: unknown) => void,
) => {
  const {doSentencesQuery, setDoSentencesQuery, sentenceList, setSentenceList} =
    useContext(SentenceCacheContext);

  const isFocused = useIsFocused();

  const {isFetching, refetch} = useQuery(
    ['getSentences', isFocused],
    () => getPendingSentences(),
    {
      enabled: isFocused && doSentencesQuery,
      onSettled(...args) {
        onQuerySettled?.(...args);
        setDoSentencesQuery(false);
      },
      onSuccess: apiSentences => {
        setSentenceList(
          apiSentences.map(apiSentence => ({
            ...apiSentence,
            dictionaryFrequency: wordFrequency(
              apiSentence.dictionaryForm,
              apiSentence.reading,
            ),
          })),
        );
      },
      keepPreviousData: true,
    },
  );

  return {
    sentenceList,
    isFetching,
    refetch,
  };
};

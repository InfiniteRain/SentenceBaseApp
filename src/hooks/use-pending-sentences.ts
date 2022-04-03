import {useIsFocused} from '@react-navigation/native';
import {useContext, useEffect} from 'react';
import {useQuery} from 'react-query';
import {CacheContext} from '../contexts/cache-context';
import {wordFrequency} from '../helpers';
import {getPendingSentences} from '../queries';
import {SbApiSentence} from '../types';

export const usePendingSentences = (
  onQuerySettled?: (data: SbApiSentence[] | undefined, error: unknown) => void,
) => {
  const {doSentencesQuery, setDoSentencesQuery, sentenceList, setSentenceList} =
    useContext(CacheContext);

  const isFocused = useIsFocused();

  const {status, refetch} = useQuery(
    ['getSentences', isFocused],
    () => getPendingSentences(),
    {
      enabled: isFocused && doSentencesQuery,
      onSettled: onQuerySettled,
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

  useEffect(() => {
    if (doSentencesQuery && isFocused) {
      setDoSentencesQuery(false);
    }
  }, [doSentencesQuery, isFocused, setDoSentencesQuery]);

  return {
    sentenceList,
    status,
    refetch,
  };
};

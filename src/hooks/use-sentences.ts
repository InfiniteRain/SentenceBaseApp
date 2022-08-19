import {useIsFocused} from '@react-navigation/native';
import {useContext, useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {SentenceCacheContext} from '../contexts/sentence-cache-context';
import {wordFrequency} from '../helpers';
import {getBacklogSentences, getPendingSentences} from '../queries';
import {SbApiSentence, SbSentence} from '../types';

export const useSentences = (
  mode: 'pending' | 'backlog',
  onQuerySettled?: (data: SbApiSentence[] | undefined, error: unknown) => void,
) => {
  const {doSentencesQuery, setDoSentencesQuery, sentenceList, setSentenceList} =
    useContext(SentenceCacheContext);

  const [backlogSentences, setBacklogSentences] = useState<SbSentence[]>([]);

  const isFocused = useIsFocused();

  const {isFetching, refetch} = useQuery(
    ['getSentences', isFocused, mode],
    () => {
      if (mode === 'pending') {
        return getPendingSentences();
      }

      return getBacklogSentences();
    },
    {
      enabled: isFocused && (mode === 'pending' ? doSentencesQuery : true),
      onSettled(...args) {
        onQuerySettled?.(...args);

        if (mode === 'pending') {
          setDoSentencesQuery(false);
        }
      },
      onSuccess: apiSentences => {
        const newList = apiSentences.map(apiSentence => ({
          ...apiSentence,
          dictionaryFrequency: wordFrequency(
            apiSentence.dictionaryForm,
            apiSentence.reading,
          ),
        }));

        if (mode === 'pending') {
          setSentenceList(newList);
          return;
        }

        setBacklogSentences(newList);
      },
      onError(err) {
        console.log(err);
      },
      keepPreviousData: true,
    },
  );

  return {
    sentenceList: mode === 'pending' ? sentenceList : backlogSentences,
    isFetching,
    refetch,
  };
};

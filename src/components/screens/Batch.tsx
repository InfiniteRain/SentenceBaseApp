import React, {useEffect, useState} from 'react';
import {Text, View} from 'react-native';
import {usePendingSentences} from '../../hooks/use-pending-sentences';

export const Batch = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    sentenceList,
    status: sentencesStatus,
    refetch: refetchSentences,
  } = usePendingSentences(() => {
    setIsRefreshing(false);
  });

  console.log('status', sentenceList?.[0]);

  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text>Batch</Text>
    </View>
  );
};

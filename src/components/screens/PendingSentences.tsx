import {useIsFocused} from '@react-navigation/native';
import React, {useContext, useEffect, useState} from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Divider} from 'react-native-paper';
import {useQuery} from 'react-query';
import {CacheContext} from '../../contexts/cache-context';
import {ThemeContext} from '../../contexts/theme';
import {getPendingSentences} from '../../queries';
import {SbApiSentenence} from '../../types';

export const PendingSentences = () => {
  const {theme} = useContext(ThemeContext);
  const {doPendingSentencesQuery, setDoPendingSentencesQuery} =
    useContext(CacheContext);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const isFocused = useIsFocused();

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
    if (doPendingSentencesQuery && isFocused) {
      setDoPendingSentencesQuery(false);
    }
  }, [doPendingSentencesQuery, isFocused, setDoPendingSentencesQuery]);

  return (
    <FlatList
      ItemSeparatorComponent={() => <Divider />}
      renderItem={({item}: {item: SbApiSentenence}) => (
        <View>
          <TouchableOpacity
            style={style.sentenceItemContainer}
            onPress={() => {}}>
            <Text
              style={{
                ...style.sentenceItemWordText,
                ...{color: theme.colors.primary},
              }}>
              {item.dictionaryForm}（{item.reading}）
              <Text
                style={{
                  ...style.sentenceItemText,
                  ...{color: theme.colors.onSurface},
                }}>
                {item.sentence}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      )}
      data={sentencesData}
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
  );
};

const style = StyleSheet.create({
  sentenceItemContainer: {
    padding: 5,
    flexDirection: 'row',
  },
  sentenceItemWordText: {
    fontSize: 24,
  },
  sentenceItemText: {
    fontSize: 24,
  },
});

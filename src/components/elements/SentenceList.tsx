import React, {useContext} from 'react';
import {
  FlatList,
  RefreshControlProps,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Divider} from 'react-native-paper';
import {ThemeContext} from '../../contexts/theme';
import {SbApiSentenence} from '../../types';

export const SentenceList = (props: {
  sentenceList: SbApiSentenence[];
  disabled: boolean;
  onSentencePressed?: (
    sentenceId: string,
    sentence: string,
    tags: string[],
  ) => void;
  refreshControl?: React.ReactElement<
    RefreshControlProps,
    string | React.JSXElementConstructor<any>
  >;
}) => {
  const {theme} = useContext(ThemeContext);

  return (
    <FlatList
      ItemSeparatorComponent={() => <Divider />}
      renderItem={({item}: {item: SbApiSentenence}) => (
        <View>
          <TouchableOpacity
            style={styles.sentenceItemContainer}
            onPress={() =>
              props.onSentencePressed?.(
                item.sentenceId,
                item.sentence,
                item.tags,
              )
            }
            disabled={props.disabled}>
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
      data={props.sentenceList ?? []}
      refreshControl={props.refreshControl}
    />
  );
};

const styles = StyleSheet.create({
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
});

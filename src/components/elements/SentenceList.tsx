import React, {ReactNode, useContext} from 'react';
import {
  FlatList,
  RefreshControlProps,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {LayoutContext} from '../../contexts/layout-context';
import {SbSentence} from '../../types';
import {Divider} from './Divider';
import {Text} from './Text';
import color from 'color';

export type SentenceListProps = {
  sentenceList: (SbSentence | ReactNode)[];
  disabled: boolean | ((sentence: SbSentence) => boolean);
  onSentencePressed?: (sentence: SbSentence) => void;
  onSentenceLongPressed?: (sentence: SbSentence) => void;
  refreshControl?: React.ReactElement<
    RefreshControlProps,
    string | React.JSXElementConstructor<any>
  >;
  wordsToMarkAsMined?: string[];
  wordsToPushToTheEnd?: string[];
};

function isSbSentence(value: unknown): value is SbSentence {
  return (
    typeof value === 'object' &&
    typeof (value as SbSentence).sentenceId === 'string'
  );
}

export const SentenceList = (props: SentenceListProps) => {
  const {theme} = useContext(LayoutContext);

  return (
    <FlatList
      ItemSeparatorComponent={() => <Divider />}
      renderItem={({item}: {item: SbSentence | ReactNode}) => {
        if (!isSbSentence(item)) {
          return <>{item}</>;
        }

        const isDisabled =
          typeof props.disabled === 'boolean'
            ? props.disabled
            : props.disabled(item);

        const backgroundColor = props.wordsToMarkAsMined?.includes(item.wordId)
          ? color(theme.colors.dangerText).alpha(0.2).rgb().string()
          : props.wordsToPushToTheEnd?.includes(item.wordId)
          ? color(theme.colors.primary).alpha(0.2).rgb().string()
          : 'rgba(0, 0, 0, 0)';

        return (
          <View>
            <TouchableOpacity
              style={[
                styles.sentenceItemContainer,
                {
                  backgroundColor,
                },
              ]}
              onPress={() => props.onSentencePressed?.(item)}
              onLongPress={() => props.onSentenceLongPressed?.(item)}
              disabled={isDisabled}>
              <Text
                style={[
                  styles.sentenceItemWordText,
                  {
                    color: isDisabled
                      ? theme.colors.disabledText
                      : theme.colors.primary,
                  },
                ]}>
                {item.dictionaryForm}（{item.reading}）
              </Text>
              <Text
                style={[
                  styles.sentenceItemText,
                  {
                    color: isDisabled
                      ? theme.colors.disabledText
                      : theme.colors.surfaceText,
                  },
                ]}>
                {item.sentence}
              </Text>
              <View style={styles.tagsContainer}>
                {item.tags.map((tag, index) => (
                  <Text
                    key={index}
                    style={[
                      styles.tagsText,
                      {color: theme.colors.disabledText},
                    ]}>
                    {tag}
                  </Text>
                ))}
              </View>
            </TouchableOpacity>
          </View>
        );
      }}
      data={props.sentenceList ?? []}
      refreshControl={props.refreshControl}
    />
  );
};

const styles = StyleSheet.create({
  sentenceItemContainer: {
    padding: 10,
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

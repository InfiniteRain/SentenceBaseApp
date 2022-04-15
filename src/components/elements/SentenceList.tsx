import React, {ReactNode, useContext} from 'react';
import {
  FlatList,
  RefreshControlProps,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Divider} from 'react-native-paper';
import {LayoutContext} from '../../contexts/layout-context';
import {SbSentence} from '../../types';

function isSbSentence(value: unknown): value is SbSentence {
  return (
    typeof value === 'object' &&
    typeof (value as SbSentence).sentenceId === 'string'
  );
}

export const SentenceList = (props: {
  sentenceList: (SbSentence | ReactNode)[];
  disabled: boolean | ((sentence: SbSentence) => boolean);
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

        return (
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

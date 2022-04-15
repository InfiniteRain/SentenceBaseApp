import {BottomSheetModal, TouchableOpacity} from '@gorhom/bottom-sheet';
import React, {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {Divider, Text} from 'react-native-paper';
import {LayoutContext} from '../../../contexts/layout-context';
import {useAsyncStorage} from '../../../hooks/use-async-storage';
import {BottomSheetLabeledTextInput} from '../../elements/BottomSheetLabeledTextInput';
import {Button} from '../../elements/Button';
import {IconButton} from '../../elements/IconButton';
import {PropertySheet} from '../../elements/PropertySheet';

type TagsSheetProps = {
  onAdd: (tagsToAdd: string[]) => void;
  onChange?: (index: number) => void;
};

export const TagsSheet = forwardRef<BottomSheetModal, TagsSheetProps>(
  (props, ref) => {
    const castedRef = ref as React.RefObject<BottomSheetModal>;

    const {theme} = useContext(LayoutContext);

    const [tag, setTag] = useState('');
    const [filteredTagHistory, setFilteredTagHistory] = useState<string[]>([]);

    const [tagHistory, updateTagHistory] = useAsyncStorage<string[]>(
      'tagHistory',
      [],
    );

    useEffect(() => {
      setFilteredTagHistory(() =>
        tagHistory.filter(entry => entry.includes(tag)),
      );
    }, [tagHistory, tag]);

    const selectTag = useCallback(
      (selectedTag: string) => {
        const tagsToAdd = selectedTag.trim().split(/\s+/);

        props.onAdd(tagsToAdd);

        updateTagHistory(currentHistory =>
          [
            ...tagsToAdd,
            ...currentHistory.filter(entry => !tagsToAdd.includes(entry)),
          ].filter((_, index) => index < 50),
        );

        setTag('');
        castedRef.current?.close();
      },
      [props, castedRef, updateTagHistory],
    );
    const removeTagFromHistory = useCallback(
      (selectedTag: string) => {
        updateTagHistory(currentHistory =>
          currentHistory.filter(entry => entry !== selectedTag),
        );
      },
      [updateTagHistory],
    );
    const resetState = useCallback(() => {
      setTag('');
    }, []);

    return (
      <PropertySheet ref={ref} onDismiss={resetState} onChange={props.onChange}>
        <View style={styles.tagInputView}>
          <BottomSheetLabeledTextInput
            label="Tag"
            containerStyle={styles.tagInput}
            onChangeText={text => setTag(text.trim())}
            placeholderTextColor={theme.colors.placeholder}
          />
          <Button
            title="Add Tag"
            type="primary"
            disabled={tag.length === 0}
            style={styles.addTagButton}
            onPress={() => selectTag(tag)}
          />
        </View>
        <View style={styles.tagHistoryView}>
          {filteredTagHistory.length > 0 ? (
            <FlatList
              ItemSeparatorComponent={Divider}
              renderItem={({item}: {item: string}) => (
                <View style={styles.historyItemContainer}>
                  <TouchableOpacity
                    style={styles.historyItemTextContainer}
                    onPress={() => selectTag(item)}>
                    <Text
                      style={[
                        styles.historyItemText,
                        {color: theme.colors.primary},
                      ]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                  <IconButton
                    icon="close"
                    size={24}
                    color={theme.colors.notification}
                    onPress={() => removeTagFromHistory(item)}
                    style={styles.historyItemIcon}
                  />
                </View>
              )}
              data={filteredTagHistory}
            />
          ) : (
            <Text
              style={[styles.emptyHistoryText, {color: theme.colors.disabled}]}>
              {tagHistory.length > 0
                ? `Tag containing "${tag}" wasn't found in the history.`
                : 'Tag history is empty.'}
            </Text>
          )}
        </View>
      </PropertySheet>
    );
  },
);

const styles = StyleSheet.create({
  tagInputView: {
    flex: 0,
    flexDirection: 'row',
    alignContent: 'center',
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  tagInput: {
    flex: 1,
    marginRight: 10,
  },
  addTagButton: {
    height: 54,
  },
  tagHistoryView: {
    flex: 1,
    justifyContent: 'center',
  },
  historyItemContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  historyItemTextContainer: {
    flexGrow: 1,
    alignItems: 'center',
  },
  historyItemText: {
    fontSize: 24,
    paddingVertical: 5,
  },
  historyItemIcon: {
    marginRight: 15,
  },
  emptyHistoryText: {alignSelf: 'center'},
});

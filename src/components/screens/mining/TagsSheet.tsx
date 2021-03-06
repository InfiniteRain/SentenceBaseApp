import {BottomSheetModal} from '@gorhom/bottom-sheet';
import React, {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {FlatList, StyleSheet, TouchableOpacity, View} from 'react-native';
import {LayoutContext} from '../../../contexts/layout-context';
import {useAsyncStorage} from '../../../hooks/use-async-storage';
import {BottomSheetLabeledTextInput} from '../../elements/BottomSheetLabeledTextInput';
import {Button} from '../../elements/Button';
import {Caption} from '../../elements/Caption';
import {Divider} from '../../elements/Divider';
import {IconButton} from '../../elements/IconButton';
import {PropertySheet} from '../../elements/PropertySheet';
import {Text} from '../../elements/Text';

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

    const onAddTagPressed = useCallback(() => {
      const tagsToAdd = tag.trim().split(/\s+/);

      props.onAdd(tagsToAdd);

      updateTagHistory(currentHistory =>
        [
          ...tagsToAdd,
          ...currentHistory.filter(entry => !tagsToAdd.includes(entry)),
        ].filter((_, index) => index < 50),
      );

      setTag('');
      castedRef.current?.close();
    }, [props, castedRef, updateTagHistory, tag]);
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
            placeholderTextColor={theme.colors.placeholderText}
            defaultValue={tag}
          />
          <Button
            title="Add Tag"
            type="primary"
            disabled={tag.length === 0}
            style={styles.addTagButton}
            onPress={onAddTagPressed}
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
                    onPress={() => setTag(item)}>
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
            <Caption style={styles.emptyHistoryText}>
              {tagHistory.length > 0
                ? `Tag containing "${tag}" wasn't found in the history.`
                : 'Tag history is empty.'}
            </Caption>
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
    marginLeft: 25,
    marginRight: 50,
  },
  historyItemText: {
    fontSize: 24,
    paddingVertical: 5,
  },
  historyItemIcon: {
    position: 'absolute',
    right: 10,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyHistoryText: {alignSelf: 'center'},
});

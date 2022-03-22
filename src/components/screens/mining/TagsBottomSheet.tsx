import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetTextInput,
  TouchableOpacity,
} from '@gorhom/bottom-sheet';
import React, {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {BackHandler, FlatList, StyleSheet, View} from 'react-native';
import {Button, Divider, Text} from 'react-native-paper';
import {ThemeContext} from '../../../contexts/theme';
import {useAsyncStorage} from '../../../hooks/use-async-storage';
import {IconButton} from '../../elements/IconButton';

type TagsBottomSheetProps = {
  updateTags: (mutator: (currentValue: string[]) => string[]) => void;
};

export const TagsBottomSheet = forwardRef<
  BottomSheetModal,
  TagsBottomSheetProps
>(({updateTags}, ref) => {
  const castedRef = ref as React.RefObject<BottomSheetModal>;

  const {theme} = useContext(ThemeContext);

  const tagInputRef = useRef<any>(null);

  const [tag, setTag] = useState('');
  const [filteredTagHistory, setFilteredTagHistory] = useState<string[]>([]);
  const [bottomSheetIndex, setBottomSheetIndex] = useState(-1);

  const [tagHistory, updateTagHistory] = useAsyncStorage<string[]>(
    'tagHistory',
    [],
  );

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (bottomSheetIndex === -1) {
          return false;
        }

        castedRef.current?.close();
        return true;
      },
    );

    return () => backHandler.remove();
  }, [bottomSheetIndex, castedRef]);

  useEffect(() => {
    setFilteredTagHistory(() =>
      tagHistory.filter(entry => entry.includes(tag)),
    );
  }, [tagHistory, tag]);

  const snapPoints = useMemo(() => ['25%', '50%'], []);

  const selectTag = useCallback(
    (selectedTag: string) => {
      // Spaces are treated as tag separators.
      const tagsToAdd = selectedTag.trim().split(/\s+/);

      // Updating current tags.
      updateTags(currentTags => [
        // Remove the tags that are about to be added from the current tags list,
        // and spread the resulting array.
        ...currentTags.filter(entry => !tagsToAdd.includes(entry)),
        // Spread the array of new tags to add.
        ...tagsToAdd,
      ]);

      // Updating the tag history.
      updateTagHistory(currentHistory =>
        [
          // Spread the array of new tags to add.
          ...tagsToAdd,
          // Remove the tags that are about to be added from the current history,
          // and spread the resulting array.
          ...currentHistory.filter(entry => !tagsToAdd.includes(entry)),
        ]
          // Enforce the history limit.
          .filter((_, index) => index < 50),
      );

      // Emptying the tag text field.
      setTag('');

      // Closing the modal bottom sheet.
      castedRef.current?.close();
    },
    [updateTags, castedRef, updateTagHistory],
  );

  const removeTagFromHistory = useCallback(
    (selectedTag: string) => {
      updateTagHistory(currentHistory =>
        currentHistory.filter(entry => entry !== selectedTag),
      );
    },
    [updateTagHistory],
  );

  const resetInput = useCallback(() => {
    setTag('');
  }, []);

  return (
    <BottomSheetModal
      ref={ref}
      index={1}
      snapPoints={snapPoints}
      keyboardBehavior="extend"
      style={styles.bottomSheetModal}
      backgroundStyle={{
        backgroundColor: theme.colors.surface,
      }}
      handleComponent={() => (
        <View style={styles.closeLineContainer}>
          <View
            style={{
              ...styles.closeLine,
              ...{backgroundColor: theme.colors.onSurface},
            }}
          />
        </View>
      )}
      backdropComponent={backdropProps => (
        <BottomSheetBackdrop
          {...backdropProps}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
        />
      )}
      onChange={setBottomSheetIndex}
      onDismiss={resetInput}>
      <View style={styles.tagInputView}>
        <BottomSheetTextInput
          style={styles.tagInput}
          onChangeText={text => setTag(text.trim())}
          autoCapitalize="none"
          ref={tagInputRef}
          placeholder="Tag Name"
        />
        <Button
          mode="contained"
          onPress={() => selectTag(tag)}
          disabled={tag.length === 0}
          style={styles.addTagButton}>
          Add Tag
        </Button>
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
                    style={{
                      ...styles.historyItemText,
                      ...{
                        color: theme.colors.primary,
                      },
                    }}>
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
            style={{
              ...styles.emptyHistoryText,
              ...{
                color: theme.colors.disabled,
              },
            }}>
            {tagHistory.length > 0
              ? `Tag containing "${tag}" wasn't found in the history.`
              : 'Tag history is empty.'}
          </Text>
        )}
      </View>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  bottomSheetModal: {
    shadowOpacity: 0.05,
  },
  tagInputView: {
    flex: 0,
    flexDirection: 'row',
    alignContent: 'center',
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  tagInput: {
    borderRadius: 10,
    fontSize: 16,
    lineHeight: 20,
    padding: 8,
    backgroundColor: 'rgba(151, 151, 151, 0.25)',
    flex: 1,
    marginRight: 10,
  },
  addTagButton: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
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
  closeLineContainer: {
    alignSelf: 'center',
  },
  closeLine: {
    width: 30,
    height: 5,
    borderRadius: 3,
    marginTop: 9,
    marginBottom: 10,
  },
});

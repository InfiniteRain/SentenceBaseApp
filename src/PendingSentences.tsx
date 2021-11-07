import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useColorScheme,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import {Page, AppStateContext} from './AppStateContext';
import {colors} from './Colors';
import {SentenceEntry} from './Common';
import {sendEnsuredRequest, StandardResponse} from './Networking';

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  backButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
    paddingBottom: 20,
    marginTop: 50,
  },
  backButton: {
    color: colors.primary,
  },
  sentenceEntryView: {borderColor: 'white', borderBottomWidth: 1, padding: 5},
  sentenceEntryText: {
    fontSize: 20,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalWarningLabel: {fontSize: 20, color: 'red', marginBottom: 10},
  buttonsContainer: {flexDirection: 'row', justifyContent: 'space-around'},
  button: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    margin: 5,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  buttonWarning: {
    backgroundColor: 'red',
  },
});

export const PendingSentences = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const {setCurrentPage, batch, setBatch} = useContext(AppStateContext);

  const [isLoading, setLoading] = useState(false);
  const [sentences, setSentences] = useState<SentenceEntry[]>([]);
  const [sentenceToDelete, setSentenceToDelete] =
    useState<SentenceEntry | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const sentenceToDeleteRef = useRef<SentenceEntry | null>();
  const batchRef = useRef<SentenceEntry[]>([]);

  sentenceToDeleteRef.current = sentenceToDelete;
  batchRef.current = batch;

  const refreshList = async () => {
    setLoading(true);
    try {
      const response = await sendEnsuredRequest<
        void,
        {
          sentences: SentenceEntry[];
        }
      >('/sentences');

      setLoading(false);

      if (response.status === 'success') {
        setSentences(
          response.data.sentences.sort((a, b) =>
            a.sentence_id < b.sentence_id ? 1 : -1,
          ),
        );
      }
    } catch {
      setLoading(false);

      Toast.show({
        type: 'error',
        text1: 'Network error.',
        position: 'bottom',
      });
    }
  };

  const onBack = () => {
    setCurrentPage(Page.UserMenu);
  };

  const onDelete = (sentenceEntry: SentenceEntry) => {
    setSentenceToDelete(sentenceEntry);
    setDeleteModalVisible(true);
  };

  const onDeleteConfirm = async () => {
    const sentenceToDeleteData = sentenceToDeleteRef.current;

    if (!sentenceToDeleteData) {
      return;
    }

    setLoading(true);
    setDeleteModalVisible(false);

    let response: StandardResponse;

    try {
      response = await sendEnsuredRequest(
        `/sentences/${sentenceToDeleteData.sentence_id}`,
        'delete',
      );
      setLoading(false);
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Network error.',
        position: 'bottom',
      });
      setLoading(false);
      return;
    }

    if (response.status === 'fail' || response.status === 'error') {
      Toast.show({
        type: 'error',
        text1: 'Something went wrong.',
        position: 'bottom',
      });
      return;
    }

    setBatch(
      batchRef.current.filter(
        sentence => sentence.sentence_id !== sentenceToDeleteData.sentence_id,
      ),
    );
    await refreshList();
  };

  useEffect(() => {
    refreshList();
  }, []);

  return (
    <View style={styles.mainContainer}>
      <View style={styles.backButtonContainer}>
        <TouchableOpacity onPress={onBack} disabled={isLoading}>
          <Text style={styles.backButton}>Back to Menu</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={sentences}
        renderItem={entry => (
          <TouchableOpacity
            style={[
              styles.sentenceEntryView,
              {
                borderTopWidth: entry.index === 0 ? 1 : 0,
                borderColor: isDarkMode ? colors.white : colors.black,
              },
            ]}
            onPress={() => onDelete(entry.item)}
            disabled={isLoading}>
            <Text
              style={[
                styles.sentenceEntryText,
                {color: isDarkMode ? colors.white : colors.black},
              ]}>
              <Text style={{color: colors.primary}}>
                {entry.item.dictionary_form}（{entry.item.reading}）
              </Text>
              {entry.item.sentence}
            </Text>
          </TouchableOpacity>
        )}
      />
      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteModalVisible}>
        <TouchableWithoutFeedback onPress={() => setDeleteModalVisible(false)}>
          <View style={styles.centeredView}>
            <View
              style={[
                styles.modalView,
                {
                  backgroundColor: isDarkMode ? colors.black : colors.white,
                },
              ]}>
              <Text style={styles.modalWarningLabel}>
                Delete the following sentence?
              </Text>
              <Text
                style={[
                  styles.sentenceEntryText,
                  {color: isDarkMode ? colors.white : colors.black},
                ]}>
                <Text style={{color: colors.primary}}>
                  {sentenceToDelete?.dictionary_form}（
                  {sentenceToDelete?.reading}）
                </Text>
                {sentenceToDelete?.sentence}
              </Text>
              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.buttonWarning]}
                  onPress={onDeleteConfirm}>
                  <Text style={{color: colors.white}}>Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => setDeleteModalVisible(false)}>
                  <Text style={{color: colors.white}}>No</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

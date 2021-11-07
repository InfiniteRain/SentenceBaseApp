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

const MINING_AMOUNT = 10;

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
  sentenceEntryView: {borderColor: 'white', borderBottomWidth: 1},
  sentenceEntryText: {
    fontSize: 20,
  },
  confirmButton: {
    margin: 15,
  },
  confirmButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  confirmButtonOuterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
    paddingBottom: 20,
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

export const NewBatch = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const {setCurrentPage, setBatch, batch} = useContext(AppStateContext);

  const [isLoading, setLoading] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  const selectedBatch = useRef<SentenceEntry[]>();

  selectedBatch.current = batch.slice(0, MINING_AMOUNT);

  const refreshList = async () => {
    if (batch.length > 0) {
      return;
    }

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
        setBatch(response.data.sentences);
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

  const onPushOut = (index: number) => {
    let entry = batch[index];

    if (!entry) {
      return;
    }

    let newBatch = [...batch];
    newBatch.splice(index, 1);
    newBatch.push(entry);
    setBatch(newBatch);
  };

  const onConfirmBatch = () => {
    setConfirmModalVisible(true);
  };

  const onDoublyConfirm = async () => {
    const selectedBatchData = selectedBatch.current;

    if (!selectedBatchData) {
      return;
    }

    setLoading(true);
    setConfirmModalVisible(false);

    let response: StandardResponse<{batch_id: number}>;

    try {
      response = await sendEnsuredRequest<
        {
          sentences: number[];
        },
        {
          batch_id: number;
        }
      >('/sentences/batches', 'post', {
        sentences: selectedBatchData.map(entry => entry.sentence_id),
      });
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

    setBatch([]);
    await refreshList();
  };

  useEffect(() => {
    refreshList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.mainContainer}>
      <View style={styles.backButtonContainer}>
        <TouchableOpacity onPress={onBack} disabled={isLoading}>
          <Text style={styles.backButton}>Back to Menu</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.confirmButtonOuterContainer}>
        <TouchableOpacity
          style={[styles.confirmButtonContainer]}
          onPress={onConfirmBatch}
          disabled={isLoading}>
          <Text
            style={[
              styles.confirmButton,
              {
                color: colors.white,
              },
            ]}>
            Confirm Batch
          </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={selectedBatch.current}
        renderItem={entry => (
          <TouchableOpacity
            style={[
              styles.sentenceEntryView,
              {
                borderTopWidth: entry.index === 0 ? 1 : 0,
                borderColor: isDarkMode ? colors.white : colors.black,
              },
            ]}
            onPress={() => onPushOut(entry.index)}
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
        visible={confirmModalVisible}>
        <TouchableWithoutFeedback onPress={() => setConfirmModalVisible(false)}>
          <View style={styles.centeredView}>
            <View
              style={[
                styles.modalView,
                {
                  backgroundColor: isDarkMode ? colors.black : colors.white,
                },
              ]}>
              <Text style={styles.modalWarningLabel}>
                Confirm current batch?
              </Text>
              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.buttonWarning]}
                  onPress={onDoublyConfirm}
                  disabled={isLoading}>
                  <Text style={{color: colors.white}}>Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => setConfirmModalVisible(false)}
                  disabled={isLoading}>
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

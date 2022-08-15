import React from 'react';
import {StyleSheet, Text} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

export const MinedBatches = () => {
  return (
    <SafeAreaView style={styles.mainContainer} edges={['bottom']}>
      <Text>Mined Batches</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
});

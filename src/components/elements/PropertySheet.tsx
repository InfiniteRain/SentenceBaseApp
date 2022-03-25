import {BottomSheetBackdrop, BottomSheetModal} from '@gorhom/bottom-sheet';
import React, {
  forwardRef,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {BackHandler, StyleSheet, View} from 'react-native';
import {ThemeContext} from '../../contexts/theme';

type PropertySheetModalProps = {
  snapPoints?: string[];
  index?: number;
  onDismiss?: () => void;
  onChange?: (index: number) => void;
  children?: ReactNode;
};

export const PropertySheet = forwardRef<
  BottomSheetModal,
  PropertySheetModalProps
>((props, ref) => {
  const castedRef = ref as React.RefObject<BottomSheetModal>;

  const {theme} = useContext(ThemeContext);
  const [bottomSheetIndex, setBottomSheetIndex] = useState(-1);

  const snapPoints = useMemo(() => props.snapPoints ?? ['50%'], [props]);

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

  const onChange = useCallback(
    (index: number) => {
      if (props.onChange) {
        props.onChange(index);
      }
      setBottomSheetIndex(index);
    },
    [props],
  );

  return (
    <BottomSheetModal
      ref={ref}
      index={props.index}
      snapPoints={snapPoints}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
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
      onChange={onChange}
      onDismiss={props.onDismiss}>
      {props.children}
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  bottomSheetModal: {
    shadowOpacity: 0.05,
  },
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

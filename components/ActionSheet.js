import React, { useEffect, useRef } from 'react'
import {
  Modal,
  Text,
  Pressable,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native'

const { height } = Dimensions.get('window')

export default function ActionSheet({
  visible,
  onClose,
  title,
  children
}) {
  const translateY = useRef(new Animated.Value(height)).current

  useEffect(() => {
    if (visible) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start()
    } else {
      Animated.timing(translateY, {
        toValue: height,
        duration: 200,
        useNativeDriver: true,
      }).start()
    }
  }, [visible])

  return (
    <Modal transparent visible={visible} animationType="none">
      <Pressable style={styles.backdrop} onPress={onClose} />

      <Animated.View
        style={[
          styles.container,
          { transform: [{ translateY }] },
        ]}
      >
        {title && <Text style={styles.title}>{title}</Text>}

        {children}

      </Animated.View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  container: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 10,
    maxHeight: height / 2
  },
  title: {
    padding: 16,
    textAlign: 'center',
    fontFamily: 'Sarabun-Medium',
    fontSize: 16,
    color: '#555',
  },
})

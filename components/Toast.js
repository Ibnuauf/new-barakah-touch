import React, { useEffect, useRef } from 'react'
import { Animated, Text, StyleSheet } from 'react-native'

let showToastRef = null

export const ToastProvider = ({ children }) => {
    const opacity = useRef(new Animated.Value(0)).current
    const translateY = useRef(new Animated.Value(-50)).current
    const messageRef = useRef('')

    useEffect(() => {
        showToastRef = (msg, duration = 2000) => {
            messageRef.current = msg

            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start()

            setTimeout(() => {
                Animated.parallel([
                    Animated.timing(opacity, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(translateY, {
                        toValue: -50,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                ]).start()
            }, duration)
        }
    }, [])

    return (
        <>
            {children}
            <Animated.View
                pointerEvents="none"
                style={[
                    styles.toast,
                    { opacity, transform: [{ translateY }] },
                ]}
            >
                {/* <Text style={styles.text}>{messageRef.current}</Text> */}
                <Text style={styles.text}>บันทึกรูปภาพสำเร็จ</Text>
            </Animated.View>
        </>
    )
}

export const Toast = {
    show: (message, duration) => {
        showToastRef && showToastRef(message, duration)
    },
}

const styles = StyleSheet.create({
    toast: {
        position: 'absolute',
        top: 50,
        alignSelf: 'center',
        backgroundColor: '#52c41a',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
    },
    text: {
        color: '#fff',
    },
})

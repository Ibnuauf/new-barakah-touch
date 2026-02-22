import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function OTPInput({ value, length }) {
    const digits = []

    for (let i = 0; i < length; i++) {
        digits.push(value[i] || '')
    }

    return (
        <View style={styles.container}>
            {digits.map((digit, index) => {
                const isActive = index === value.length

                return (
                    <View
                        key={index}
                        style={[
                            styles.box,
                            isActive && styles.activeBox,
                        ]}
                    >
                        <Text style={styles.text}>{digit}</Text>
                    </View>
                )
            })}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 30,
    },
    box: {
        width: 48,
        height: 56,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ccc',
        marginHorizontal: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeBox: {
        borderColor: '#FF7A00',
    },
    text: {
        fontSize: 22,
        fontFamily: 'Kanit-Medium',
    },
})

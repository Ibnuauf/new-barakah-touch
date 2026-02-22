import React from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'

const KEYS = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['', '0', 'back'],
]

export default function NumberKeyboard({ onKeyPress }) {
    return (
        <View style={styles.keyboard}>
            {KEYS.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.row}>
                    {row.map((key, index) => {
                        if (key === '') {
                            return <View key={index} style={[styles.key, {backgroundColor: 'rgba(255,255,255,0.0)'}]} />
                        }

                        return (
                            <Pressable
                                key={index}
                                style={styles.key}
                                onPress={() => onKeyPress(key)}
                            >
                                <Text style={styles.keyText}>
                                    {key === 'back' ? '⌫' : key}
                                </Text>
                            </Pressable>
                        )
                    })}
                </View>
            ))}
        </View>
    )
}

const styles = StyleSheet.create({
    keyboard: {
        paddingBottom: 30,
        // backgroundColor: 'red'
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginVertical: 8,
        // backgroundColor: 'red',
        paddingHorizontal: 10
    },
    key: {
        width: 80,
        height: 60,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    keyText: {
        fontSize: 24,
        fontFamily: 'Kanit-Medium',
    },
})

import React from 'react'
import { Text, TouchableOpacity } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'

export default function Button({ title, onPress }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={styles.loginBtn}
        >
            <Text style={styles.loginText}>{title}</Text>
        </TouchableOpacity>
    )
}

const styles = ScaledSheet.create({
    loginBtn: {
        width: '40%',
        backgroundColor: '#0047AB',
        borderRadius: 25,
        height: '42@vs',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        marginBottom: 10
    },
    loginText: {
        fontFamily: 'Sarabun-Regular',
        color: 'white',
        fontSize: '15@s',
        paddingVertical: 3
    }
})

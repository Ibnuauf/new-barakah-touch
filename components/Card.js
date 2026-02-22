import React from 'react'
import { View } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'

export default function Card(props) {
    return (
        <View style={styles.card}>
            <View style={styles.cardContent}>
                {props.children}
            </View>
        </View>
    )
}

const styles = ScaledSheet.create({
    card: {
        width: '120@s',
        height: '110@vs',
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,1)',
        marginHorizontal: '12@s',
        marginVertical: '12@s',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,

        elevation: 3,
    },
    cardContent: {
        marginVertical: '5@s',
    }
})
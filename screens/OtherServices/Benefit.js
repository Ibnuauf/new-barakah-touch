import React from 'react'
import { View, Text } from 'react-native'
import AppHeader from '../../components/AppHeader'
import { ScaledSheet } from 'react-native-size-matters'

export default function Benefit() {
    return (
        <View style={{ flex: 1 }}>
            <AppHeader />
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>อยู่ระหว่างการพัฒนา</Text>
            </View>
        </View>
    )
}

const styles = ScaledSheet.create({
    emptyText: {
        fontFamily: 'Sarabun-Light',
        fontSize: '14@s',
        width: '100%',
        textAlign: 'center'
    },
    emptyContainer: {
        height: '92%',
        justifyContent: 'center',
        alignItems: 'center'
    }
})
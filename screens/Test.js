import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import AppHeader2 from '../components/AppHeader2'

const Test = () => {
    return (
        <View>
            <AppHeader2 />
            <View style={styles.container}>
                <Text style={styles.text}>อยู่ระหว่างการพัฒนา</Text>
            </View>
        </View>
    )
}

export default Test

const styles = StyleSheet.create({
    container: {
        height: '80%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    text: {
        fontFamily: 'Sarabun-Regular',
        fontSize: 16
    }
})

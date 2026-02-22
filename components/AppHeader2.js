import React from 'react'
import { Text, View, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import { useNavigation } from '@react-navigation/native'
import { COOP_NAME, PRIMARY_COLOR } from '../environment'

const AppHeader2 = ({ onPress }) => {

    const navigation = useNavigation()

    const handleBackNavigator = () => {
        navigation.goBack()
    }

    return (
        <View style={styles.header}>
            <StatusBar barStyle='light-content' />
            <SafeAreaView style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity style={{ paddingRight: 16 }} onPress={onPress ? onPress : handleBackNavigator}>
                    <FontAwesome5 name='chevron-left' size={18} color='#fff' />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerText} numberOfLines={1}>{COOP_NAME}</Text>
                </View>
            </SafeAreaView>
        </View>
    )
}

export default AppHeader2

const styles = ScaledSheet.create({
    header: {
        padding: 16,
        backgroundColor: PRIMARY_COLOR
    },
    headerText: {
        fontSize: '16@s',
        color: '#fff',
        fontFamily: 'Sarabun-Medium',
        paddingVertical: 3,
        lineHeight: 36,
    }
})

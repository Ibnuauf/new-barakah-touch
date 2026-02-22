import React, { useEffect } from 'react'
import { Text, View, TouchableOpacity, BackHandler, Platform } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'
import Ionicons from 'react-native-vector-icons/Ionicons'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import { addScreenshotListener } from 'react-native-detector'

const DeleteAccountSuccess = ({ navigation }) => {
    const onClose = () => {
        navigation.reset({
            index: 0,
            routes: [{
                name: 'Login'
            }]
        })
    }

    useEffect(() => {
        const userDidScreenshot = () => {
            navigation.reset({
                index: 0,
                routes: [{ name: 'ScreenshotWarning' }]
            })
        }

        const unsubscribe = addScreenshotListener(userDidScreenshot)

        return () => {
            Platform.OS === 'ios' && unsubscribe()
        }
    }, [])

    useEffect(() => {
        const backAction = () => {
            return true
        }

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        )

        return () => backHandler.remove()
    })

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
                <MaterialIcons name='close' size={30} color='#5c0011' />
            </TouchableOpacity>
            <View style={styles.iconBox}>
                <Ionicons name='trash' size={50} color='#fff' />
            </View>
            <Text style={styles.title}>ลบบัญชีผู้ใช้สำเร็จ</Text>
        </View>
    )
}

export default DeleteAccountSuccess

const styles = ScaledSheet.create({
    container: {
        backgroundColor: '#fff1f0',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconBox: {
        backgroundColor: '#ff4d4f',
        width: 100,
        height: 100,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '24@s'
    },
    title: {
        fontFamily: 'Sarabun-Regular',
        fontSize: '18@s',
        color: '#5c0011',
        padding: '3@s'
    },
    closeIcon: {
        position: 'absolute',
        top: 40,
        right: 25,
        backgroundColor: 'rgba(0,0,0,0.1)',
        width: 50,
        height: 50,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center'
    }
})

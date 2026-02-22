import React from 'react'
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, BackHandler } from 'react-native'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { APP_NAME, PRIMARY_COLOR } from '../environment'

const ScreenshotWarning = () => {
    const exitApp = () => {
        BackHandler.exitApp()
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerText} numberOfLines={1}>การตั้งค่า</Text>
                </View>
            </View>

            <View style={styles.content}>
                <AntDesign name='warning' size={50} color='#faad14' />

                <Text style={[styles.text, styles.heading]}> ไม่สามารถดำเนินการต่อได้</Text>
                <Text style={styles.text}> ไม่สามารถทำการบันทึกภาพหน้าจอหรือทำการบันทึกวิดีโอหน้าจอได้ เนื่องจากขัดต่อความปลอดภัยสารสนเทศของสหกรณ์ กรุณาปิดการบันทึกหน้าจอก่อนเข้าใช้งานแอป {APP_NAME} อีกครั้ง</Text>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.button} onPress={exitApp}>
                    <Text style={[styles.text, styles.btnText]}>ปิดแอป {APP_NAME}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

export default ScreenshotWarning

const styles = StyleSheet.create({
    container: {
        height: '100%'
    },
    headerText: {
        fontFamily: 'Sarabun-Regular',
        color: PRIMARY_COLOR
    },
    content: {
        height: '80%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    heading: {
        fontFamily: 'Sarabun-Medium',
        color: '#333',
        marginVertical: 10
    },
    text: {
        fontFamily: 'Sarabun-Regular',
        textAlign: 'center',
        marginHorizontal: 20,
        color: '#555'
    },
    btnText: {
        color: '#fff'
    },
    footer: {
        height: '10%',
        alignItems: 'center'
    },
    button: {
        backgroundColor: PRIMARY_COLOR,
        width: '90%',
        paddingVertical: 10,
        borderRadius: 4
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backgroundColor: '#fff'
    },
})

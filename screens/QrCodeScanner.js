import React, { useState, useEffect } from 'react'
import {
    StyleSheet,
    Text,
    View,
    Platform,
    BackHandler,
} from 'react-native'
import QRScanner from '../components/QrScanner'
import AppAlert from '../components/AppAlert'
import { launchImageLibrary } from 'react-native-image-picker'
import RNQRGenerator from 'rn-qr-generator'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import { addScreenshotListener } from 'react-native-detector'
import { readBankQr } from '../util'
import { APP_KEY } from '../environment'

const QrCodeScanner = ({ navigation }) => {
    const [showAlert, setShowAlert] = useState(false)
    const [showAccountAlert, setShowAccountAlert] = useState(false)
    const [showAuthenAlert, setShowAuthenAlert] = useState(false)
    const [alertMessage, setAlertMessage] = useState('')
    const [showQR, setShowQR] = useState(false)
    const [mainAccount, setMainAccount] = useState(null)

    const openQRscanner = () => {
        setShowQR(true)
    }

    const handleBackNavigator = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }]
        })
    }

    //  เลือกรูปจากแกลลอรี่
    const handleChoosePhoto = () => {
        const option = {}

        launchImageLibrary(option, async (response) => {
            if (!response.didCancel) {
                detectQr(response.assets[0].uri)
            }
        })
    }

    //  อ่านค่า QR Code จากรูป
    const detectQr = (uri) => {
        RNQRGenerator.detect({
            uri: uri
        })
            .then(response => {
                const { values } = response
                getData(values[0])
            })
            .catch(error => console.log('Cannot detect QR code in image', error))
    }

    //  ประมวลผมข้อมูลจาก QR Code
    const getData = (data) => {
        if (!data) {
            setShowAlert(true)
            setAlertMessage('(1001)')
        } else {
            if (data.includes(`|`)) {
                const firstBrIndex = data.indexOf(`\n`)
                const secondLine = data.slice(firstBrIndex + 1, data.length)
                const secondBrIndex = secondLine.indexOf(`\n`)
                const thirdLine = secondLine.slice(secondBrIndex + 1, secondLine.length)
                const fourthBrIndex = thirdLine.indexOf(`\n`)

                const accountNumber = thirdLine.slice(0, fourthBrIndex)
                const amount = thirdLine.slice(fourthBrIndex + 1, thirdLine.length) / 100

                if (accountNumber.length === 10) {
                    //  qr ฝากหุ้น
                    navigation.navigate('SharePayment', {
                        qrAccount: accountNumber,
                        qrAmount: amount,
                        mainAccount: mainAccount
                    })
                    return
                } else if (accountNumber.length === 11) {
                    //  qr บัญชีเงินฝาก
                    navigation.navigate('TransferMoney', {
                        qrAccount: accountNumber,
                        qrAmount: amount,
                        mainAccount: mainAccount
                    })
                    return
                } else if (accountNumber.length === 13) {
                    //  qr ผ่อน
                    navigation.navigate('LoanPayment', {
                        qrLoanCode: accountNumber,
                        qrAmount: amount,
                        mainAccount: mainAccount
                    })
                    return
                } else {
                    setShowAlert(true)
                    setAlertMessage('(1002)')
                }
            } else if (data.slice(0, 6) === '000201') {
                const bankQrData = readBankQr(data)

                if (bankQrData) {
                    navigation.navigate('SendToBank', {
                        qrNumber: bankQrData[0],
                        qrAmount: +bankQrData[1]
                    })
                } else {
                    setShowAlert(true)
                    setAlertMessage('(1003)')
                }
            } else {
                setShowAlert(true)
                setAlertMessage('(1004)')
            }
        }
    }

    const onQrRead = (qrtext) => {
        // qrtext = ค่าที่อ่านได้จาก qr
        getData(qrtext)
    }

    useEffect(() => {
        const backAction = () => {
            handleBackNavigator()
            return true
        }

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction)

        return () => backHandler.remove()
    })

    useEffect(() => {
        const getMainAccount = async () => {
            try {
                const StoreAPI_URL = await AsyncStorage.getItem('StoreAPI_URL')
                const token = await AsyncStorage.getItem('token')
                const apiKey = await AsyncStorage.getItem('confirmShareNumber')

                if (StoreAPI_URL !== null && token !== null && apiKey !== null) {
                    axios
                        .post(`${StoreAPI_URL}/GetMainAccount`, {
                            API_KEY: apiKey
                        }, {
                            headers: {
                                APP_KEY: APP_KEY,
                                Authorization: `Bearer ${token}`
                            }
                        })
                        .then(async (response) => {
                            const { code, item, itemdetail } = response.data

                            if (code === 10) {
                                setMainAccount(item)
                                openQRscanner()

                                try {
                                    await AsyncStorage.setItem('token', itemdetail)
                                } catch (err) {
                                    console.log(err)
                                }
                            } else if (code === 20) {
                                setShowAccountAlert(true)
                                setAlertMessage('กรุณาเลือกบัญชีหลัก เพื่อใช้ทำรายการสแกนจ่าย หรือ qr รับเงิน')

                                try {
                                    await AsyncStorage.setItem('token', item)
                                } catch (err) {
                                    console.log(err)
                                }
                            }
                        })
                        .catch(err => {
                            if (err.message === 'Network Error') {
                                setShowAuthenAlert(true)
                                setAlertMessage('กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่อีกครั้ง')
                            } else if (err.message === 'Request failed with status code 401') {
                                setShowAuthenAlert(true)
                                setAlertMessage('คุณไม่ได้ทำรายการในเวลาที่กำหนด กรุณา Login อีกครั้ง')
                            }
                        })
                }
            } catch (error) {
                console.log(error)
            }
        }

        getMainAccount()
    }, [])

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

    return (
        <View style={styles.page}>
            {
                showQR ? (
                    <QRScanner
                        onRead={onQrRead}
                        handleBackNavigator={handleBackNavigator}
                        handleChoosePhoto={handleChoosePhoto}
                    />
                ) : null
            }

            <AppAlert
                visible={showAlert}
                title={'รูปแบบ QR ไม่ถูกต้อง'}
                message={' ไม่สามารถอ่าน QR code นี้ได้' + alertMessage}
                showCancel={false}
                onConfirm={() => setShowAlert(false)}
                onCancel={() => setShowAlert(false)}
            />
            <AppAlert
                visible={showAccountAlert}
                title={' ไม่สำเร็จ'}
                message={alertMessage}
                showCancel={false}
                onConfirm={() => {
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'AccountSetting' }]
                    })
                }}
                onCancel={() => setShowAccountAlert(false)}
            />
            <AppAlert
                visible={showAuthenAlert}
                title={' ไม่สำเร็จ'}
                message={alertMessage}
                showCancel={false}
                onConfirm={() => {
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'PinInput' }]
                    })
                }}
                onCancel={() => setShowAuthenAlert(false)}
            />
        </View>
    )
}

export default QrCodeScanner

const styles = StyleSheet.create({
    page: {
        flex: 1,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'space-evenly',
    }
})
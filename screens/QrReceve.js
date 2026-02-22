import React, { useState, useEffect, useRef } from 'react'
import {
    Text,
    View,
    TouchableOpacity,
    StatusBar,
    BackHandler,
    TextInput,
    Image,
    ImageBackground,
    Platform,
    PermissionsAndroid,
    Alert,
    ActivityIndicator,
} from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'
import AntDesign from 'react-native-vector-icons/AntDesign'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import QRCode from 'react-native-qrcode-svg'
import {
    accountNumberFormat,
    getAmount,
    isInteger,
    prettyAmount,
    removeDash
} from '../util'
import ActionSheet from '../components/ActionSheet'
import { Toast, ToastProvider } from '../components/Toast'
import { CameraRoll } from '@react-native-camera-roll/camera-roll'
import { captureRef } from 'react-native-view-shot'
import Share from 'react-native-share'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import AppAlert from '../components/AppAlert'
import { APP_KEY, APP_NAME, PRIMARY_COLOR } from '../environment'
import { addScreenshotListener } from 'react-native-detector'
import DeviceInfo from 'react-native-device-info'

const QrCard = ({ name, accountNumber, amount }) => {
    const [shareNumber, setShareNumber] = useState(null)
    const [bankCode, setBankCode] = useState(null)

    useEffect(() => {
        const getShareNumber = async () => {
            try {
                const shareNo = await AsyncStorage.getItem('shareNo')
                const bankCode = await AsyncStorage.getItem('BankAccountCode')

                if (shareNo !== null && bankCode !== null) {
                    setShareNumber(removeDash(shareNo))
                    setBankCode(bankCode)
                }
            } catch (error) {
                console.log(error)
            }
        }

        getShareNumber()
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
        <View style={styles.rowContainer}>
            <View style={styles.qrContainer}>
                <View style={{ alignItems: 'center', marginBottom: 14 }}>
                    <Text style={[styles.primaryText, { color: '#333' }]}>{accountNumberFormat(accountNumber)}</Text>
                    <Text style={[styles.text, styles.secondaryText]}>วาดีอะห์</Text>
                </View>

                <QRCode
                    value={`${bankCode}\n${shareNumber}\n${accountNumber}\n${amount * 100}`}
                    size={170}
                />

                <View style={{ alignItems: 'center', width: '100%' }}>
                    <Text style={[styles.text, styles.textColor, { marginTop: 14 }]}>สแกน QR เพื่อโอนเข้าบัญชีสหกรณ์</Text>
                    <Text style={[styles.text, { marginTop: 6 }]} numberOfLines={1}>ชื่อ: {name}</Text>
                </View>
            </View>
        </View>
    )
}

const QrReceve = ({ navigation }) => {
    const [amount, setAmount] = useState(0)
    const [isOpen, setIsOpen] = useState(false)
    const [number, setNumber] = useState('')
    const [mainAccount, setMainAccount] = useState(null)
    const [showAlert, setShowAlert] = useState(false)
    const [alertType, setAlertType] = useState('normal')
    const [alertMessage, setAlertMessage] = useState('')
    const [alertAmountMessage, setAlertAmountMessage] = useState('')

    const viewRef = useRef()

    const handleBackNavigator = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }]
        })
    }

    const onCreate = () => {
        const amount = getAmount(number)

        if (isInteger(amount) && amount > 0) {
            setAmount(amount)
            setNumber('')
            setIsOpen(false)
        } else {
            setAlertAmountMessage('จำนวนเงินไม่ถูกต้อง กรุณาระบุจำนวนเงินเป็นจำนวนเต็ม')
        }
    }

    const getPermissionAndroid = async () => {
        try {
            let deviceVersion = DeviceInfo.getSystemVersion()
            let granted = PermissionsAndroid.RESULTS.DENIED

            if (deviceVersion >= 12) {
                granted = PermissionsAndroid.RESULTS.GRANTED
            } else {
                granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    {
                        'title': `${APP_NAME} ต้องการเข้าถึงข้อมูลไฟล์ของคุณ`,
                        'message': `${APP_NAME} ต้องการเข้าถึงข้อมูลไฟล์ของคุณ เพื่อที่คุณจะสามารถบันทึกรูปภาพได้`
                    }
                )
            }

            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                return true
            } else {
                Alert.alert(
                    'ไม่สามารถบันทึกได้',
                    `คุณยังไม่ได้อนุญาตให้แอป ${APP_NAME} บันทึกรูปลงเครื่อง กรุณาตั้งค่าจัดการแอป`,
                    [{ text: 'OK' }],
                    { cancelable: false },
                )

                return false
            }
        } catch (error) {
            console.log(error)
        }
    }

    const capture = async () => {
        const uri = await captureRef(viewRef, {
            format: 'png',
            quality: 0.8,
        })

        return uri
    }

    const downloadImage = async () => {
        try {
            if (Platform.OS === 'android') {
                const granted = await getPermissionAndroid()
                if (!granted) {
                    return
                }
            }

            const uri = await capture()

            const image = CameraRoll.save(uri, { type: 'photo', album: 'Ibnuauf' })

            if (image) {
                showToast()
            }
        } catch (error) {
            console.log('error', error)
        }
    }

    const showToast = () => {
        Toast.show('บันทึกรูปภาพสำเร็จ')
    }

    const ShareImage = async () => {
        try {
            const uri = await capture()
            await Share.open({ url: uri })
        } catch (error) {
            console.log('error', error)
        }
    }

    const onConfirmPressed = () => {
        setShowAlert(false)
        setAlertMessage('')

        if (alertType === 'Authen') {
            navigation.reset({
                index: 0,
                routes: [{ name: 'PinInput' }]
            })
        } else if (alertType === 'Account') {
            navigation.reset({
                index: 0,
                routes: [{ name: 'AccountSetting' }]
            })
        } else {
            navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }]
            })
        }
    }

    useEffect(() => {
        const getToken = async () => {
            try {
                const StoreAPI_URL = await AsyncStorage.getItem('StoreAPI_URL')
                const token = await AsyncStorage.getItem('token')
                const apiKey = await AsyncStorage.getItem('confirmShareNumber')

                axios.post(`${StoreAPI_URL}/GetMainAccount`, {
                    API_KEY: apiKey
                }, {
                    headers: {
                        APP_KEY: APP_KEY,
                        Authorization: `Bearer ${token}`
                    }
                })
                    .then(async response => {
                        const { code, item, itemdetail, message } = response.data

                        if (code === 10) {
                            setMainAccount(item)

                            try {
                                await AsyncStorage.setItem('token', itemdetail)
                            } catch (err) {
                                console.log(err)
                            }
                        } else if (code === 20) {
                            setShowAlert(true)
                            setAlertType('Account')
                            setAlertMessage('กรุณาเลือกบัญชีหลัก เพื่อใช้ทำรายการสแกนจ่าย หรือ qr รับเงิน')

                            try {
                                await AsyncStorage.setItem('token', item)
                            } catch (err) {
                                console.log(err)
                            }
                        } else {
                            setShowAlert(true)
                            setAlertMessage(!message ? '' : message)
                        }
                    })
                    .catch(err => {
                        if (err.message === 'Network Error') {
                            setShowAlert(true)
                            setAlertType('Authen')
                            setAlertMessage('กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่อีกครั้ง')
                        } else if (err.message === 'Request failed with status code 401') {
                            setShowAlert(true)
                            setAlertType('Authen')
                            setAlertMessage('คุณไม่ได้ทำรายการในเวลาที่กำหนด กรุณา Login อีกครั้ง')
                        }
                    })
            } catch (err) {
                console.log(err)
            }
        }

        getToken()
    }, [])

    useEffect(() => {
        const backAction = () => {
            handleBackNavigator()
            return true
        }

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        )

        return () => backHandler.remove()
    })

    return (
        !mainAccount ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator color='#0000ff' />

                <AppAlert
                    visible={showAlert}
                    title={alertMessage === '' ? alertMessage : ' ไม่สำเร็จ'}
                    message={alertMessage === '' ? 'Loading...' : alertMessage}
                    showConfirm={alertMessage !== ''}
                    showCancel={false}
                    onConfirm={onConfirmPressed}
                    onCancel={() => setShowAlert(false)}
                />
            </View>
        ) : (
            <ToastProvider>
                <View style={styles.container}>
                    <StatusBar barStyle='dark-content' />
                    <View style={styles.infoConatainer}>
                        <View style={[styles.rowContainer, styles.headerContainer]}>
                            <TouchableOpacity onPress={() => { }}>
                                <AntDesign name='close' size={30} color='#fafafa' />
                            </TouchableOpacity>

                            <Text style={[styles.primaryText]}>QR รับเงิน</Text>

                            <TouchableOpacity onPress={handleBackNavigator}>
                                <AntDesign name='close' size={30} color={PRIMARY_COLOR} />
                            </TouchableOpacity>
                        </View>

                        <QrCard
                            name={mainAccount.ACCOUNT_NAME}
                            accountNumber={mainAccount.ACCOUNT_NO}
                            amount={amount}
                        />
                    </View>

                    <View style={styles.footerContainer}>
                        {
                            amount > 0 && (
                                <View style={styles.amountContainer}>
                                    <Text style={[styles.text, styles.secondaryText]}>จำนวนเงิน</Text>
                                    <Text style={styles.text}><Text style={styles.amountTextBold}>{prettyAmount(amount)}</Text> บาท</Text>
                                </View>
                            )
                        }

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.button} onPress={() => setIsOpen(true)} >
                                <Text style={[styles.text, styles.textColor]}>แก้ไข QR รับเงิน</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.menuContainer}>
                            <TouchableOpacity style={styles.menuItem} onPress={downloadImage} >
                                <View style={styles.menuIcon}>
                                    <MaterialCommunityIcons name='download' size={26} color='#fff' />
                                </View>
                                <Text style={styles.menuText}>บันทึก</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.menuItem} onPress={ShareImage} >
                                <View style={styles.menuIcon}>
                                    <MaterialCommunityIcons name='share-variant' size={26} color='#fff' />
                                </View>
                                <Text style={styles.menuText}>แชร์</Text>
                            </TouchableOpacity>
                        </View>

                        <ActionSheet
                            visible={isOpen}
                            onClose={() => setIsOpen(false)}
                            title=' '
                        >
                            <View style={{ paddingHorizontal: 16 }}>
                                {
                                    alertAmountMessage !== '' && (
                                        <Text style={styles.alertText}>{alertAmountMessage}</Text>
                                    )
                                }
                                <Text style={styles.titleText}>จำนวนเงิน</Text>

                                <TextInput
                                    style={styles.input}
                                    onChangeText={text => setNumber(text)}
                                    value={number}
                                    keyboardType='numeric'
                                    placeholder='0.00'
                                />

                                <TouchableOpacity style={[styles.button, styles.actionsheetButton, Platform.OS === 'android' && { marginBottom: 30 }]} onPress={onCreate}>
                                    <Text style={[styles.text, { color: '#fff', fontFamily: 'Sarabun-Medium', }]}>สร้าง QR รับเงิน</Text>
                                </TouchableOpacity>
                            </View>
                        </ActionSheet>
                    </View>
                </View >

                <ImageBackground ref={viewRef} source={require('../assets/qr-background2.png')} style={styles.imageBackground}>
                    <Image
                        style={styles.logoImage}
                        source={require('../assets/logo-slip.png')}
                        resizeMode='contain'
                    />

                    <QrCard
                        name={mainAccount.ACCOUNT_NAME}
                        accountNumber={mainAccount.ACCOUNT_NO}
                        amount={amount}
                    />

                    <View style={[styles.amountContainer, { marginBottom: 20 }]}>
                        <Text style={[styles.text, styles.secondaryText]}>จำนวนเงิน</Text>
                        <Text style={styles.text}><Text style={styles.amountTextBold}>{prettyAmount(amount)}</Text> บาท</Text>
                    </View>
                </ImageBackground>
            </ToastProvider >
        )
    )
}

export default QrReceve

const styles = ScaledSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fafafa',
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: '24@s',
    },
    rowContainer: {
        alignItems: 'center',
        marginBottom: '14@vs',
    },
    primaryText: {
        fontFamily: 'Sarabun-Medium',
        fontSize: '15@s',
        color: PRIMARY_COLOR,
        paddingVertical: '1.5@s'
    },
    secondaryText: {
        fontFamily: 'Sarabun-Regular',
        color: '#555',
    },
    qrContainer: {
        backgroundColor: '#fff',
        padding: '30@s',
        borderRadius: '14@s',
        alignItems: 'center',
        shadowColor: '#333',
        shadowOffset: {
            width: 1,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
        width: '85%'
    },
    text: {
        fontFamily: 'Sarabun-Regular',
        fontSize: '14@s',
        color: '#333',
        paddingVertical: '1.5@s',
    },
    textColor: {
        color: PRIMARY_COLOR,
    },
    menuContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        paddingHorizontal: '24@s',
    },
    menuItem: {
        width: '90@s',
        alignItems: 'center',
    },
    menuIcon: {
        width: '45@s',
        height: '45@s',
        borderRadius: '24.5@s',
        backgroundColor: PRIMARY_COLOR,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuText: {
        fontFamily: 'Sarabun-Regular',
        fontSize: '12@s',
        color: '#333',
        marginTop: '6@vs',
        textAlign: 'center',
    },
    buttonContainer: {
        width: '100%',
        alignItems: 'center',
        marginBottom: '4@vs',
    },
    button: {
        width: '80%',
        borderColor: PRIMARY_COLOR,
        borderWidth: 1,
        paddingVertical: '10@vs',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: '15@s',
        borderRadius: '100@s'
    },
    actionsheetButton: {
        width: '100%',
        backgroundColor: '#40a9ff',
        borderColor: '#40a9ff',
        marginVertical: 0,
        marginTop: '6@vs'
    },
    infoConatainer: {
        flex: 0.65,
        justifyContent: 'flex-end',
        paddingBottom: '10@vs'
    },
    footerContainer: {
        backgroundColor: '#fff',
        flex: 0.35,
    },
    amountContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: '12@s',
        marginTop: '8@vs',
        alignItems: 'center',
    },
    amountTextBold: {
        fontFamily: 'Sarabun-Medium',
        fontSize: '18@s',
        color: '#333'
    },
    titleText: {
        fontFamily: 'Sarabun-Medium',
        fontSize: '15@s',
        color: '#555',
        padding: 3,
        alignSelf: 'flex-start'
    },
    input: {
        marginTop: '8@vs',
        backgroundColor: '#fff',
        fontFamily: 'Sarabun-Light',
        width: '100%',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        fontSize: '18@s',
        color: '#333',
        paddingHorizontal: '12@s',
        paddingVertical: '10@vs',
        marginBottom: '10@s',
        textAlign: 'right'
    },
    imageBackground: {
        zIndex: -1,
        position: 'absolute',
        width: '100%'
    },
    logoImage: {
        width: '60%',
        height: undefined,
        aspectRatio: 1,
        alignSelf: 'center',
        overflow: 'hidden',
        marginVertical: -60,
    },
    toastContainer: {
        backgroundColor: '#52c41a',
        flexDirection: 'row',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 20,
        alignItems: 'center'
    },
    toastText: {
        fontFamily: 'Sarabun-Regular',
        fontSize: '12@s',
        color: '#fff',
        textAlign: 'center',
        marginLeft: 5,
        paddingVertical: 3
    },
    alertText: {
        fontFamily: 'Sarabun-Regular',
        marginBottom: 10,
        color: '#ff4d4f'
    }
})

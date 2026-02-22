import React, { useState, useEffect } from 'react'
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    TouchableWithoutFeedback,
    Keyboard,
    KeyboardAvoidingView,
    ScrollView,
    BackHandler,
    Platform
} from 'react-native'
import { scale, verticalScale } from 'react-native-size-matters'
import AppHeader2 from '../../../components/AppHeader2'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { APP_KEY } from '../../../environment'
import axios from 'axios'
import AppAlert from '../../../components/AppAlert'
import { TextInputMask } from 'react-native-masked-text'
import { styles } from '../../../styles/form'
import { prettyAmount, removeDash, shareNumberFormat, getAmount, getAccountType } from '../../../util'
import NetInfo from '@react-native-community/netinfo'
import { addScreenshotListener } from 'react-native-detector'

export default function ShareDeposit({ route, navigation }) {
    const { favoriteNumber, previousScreen } = route.params

    const [shareNumber, setShareNumber] = useState(null)
    const [shareNumberShow, setShareNumberShow] = useState(null)
    const [apiKey, setApiKey] = useState(null)
    const [token, setToken] = useState(null)
    const [accountType, setAccountType] = useState('ownAccount')
    const [destinationAccount, setDestinationAccount] = useState('')
    const [destinationAccountName, setDestinationAccountName] = useState('')
    const [number, setNumber] = useState(null)
    const [showAlert, setShowAlert] = useState(false)
    const [showAlertToken, setShowAlertToken] = useState(false)
    const [alertMessage, setAlertMessage] = useState('')
    const [accountName, setAccountName] = useState(null)
    const [accountDescription, setAccountDescription] = useState(null)
    const [accountNumber, setAccountNumber] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [API_URL, setAPI_URL] = useState(null)

    const onBlur = () => {
        if (number !== null && number !== '') {
            const prettyNumber = prettyAmount(number)

            if (prettyNumber[0] === '0.00') {
                setNumber(null)
            } else {
                setNumber(...prettyNumber)
            }
        }
    }

    const next = () => {
        if (accountType === 'ownAccount') {
            if (!number) {
                setShowAlert(true)
                setAlertMessage('กรุณากรอกจำนวนเงิน')
            } else {
                let amount = getAmount(number)

                if (amount < 0) {
                    setShowAlert(true)
                    setAlertMessage('จำนวนเงินไม่ถูกต้อง')
                    return
                }

                if (amount % 100 !== 0) {
                    setShowAlert(true)
                    setAlertMessage('กรุณาระบุจำนวนเงินหลักร้อย')
                } else {
                    navigation.navigate('QrCodeGenerate', {
                        ref1: shareNumber,
                        ref2: shareNumber,
                        amount: amount,
                        accountName: accountName,
                        accountNumber: shareNumberShow,
                        accountDescription: accountDescription,
                        transactionType: 'Share',
                    })
                }
            }
        } else {
            if (destinationAccount?.length !== 12 && favoriteNumber === undefined) {
                setShowAlert(true)
                setAlertMessage('กรุณากรอกหมายเลขบัญชีให้ครบ')
            } else if (!number) {
                setShowAlert(true)
                setAlertMessage('กรุณากรอกจำนวนเงิน')
            } else {
                let destinationAccountReplaced = removeDash(destinationAccount)
                let amount = getAmount(number)

                if (amount < 0) {
                    setShowAlert(true)
                    setAlertMessage('จำนวนเงินไม่ถูกต้อง')
                    return
                }

                if (amount % 100 !== 0) {
                    setShowAlert(true)
                    setAlertMessage('กรุณาระบุจำนวนเงินหลักร้อย')
                } else {
                    if (favoriteNumber !== undefined) {
                        navigation.navigate('QrCodeGenerate', {
                            ref1: shareNumber,
                            ref2: favoriteNumber,
                            amount: amount,
                            accountName: accountName,
                            accountNumber: accountNumber,
                            accountDescription: accountDescription,
                            transactionType: 'Share',
                        })
                    } else {
                        navigation.navigate('QrCodeGenerate', {
                            ref1: shareNumber,
                            ref2: destinationAccountReplaced,
                            amount: amount,
                            accountName: accountName,
                            accountNumber: accountNumber,
                            accountDescription: accountDescription,
                            transactionType: 'Share',
                        })
                    }
                }
            }
        }
    }

    const checkMemId = (shareMem) => {
        axios
            .post(
                `${API_URL}/CheckMemID`,
                {
                    API_KEY: apiKey,
                    MEM: shareMem,
                },
                {
                    headers: {
                        APP_KEY: APP_KEY,
                        Authorization: `Bearer ${token}`,
                    },
                },
            )
            .then(async response => {
                // console.log(response.data)
                if (response.data.code === 10) {
                    setDestinationAccountName(response.data.item.NAME)
                    setAccountName(response.data.item.NAME)
                    setAccountNumber(response.data.item.SHR_)
                    setAccountDescription(response.data.item.SHR_TYPE)
                } else {
                    setShowAlert(true)
                    setAlertMessage(response.data.message)
                    setDestinationAccount('')
                    setDestinationAccountName('')
                }
            })
            .catch(err => {
                console.log(err.message)
                if (err.message === 'Network Error') {
                    setShowAlertToken(true)
                    setAlertMessage('กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่อีกครั้ง')
                } else if (err.message === 'Request failed with status code 401') {
                    setShowAlertToken(true)
                    setAlertMessage('คุณไม่ได้ทำรายการในเวลาที่กำหนด กรุณา Login อีกครั้ง')
                }
            })
    }

    const handleBackNavigator = () => {
        if (favoriteNumber !== undefined) {
            navigation.reset({
                index: 0,
                routes: [{
                    name: 'FavoriteDashboard',
                    params: {
                        previousScreen: previousScreen
                    }
                }]
            })
        } else {
            navigation.reset({
                index: 0,
                routes: [{ name: 'PromptPayList' }]
            })
        }
    }

    useEffect(() => {
        const getToken = async () => {
            try {
                const MEM = await AsyncStorage.getItem('MEM')
                const StoreAPI_URL = await AsyncStorage.getItem('StoreAPI_URL')
                const token = await AsyncStorage.getItem('token')
                const apiKey = await AsyncStorage.getItem('confirmShareNumber')

                if (StoreAPI_URL !== null && token !== null && apiKey !== null && MEM !== null) {
                    let mem = removeDash(MEM)

                    setShareNumber(mem)
                    setToken(token)
                    setApiKey(apiKey)
                    setAPI_URL(StoreAPI_URL)

                    if (favoriteNumber !== undefined) {
                        setAccountType('otherAccount')

                        axios
                            .post(
                                `${StoreAPI_URL}/CheckMemID`,
                                {
                                    API_KEY: apiKey,
                                    MEM: shareNumberFormat(favoriteNumber),
                                },
                                {
                                    headers: {
                                        APP_KEY: APP_KEY,
                                        Authorization: `Bearer ${token}`,
                                    },
                                },
                            )
                            .then(async response => {
                                // console.log(response.data)
                                if (response.data.code === 10) {
                                    setDestinationAccountName(response.data.item.NAME)
                                    setAccountName(response.data.item.NAME)
                                    setAccountNumber(response.data.item.SHR_)
                                    setAccountDescription(response.data.item.SHR_TYPE)

                                    setIsLoading(false)
                                } else {
                                    setShowAlert(true)
                                    setAlertMessage(response.data.message)
                                    setDestinationAccount('')
                                    setDestinationAccountName('')
                                }
                            })
                            .catch(err => {
                                console.log(err.message)
                                if (err.message === 'Network Error') {
                                    setShowAlertToken(true)
                                    setAlertMessage('ไม่สามารถทำรายการได้ กรุณาลองใหม่อีกครั้ง')
                                } else if (err.message === 'Request failed with status code 401') {
                                    setShowAlertToken(true)
                                    setAlertMessage('คุณไม่ได้ทำรายการในเวลาที่กำหนด กรุณา Login อีกครั้ง')
                                }
                            })
                    } else {
                        axios
                            .post(
                                `${StoreAPI_URL}/Shr`,
                                {
                                    API_KEY: apiKey,
                                },
                                {
                                    headers: {
                                        APP_KEY: APP_KEY,
                                        Authorization: `Bearer ${token}`,
                                    },
                                },
                            )
                            .then(async response => {
                                if (response.data.code === 10) {
                                    setShareNumberShow(response.data.item.SHR_)
                                    setAccountName(response.data.item.NAME)
                                    setAccountDescription(response.data.item.SHR_TYPE)

                                    setIsLoading(false)

                                    try {
                                        await AsyncStorage.setItem('token', response.data.itemdetail.Token)
                                    } catch (err) {
                                        console.log(err)
                                    }
                                }
                            })
                            .catch(err => {
                                console.log(err.message)
                                if (err.message === 'Network Error') {
                                    setShowAlertToken(true)
                                    setAlertMessage('ไม่สามารถทำรายการได้ กรุณาลองใหม่อีกครั้ง')
                                } else if (
                                    err.message === 'Request failed with status code 401'
                                ) {
                                    setShowAlertToken(true)
                                    setAlertMessage('คุณไม่ได้ทำรายการในเวลาที่กำหนด กรุณา Login อีกครั้ง')
                                }
                            })
                    }
                }
            } catch (err) {
                console.log(err)
            }
        }

        const unsubscribe = NetInfo.addEventListener((state) => {
            if (state.isInternetReachable) {
                getToken()
            } else {
                setShowAlertToken(true)
                setAlertMessage('กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตและลองใหม่อีกครั้ง')
            }
        })

        return () => {
            unsubscribe()
        }
    }, [route])

    useEffect(() => {
        setDestinationAccount('')
        setDestinationAccountName('')
        setNumber(null)
    }, [accountType])

    useEffect(() => {
        if (destinationAccount.length === 12) {
            const accountNumber = removeDash(destinationAccount)
            const accountType = getAccountType(accountNumber)

            if (accountType !== '01') {
                setShowAlert(true)
                setAlertMessage('เลขบัญชีหุ้นไม่ถูกต้อง')
                setDestinationAccount('')
                setDestinationAccountName('')
            } else {
                checkMemId(destinationAccount)
            }
        }
    }, [destinationAccount])

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
            handleBackNavigator()
            return true
        }

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction)

        return () => backHandler.remove()
    })

    if (isLoading) {
        return (
            <View style={{ flex: 1 }}>
                <AppHeader2 onPress={handleBackNavigator} />

                <View style={styles.emptyContainer}>
                    <ActivityIndicator color='#0000ff' />
                </View>

                <AppAlert
                    visible={showAlertToken}
                    title={' ไม่สำเร็จ'}
                    message={alertMessage === '' ? 'Loading...' : alertMessage}
                    showConfirm={alertMessage !== ''}
                    showCancel={false}
                    onConfirm={() => {
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'PinInput' }]
                        })
                        setShowAlertToken(false)
                    }}
                    onCancel={() => setShowAlertToken(false)}
                />
            </View>
        )
    } else {
        return (
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                    <AppHeader2 onPress={handleBackNavigator} />

                    <View style={{ flex: 1 }}>
                        <View style={styles.labelBox}>
                            <Text style={styles.labelText}>ฝากหุ้น</Text>
                        </View>

                        <ScrollView style={{ padding: 10 }}>
                            <TouchableOpacity activeOpacity={1}>
                                <View style={styles.btnContainer}>
                                    <TouchableOpacity
                                        style={[accountType === 'ownAccount' ? styles.btnTabActive : styles.btnTab, { borderBottomLeftRadius: 30, borderTopLeftRadius: 30 }]}
                                        onPress={() => favoriteNumber === undefined && setAccountType('ownAccount')}
                                    >
                                        <Text style={accountType === 'ownAccount' ? styles.btnTabTextActive : styles.btnTabText}>บัญชีหุ้นตัวเอง</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[accountType === 'otherAccount' ? styles.btnTabActive : styles.btnTab, { borderBottomRightRadius: 30, borderTopRightRadius: 30 }]}
                                        onPress={() => setAccountType('otherAccount')}
                                    >
                                        <Text style={accountType === 'otherAccount' ? styles.btnTabTextActive : styles.btnTabText}>บัญชีหุ้นผู้อื่น</Text>
                                    </TouchableOpacity>
                                </View>

                                {
                                    accountType === 'ownAccount' ? (
                                        <View style={styles.formContainer}>
                                            <Text style={styles.titleText}> ไปยังบัญชีหุ้น</Text>

                                            <View style={styles.shareInfoBox}>
                                                <View style={styles.accountNameContainer}>
                                                    <View style={{ justifyContent: 'center' }}>
                                                        <Text style={styles.accountNameText} numberOfLines={1}>{shareNumberShow} {accountName}</Text>
                                                    </View>
                                                </View>
                                            </View>

                                            <Text style={styles.titleText}>จำนวนเงิน</Text>

                                            <TextInput
                                                placeholder='0.00'
                                                style={[styles.input, styles.amountInput]}
                                                onChangeText={text => setNumber(text)}
                                                value={number}
                                                onBlur={onBlur}
                                                keyboardType='numeric'
                                            />

                                            <Text style={styles.guideText}>ตัวอย่าง: 100, 700, 1000, 5200</Text>
                                        </View>
                                    ) : (
                                        <View style={[styles.formContainer, { height: verticalScale(350) }]}>
                                            <Text style={styles.titleText}> ไปยังบัญชี</Text>

                                            {
                                                favoriteNumber !== undefined ? (
                                                    <TextInputMask
                                                        editable={false}
                                                        type='custom'
                                                        placeholder='เลขที่บัญชีหุ้นปลายทาง'
                                                        keyboardType='numeric'
                                                        placeholderTextColor='#999'
                                                        options={{ mask: '999-99-99999' }}
                                                        value={favoriteNumber}
                                                        style={[styles.input, { marginBottom: scale(10) }]}
                                                    />
                                                ) : (
                                                    <TextInputMask
                                                        autoFocus={true}
                                                        type='custom'
                                                        placeholder='เลขที่บัญชีหุ้นปลายทาง'
                                                        keyboardType='numeric'
                                                        placeholderTextColor='#999'
                                                        options={{ mask: '999-99-99999' }}
                                                        value={destinationAccount}
                                                        onChangeText={text => setDestinationAccount(text)}
                                                        style={[styles.input, { marginBottom: scale(10) }]}
                                                    />
                                                )
                                            }

                                            {
                                                destinationAccountName !== '' && (
                                                    <View style={{ marginTop: scale(10) }}>
                                                        <Text style={styles.titleText}>ชื่อบัญชีหุ้น</Text>

                                                        <View style={styles.accountNameContainer}>
                                                            <Text style={styles.accountNameText} numberOfLines={1}>{destinationAccountName}</Text>
                                                        </View>
                                                    </View>
                                                )
                                            }

                                            <Text style={styles.titleText}>จำนวนเงิน</Text>

                                            <TextInput
                                                placeholder='0.00'
                                                style={[styles.input, styles.amountInput]}
                                                onChangeText={text => setNumber(text)}
                                                value={number}
                                                onBlur={onBlur}
                                                keyboardType='numeric'
                                            />

                                            <Text style={styles.guideText}>ตัวอย่าง: 100, 700, 1000, 5200</Text>
                                        </View>
                                    )
                                }

                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity onPress={handleBackNavigator} style={[styles.button, styles.backBtn]}>
                                        <Text style={[styles.buttonText, styles.backText]}>กลับ</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity onPress={next} style={[styles.button, styles.nextBtn]}>
                                        <Text style={[styles.buttonText, styles.nextText]}>ถัดไป</Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>

                    <AppAlert
                        visible={showAlert}
                        title={' ไม่สำเร็จ'}
                        message={alertMessage === '' ? 'Loading...' : alertMessage}
                        showConfirm={alertMessage !== ''}
                        showCancel={false}
                        onConfirm={() => setShowAlert(false)}
                        onCancel={() => setShowAlert(false)}
                    />

                    <AppAlert
                        visible={showAlertToken}
                        title={' ไม่สำเร็จ'}
                        message={alertMessage === '' ? 'Loading...' : alertMessage}
                        showConfirm={alertMessage !== ''}
                        showCancel={false}
                        onConfirm={() => {
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'PinInput' }]
                            })
                            setShowAlertToken(false)
                        }}
                        onCancel={() => setShowAlertToken(false)}
                    />
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback >
        )
    }
}

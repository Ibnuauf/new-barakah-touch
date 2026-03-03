import React, { useState, useEffect, useReducer } from 'react'
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    TouchableWithoutFeedback,
    Keyboard,
    KeyboardAvoidingView,
    BackHandler,
    Platform
} from 'react-native'
import { verticalScale } from 'react-native-size-matters'
import axios from 'axios'
import AppAlert from '../../../components/AppAlert'
import { TextInputMask } from 'react-native-masked-text'
import AsyncStorage from '@react-native-async-storage/async-storage'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { APP_KEY } from '../../../environment'
import AppHeader2 from '../../../components/AppHeader2'
import { styles } from '../../../styles/form'
import { savingListReducer, initialSavingListState } from '../../../reducers/savingListReducer'
import { prettyAmount, removeDash, getAmount, isInteger, getAccountType } from '../../../util'
import NetInfo from '@react-native-community/netinfo'
import { addScreenshotListener } from 'react-native-detector'
import ActionSheet from '../../../components/ActionSheet'

export default function Deposit({ route, navigation }) {
    const { favoriteNumber, previousScreen } = route.params

    const [shareNumber, setShareNumber] = useState(null)
    const [apiKey, setApiKey] = useState(null)
    const [token, setToken] = useState(null)
    const [accountType, setAccountType] = useState('ownAccount')
    const [destinationAccount, setDestinationAccount] = useState('')
    const [destinationAccountName, setDestinationAccountName] = useState('')
    const [{ SAVING_LIST }, dispatch] = useReducer(savingListReducer, initialSavingListState)
    const [isSavingEmpty, setIsSavingEmpty] = useState(false)
    const [ownAccount, setOwnAccount] = useState(null)
    const [number, setNumber] = useState(null)
    const [showAlert, setShowAlert] = useState(false)
    const [alertMessage, setAlertMessage] = useState('')
    const [accountName, setAccountName] = useState(null)
    const [accountDescription, setAccountDescription] = useState(null)
    const [ACC_TYPE, setACC_TYPE] = useState(null)
    const [accountNumber, setAccountNumber] = useState(null)
    const [modalVisible, setModalVisible] = useState(false)
    const [alertType, setAlertType] = useState('normal')
    const [isLoading, setIsLoading] = useState(true)
    const [API_URL, setAPI_URL] = useState(null)

    const selectSaving = (saving) => {
        setAccountName(saving.ACCOUNT_NAME)
        setAccountNumber(saving.ACCOUNT_SHOW)
        setOwnAccount(saving.ACCOUNT_NO)
        setAccountDescription(saving.ACC_DESC)
        setACC_TYPE(saving.ACC_TYPE)
        setModalVisible(false)
    }

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

                if (isInteger(amount)) {
                    if (amount < 0) {
                        setShowAlert(true)
                        setAlertMessage('จำนวนเงินไม่ถูกต้อง')
                        return
                    }

                    if (ACC_TYPE === '03' && amount % 100 !== 0) {
                        setShowAlert(true)
                        setAlertMessage('กรณีบัญชีมูฏอรอบะฮ์ กรุณาระบุจำนวนเงินคราวละ 100 บาท')
                    } else {
                        navigation.navigate('QrCodeGenerate', {
                            ref1: shareNumber,
                            ref2: ownAccount,
                            amount: amount,
                            accountName: accountName,
                            accountNumber: accountNumber,
                            accountDescription: accountDescription,
                            transactionType: 'Deposit'
                        })
                    }
                } else {
                    setShowAlert(true)
                    setAlertMessage('กรุณาระบุจำนวนเงินเป็นจำนวนเต็ม')
                }
            }
        } else {
            if (destinationAccount?.length !== 14 && favoriteNumber === undefined) {
                setShowAlert(true)
                setAlertMessage('กรุณากรอกหมายเลขบัญชีให้ครบ')
            } else if (!number) {
                setShowAlert(true)
                setAlertMessage('กรุณากรอกจำนวนเงิน')
            } else {
                if (favoriteNumber !== undefined) {
                    let amount = getAmount(number)
                    const favoriteAccountType = getAccountType(favoriteNumber)

                    if (isInteger(amount)) {
                        if (amount < 0) {
                            setShowAlert(true)
                            setAlertMessage('จำนวนเงินไม่ถูกต้อง')
                            return
                        }

                        if (favoriteAccountType === '03' && amount % 100 !== 0) {
                            setShowAlert(true)
                            setAlertMessage('กรณีบัญชีมูฏอรอบะฮ์ กรุณาระบุจำนวนเงินคราวละ 100 บาท')
                        } else {
                            navigation.navigate('QrCodeGenerate', {
                                ref1: shareNumber,
                                ref2: favoriteNumber,
                                amount: amount,
                                accountName: accountName,
                                accountNumber: accountNumber,
                                accountDescription: accountDescription,
                                transactionType: 'Deposit'
                            })
                        }
                    } else {
                        setShowAlert(true)
                        setAlertMessage('กรุณาระบุจำนวนเงินเป็นจำนวนเต็ม')
                    }
                } else {
                    let destinationAccountReplaced = removeDash(destinationAccount)
                    let amount = getAmount(number)

                    if (isInteger(amount)) {
                        if (ACC_TYPE === '03' && amount % 100 !== 0) {
                            setShowAlert(true)
                            setAlertMessage('กรณีบัญชีมูฏอรอบะฮ์ กรุณาระบุจำนวนเงินคราวละ 100 บาท')
                        } else {
                            navigation.navigate('QrCodeGenerate', {
                                ref1: shareNumber,
                                ref2: destinationAccountReplaced,
                                amount: amount,
                                accountName: accountName,
                                accountNumber: accountNumber,
                                accountDescription: accountDescription,
                                transactionType: 'Deposit'
                            })
                        }
                    } else {
                        setShowAlert(true)
                        setAlertMessage('กรุณาระบุจำนวนเงินเป็นจำนวนเต็ม')
                    }
                }
            }
        }
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

    const onConfirmPressed = () => {
        setShowAlert(false)
        setAlertMessage('')

        if (alertType === 'Authen') {
            setACC_TYPE(null)
            setAlertType('normal')
            navigation.reset({
                index: 0,
                routes: [{ name: 'PinInput' }]
            })
        }
    }

    const checkAccountNumber = (accountNo) => {
        if (getAccountType(accountNo) === '06' || getAccountType(accountNo) === '07') {
            setShowAlert(true)
            setAlertMessage(' ไม่สามารถฝากเงินเข้าบัญชีอิสติกอมะฮ์ หรือบัญชีมูฎอรอบะฮฺ พิเศษได้')
            setDestinationAccount('')
            setDestinationAccountName('')
        } else {
            axios
                .post(`${API_URL}/CheckAccountNO`, {
                    API_KEY: apiKey,
                    ACCOUNT_NO: accountNo
                }, {
                    headers: {
                        APP_KEY: APP_KEY,
                        Authorization: `Bearer ${token}`
                    }
                })
                .then(async (response) => {
                    // console.log(response.data)
                    if (response.data.code === 10) {
                        const { ACCOUNT_NAME, ACCOUNT_NO, ACC_DESC, ACC_TYPE } = response.data.item[0]

                        setDestinationAccountName(ACCOUNT_NAME)
                        setAccountName(ACCOUNT_NAME)
                        setAccountNumber(ACCOUNT_NO)
                        setAccountDescription(ACC_DESC)
                        setACC_TYPE(ACC_TYPE)
                    } else {
                        setShowAlert(true)
                        setAlertMessage(response.data.message ? response.data.message : 'เลขบัญชีไม่ถูกต้อง')
                        setDestinationAccount('')
                        setDestinationAccountName('')
                    }
                })
                .catch(err => {
                    console.log(err.message)
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
                    setAPI_URL(StoreAPI_URL)
                    setToken(token)
                    setApiKey(apiKey)

                    if (favoriteNumber !== undefined) {
                        setAccountType('otherAccount')

                        axios
                            .post(`${StoreAPI_URL}/CheckAccountNO`, {
                                API_KEY: apiKey,
                                ACCOUNT_NO: favoriteNumber
                            }, {
                                headers: {
                                    APP_KEY: APP_KEY,
                                    Authorization: `Bearer ${token}`
                                }
                            })
                            .then(async (response) => {
                                // console.log(response.data)
                                if (response.data.code === 10) {
                                    const { ACCOUNT_NAME, ACCOUNT_NO, ACC_DESC, ACC_TYPE } = response.data.item[0]

                                    setDestinationAccountName(ACCOUNT_NAME)
                                    setAccountName(ACCOUNT_NAME)
                                    setAccountNumber(ACCOUNT_NO)
                                    setAccountDescription(ACC_DESC)
                                    setACC_TYPE(ACC_TYPE)
                                } else {
                                    setShowAlert(true)
                                    setAlertMessage(response.data.message ? response.data.message : 'เลขบัญชีไม่ถูกต้อง')
                                    setDestinationAccount('')
                                    setDestinationAccountName('')
                                }

                                setIsLoading(false)
                            })
                            .catch(err => {
                                console.log(err.message)
                                if (err.message === 'Network Error') {
                                    setShowAlert(true)
                                    setAlertType('Authen')
                                    setAlertMessage('ไม่สามารถทำรายการได้ กรุณาลองใหม่อีกครั้ง')
                                } else if (err.message === 'Request failed with status code 401') {
                                    setShowAlert(true)
                                    setAlertType('Authen')
                                    setAlertMessage('คุณไม่ได้ทำรายการในเวลาที่กำหนด กรุณา Login อีกครั้ง')
                                }
                            })
                    } else {
                        axios
                            .post(`${StoreAPI_URL}/Saving`, {
                                API_KEY: apiKey
                            }, {
                                headers: {
                                    APP_KEY: APP_KEY,
                                    Authorization: `Bearer ${token}`
                                }
                            })
                            .then(async (response) => {
                                // console.log(response.data)
                                if (response.data !== undefined) {
                                    if ((response.data.item)?.length <= 0) {
                                        setIsSavingEmpty(true)
                                    } else {
                                        const { ACCOUNT_NO, ACCOUNT_NAME, ACC_DESC, ACCOUNT_SHOW } = response.data.item[0]

                                        setOwnAccount(ACCOUNT_NO)
                                        setAccountName(ACCOUNT_NAME)
                                        setAccountDescription(ACC_DESC)
                                        setAccountNumber(ACCOUNT_SHOW)
                                    }

                                    const accounts = response.data.item.filter(
                                        item => item.ACC_TYPE !== '06' && item.ACC_TYPE !== '07'
                                    )

                                    dispatch({ type: 'SET_SAVING_LIST', SAVING_LIST: accounts })
                                    setIsLoading(false)

                                    try {
                                        await AsyncStorage.setItem('token', response.data.itemdetail)
                                    } catch (err) {
                                        console.log(err)
                                    }
                                }
                            })
                            .catch(err => {
                                console.log(err.message)
                                if (err.message === 'Network Error') {
                                    setShowAlert(true)
                                    setAlertType('Authen')
                                    setAlertMessage('ไม่สามารถทำรายการได้ กรุณาลองใหม่อีกครั้ง')
                                } else if (err.message === 'Request failed with status code 401') {
                                    setShowAlert(true)
                                    setAlertType('Authen')
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
                setShowAlert(true)
                setAlertType('Authen')
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
        if (destinationAccount.length === 14) {
            let destinationAccountReplaced = removeDash(destinationAccount)

            checkAccountNumber(destinationAccountReplaced)
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
                    visible={showAlert}
                    title={' ไม่สำเร็จ'}
                    message={alertMessage === '' ? 'Loading...' : alertMessage}
                    showConfirm={alertMessage !== ''}
                    showCancel={false}
                    onConfirm={onConfirmPressed}
                    onCancel={() => setShowAlert(false)}
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
                            <Text style={styles.labelText}>ฝากเงินเข้าบัญชี</Text>
                        </View>

                        <ScrollView style={{ padding: 10 }}>
                            <TouchableOpacity activeOpacity={1}>
                                <View style={styles.btnContainer}>
                                    <TouchableOpacity
                                        style={[accountType === 'ownAccount' ? styles.btnTabActive : styles.btnTab, { borderBottomLeftRadius: 30, borderTopLeftRadius: 30 }]}
                                        onPress={() => favoriteNumber === undefined && setAccountType('ownAccount')}
                                    >
                                        <Text style={accountType === 'ownAccount' ? styles.btnTabTextActive : styles.btnTabText}>บัญชีตัวเอง</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[accountType === 'otherAccount' ? styles.btnTabActive : styles.btnTab, { borderBottomRightRadius: 30, borderTopRightRadius: 30 }]}
                                        onPress={() => { setAccountType('otherAccount') }}
                                    >
                                        <Text style={accountType === 'otherAccount' ? styles.btnTabTextActive : styles.btnTabText}>บัญชีผู้อื่น</Text>
                                    </TouchableOpacity>
                                </View>

                                {
                                    accountType === 'ownAccount' ? (
                                        <View style={styles.formContainer}>
                                            <Text style={styles.titleText}> ไปยังบัญชี</Text>

                                            <TouchableOpacity style={styles.savingBox} onPress={() => setModalVisible(true)}>
                                                {
                                                    isSavingEmpty ? (
                                                        <Text style={[styles.savingText, { flex: 1 }]} numberOfLines={1}> ไม่พบหมายเลขบัญชี</Text>
                                                    ) : (
                                                        <View>
                                                            <Text style={styles.savingText} numberOfLines={1}>{accountName}</Text>
                                                            <Text style={[styles.savingText, styles.savingDetail]} numberOfLines={1}>{accountNumber} ({accountDescription})</Text>
                                                        </View>
                                                    )
                                                }

                                                <AntDesign name='down' size={16} color='#aaa' />
                                            </TouchableOpacity>

                                            <Text style={styles.titleText}>จำนวนเงิน</Text>

                                            <TextInput
                                                placeholder='0.00'
                                                style={[styles.input, styles.amountInput]}
                                                onChangeText={text => setNumber(text)}
                                                value={number}
                                                onBlur={onBlur}
                                                keyboardType='numeric'
                                            />

                                            {
                                                ACC_TYPE === '03' && (
                                                    <Text style={styles.guideText}>ตัวอย่าง: 100, 700, 1000, 5200</Text>
                                                )
                                            }
                                        </View>
                                    ) : (
                                        <View style={[styles.formContainer, { height: verticalScale(320) }]}>
                                            <Text style={styles.titleText}> ไปยังบัญชี</Text>

                                            {
                                                favoriteNumber !== undefined ? (
                                                    <TextInputMask
                                                        editable={false}
                                                        type='custom'
                                                        placeholder='เลขที่บัญชีปลายทาง'
                                                        keyboardType='numeric'
                                                        placeholderTextColor='#999'
                                                        options={{ mask: '999-99-99999-9' }}
                                                        value={favoriteNumber}
                                                        style={[styles.input, { marginBottom: verticalScale(15) }]}
                                                    />
                                                ) : (
                                                    <TextInputMask
                                                        autoFocus={true}
                                                        type='custom'
                                                        placeholder='เลขที่บัญชีปลายทาง'
                                                        keyboardType='numeric'
                                                        placeholderTextColor='#999'
                                                        options={{ mask: '999-99-99999-9' }}
                                                        value={destinationAccount}
                                                        onChangeText={text => setDestinationAccount(text)}
                                                        style={[styles.input, { marginBottom: verticalScale(15) }]}
                                                    />
                                                )
                                            }

                                            {
                                                destinationAccountName !== '' && (
                                                    <View>
                                                        <Text style={styles.titleText}>ชื่อบัญชี</Text>

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

                                            {
                                                ACC_TYPE === '03' && (
                                                    <Text style={styles.guideText}>ตัวอย่าง: 100, 700, 1000, 5200</Text>
                                                )
                                            }
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

                    <ActionSheet
                        visible={modalVisible}
                        onClose={() => setModalVisible(false)}
                        title='เลือกบัญชี'
                    >
                        <ScrollView style={{ width: '100%' }}>
                            {
                                favoriteNumber === undefined && SAVING_LIST.map((saving, index) => (
                                    <TouchableOpacity key={index} style={styles.modalSavingList} onPress={() => selectSaving(saving)}>
                                        <Text style={[styles.savingText, { fontFamily: 'Sarabun-Medium' }]} numberOfLines={1}>{saving.ACCOUNT_NAME}</Text>
                                        <Text style={[styles.savingText, styles.savingDetail]} numberOfLines={1}>{saving.ACCOUNT_SHOW} ({saving.ACC_DESC})</Text>
                                    </TouchableOpacity>
                                ))
                            }
                        </ScrollView>
                    </ActionSheet>

                    <AppAlert
                        visible={showAlert}
                        title={' ไม่สำเร็จ'}
                        message={alertMessage === '' ? 'Loading...' : alertMessage}
                        showConfirm={alertMessage !== ''}
                        showCancel={false}
                        onConfirm={onConfirmPressed}
                        onCancel={() => setShowAlert(false)}
                    />
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        )
    }
}

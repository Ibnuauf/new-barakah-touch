import React, { useState, useEffect } from 'react'
import {
    Text,
    View,
    TouchableWithoutFeedback,
    Keyboard,
    Dimensions,
    TouchableOpacity,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Pressable,
    ActivityIndicator,
    BackHandler,
    Image,
    SafeAreaView,
    Platform
} from 'react-native'
import ActionSheet from '../../components/ActionSheet'
import { styles } from '../../styles/transaction'
import AppHeader2 from '../../components/AppHeader2'
import Carousel from 'react-native-snap-carousel'
import { verticalScale, scale } from 'react-native-size-matters'
import { TextInputMask } from 'react-native-masked-text'
import { prettyAmount, removeDash, banks, getAmount, accountNumberFormat, isInteger } from '../../util'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import { APP_KEY } from '../../environment'
import AppAlert from '../../components/AppAlert'
import AntDesign from 'react-native-vector-icons/AntDesign'
import NetInfo from '@react-native-community/netinfo'
import TransferHistory from '../../components/TransferHistory'
import { addScreenshotListener } from 'react-native-detector'

const { width: windowWidth } = Dimensions.get('window')

const SendToBank = ({ route, navigation }) => {
    const { favoriteNumber, FavBankCode, previousScreen, qrNumber, qrAmount, favAmount } = route.params

    const [bankAccountNumber, setBankAccountNumber] = useState('')
    const [promptpayNumber, setPromptpayNumber] = useState('')
    const [amount, setAmount] = useState(null)
    const [sourceAccount, setSourceAccount] = useState(null)
    const [sourceAccountList, setSourceAccountList] = useState(null)
    const [showAlert, setShowAlert] = useState(false)
    const [alertMessage, setAlertMessage] = useState('')
    const [alertType, setAlertType] = useState('normal')
    const [accountType, setAccountType] = useState('bank')
    const [modalVisible, setModalVisible] = useState(false)
    const [token, setToken] = useState(null)
    const [memo, setMemo] = useState('')
    const [API_URL, setAPI_URL] = useState(null)
    const [destinationBank, setDestinationBank] = useState(null)
    const [bankCode, setBankCode] = useState(null)
    const [fee, setFee] = useState(0)
    const [limit, setLimit] = useState(50000)
    const [isLoading, setIsLoading] = useState(true)
    const [history, setHistory] = useState([])
    const [favNumber, setFavNumber] = useState(null)

    const selectBank = bank => {
        setBankCode(bank.BANK_CODE)
        setDestinationBank(bank)
        setModalVisible(false)
    }

    const checkAccount = () => {
        let finalAmount

        if (qrAmount && qrAmount > 0) {
            const numberArr = prettyAmount(qrAmount)
            finalAmount = numberArr[0]
        } else {
            finalAmount = amount
        }

        // setShowAlert(true)

        navigation.navigate('CheckListBankOtp', {
            PromptPayAccountNo: '1111111111',
            PromptPayAccountName: 'ทดสอบ2 ทดสอบ2',
            ToBankId: '014',
            SenderName: 'ทดสอบ1 ทดสอบ1',
            SenderReference: '00000000000',
            Amount: 100,
            memo,
            mgate_prev_inquiry_request: { message: 'test' }
        })

        // axios
        //     .post(`${API_URL}/CIMB_Inquire`, {
        //         PoxyId: accountType === 'bank' ? bankAccountNumber : promptpayNumber,
        //         ToBankId: accountType === 'bank' ? bankCode : null,
        //         Amount: finalAmount,
        //         ACCOUNT_NO: sourceAccount.ACCOUNT_NO,
        //         FEE: fee
        //     }, {
        //         headers: {
        //             APP_KEY: APP_KEY,
        //             Authorization: `Bearer ${token}`,
        //         }
        //     })
        //     .then(async response => {
        //         // console.log(response.data)
        //         if (response.data.code === 10) {
        //             setShowAlert(false)

        //             try {
        //                 await AsyncStorage.setItem('token', response.data.itemdetail)
        //             } catch (error) {
        //                 console.log(error)
        //             }

        //             const { PromptPayAccountName, ToBankID } = await response.data.item
        //             const { SenderName, SenderReference, Amount, ProxyID } = await response.data.item.mgate_prev_inquiry_request

        //             // string to integer ("1000000"(string) -> 1000000(integer) -> 10000.00(integer))
        //             const amountInt = +Amount / 100

        //             navigation.navigate('CheckListBankOtp', {
        //                 PromptPayAccountNo: ProxyID,
        //                 PromptPayAccountName,
        //                 ToBankId: accountType === 'bank' ? ToBankID : null,
        //                 SenderName,
        //                 SenderReference,
        //                 Amount: amountInt,
        //                 memo,
        //                 mgate_prev_inquiry_request: response.data.item.mgate_prev_inquiry_request
        //             })
        //         } else {
        //             setShowAlert(true)
        //             setAlertMessage(response.data.message)

        //             try {
        //                 await AsyncStorage.setItem('token', response.data.itemdetail)
        //             } catch (error) {
        //                 console.log(error)
        //             }
        //         }
        //     })
        //     .catch(err => {
        //         console.log({ err })
        //         if (err.message === 'Network Error') {
        //             setShowAlert(true)
        //             setAlertType('Authen')
        //             setAlertMessage('ไม่สามารถทำรายการได้ กรุณาลองใหม่อีกครั้ง')
        //         } else if (err.message === 'Request failed with status code 401') {
        //             setShowAlert(true)
        //             setAlertType('Authen')
        //             setAlertMessage('คุณไม่ได้ทำรายการในเวลาที่กำหนด กรุณา Login อีกครั้ง')
        //         }
        //     })
    }

    const showHistory = (StoreAPI_URL, apiKey, ACCOUNT_NO, itemdetail) => {
        axios
            .post(`${StoreAPI_URL}/TransferHistory`, {
                API_KEY: apiKey,
                ACCOUNT_NO: ACCOUNT_NO
            }, {
                headers: {
                    APP_KEY: APP_KEY,
                    Authorization: `Bearer ${itemdetail}`,
                }
            })
            .then(async response => {
                // console.log(response.data)
                const { code, item, message, itemdetail } = response.data

                if (code === 10) {
                    setHistory(item)
                }

                try {
                    await AsyncStorage.setItem('token', itemdetail)
                } catch (err) {
                    console.log(err)
                }
            })
            .catch(err => {
                console.log({ err })
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

    const onSubmit = () => {
        let number
        let available = sourceAccount.AVAILABLE

        if (favNumber && favNumber !== '0.00') {
            number = getAmount(favNumber)
        } else if (qrAmount && qrAmount > 0) {
            number = qrAmount
        } else {
            if (amount) {
                number = getAmount(amount)
            } else {
                number = 0
            }
        }

        if (isInteger(number)) {
            if (number < 0) {
                setShowAlert(true)
                setAlertMessage('จำนวนเงินไม่ถูกต้อง')
                return
            }

            if (number > limit) {
                setShowAlert(true)
                setAlertMessage(`โอนเงินได้ไม่เกิน ${prettyAmount(limit)} บาท ต่อครั้ง !`)
            } else {
                if (available - 100 < number + fee) {
                    setShowAlert(true)
                    setAlertMessage(`ยอดเงินในบัญชีไม่เพียงพอหักค่าธรรมเนียม ต้องมียอดเงินคงเหลือในบัญชีอย่างน้อย 100 บาท`)
                    return
                }

                if (accountType === 'bank') {
                    if (!bankCode) {
                        setShowAlert(true)
                        setAlertMessage('กรุณาเลือกธนาคาร')
                    } else {
                        if (bankAccountNumber === '') {
                            setShowAlert(true)
                            setAlertMessage('กรุณากรอกเลขบัญชี')
                        } else {
                            if (!amount || amount === '0') {
                                setShowAlert(true)
                                setAlertMessage('กรุณากรอกจำนวนเงิน')
                            } else {
                                checkAccount()
                            }
                        }
                    }
                } else {
                    if (promptpayNumber.length === 10 || promptpayNumber.length === 13 || promptpayNumber.length === 15) {
                        if (!qrAmount) {
                            if (!amount || amount === '0') {
                                setShowAlert(true)
                                setAlertMessage('กรุณากรอกจำนวนเงิน')
                            } else {
                                checkAccount()
                            }
                        } else {
                            if (!qrAmount || qrAmount <= 0) {
                                setShowAlert(true)
                                setAlertMessage('กรุณากรอกจำนวนเงิน')
                            } else {
                                checkAccount()
                            }
                        }
                    } else {
                        setShowAlert(true)
                        setAlertMessage('กรุณากรอกหมายเลขพร้อมเพย์ให้ครบ')
                    }
                }
            }
        } else {
            setShowAlert(true)
            setAlertMessage('กรุณาระบุจำนวนเงินเป็นจำนวนเต็ม')
        }
    }

    const onConfirmPressed = () => {
        setShowAlert(false)
        setAlertMessage('')

        if (alertType === 'Authen') {
            setAccountType('bank')
            setAlertType('normal')

            navigation.reset({
                index: 0,
                routes: [{ name: 'PinInput' }]
            })
        } else if (alertType === 'Account') {
            setAccountType('bank')
            setAlertType('normal')

            navigation.reset({
                index: 0,
                routes: [{ name: 'AccountSetting' }]
            })
        } else if (alertType === 'Line') {
            setAccountType('bank')
            setAlertType('normal')

            navigation.reset({
                index: 0,
                routes: [{ name: 'ServiceList' }]
            })
        }
    }

    const renderItem = ({ item }) => {
        const { ACCOUNT_NO, ACCOUNT_NAME, AVAILABLE } = item

        return (
            <Pressable activeOpacity={1} style={[styles.item]}>
                <View style={{ paddingHorizontal: 10 }}>
                    <Text numberOfLines={1} style={[styles.cardText, { fontFamily: 'Sarabun-Regular' }]}>{ACCOUNT_NAME}</Text>
                    <Text numberOfLines={1} style={[styles.cardText, { fontSize: scale(13) }]}>{accountNumberFormat(ACCOUNT_NO)} (วาดีอะฮ์)</Text>

                    <View style={styles.balance}>
                        <Text style={styles.cardText}>ยอดเงินที่ใช้ได้</Text>
                        <Text style={styles.cardBoldText}>{prettyAmount(AVAILABLE)}<Text style={styles.cardText}> บาท</Text></Text>
                    </View>
                </View>
            </Pressable>
        )
    }

    const onBlur = () => {
        if (amount !== null && amount !== '') {
            const prettyNumber = prettyAmount(amount)

            if (prettyNumber[0] === '0.00') {
                setAmount(null)
            } else {
                setAmount(...prettyNumber)
            }
        } else if (favNumber !== null && favNumber !== '') {
            const prettyNumber = prettyAmount(favNumber)

            if (prettyNumber[0] === '0.00') {
                setFavNumber(null)
            } else {
                setFavNumber(...prettyNumber)
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
        } else if (qrNumber !== undefined) {
            navigation.reset({
                index: 0,
                routes: [{ name: 'QrCodeScanner' }]
            })
        } else {
            navigation.reset({
                index: 0,
                routes: [{ name: 'TransactionMenu' }]
            })
        }
    }

    useEffect(() => {
        const getToken = async () => {
            setFavNumber(prettyAmount(+favAmount).toString())

            try {
                const limit = await AsyncStorage.getItem('Maximum_Limit')
                const fee = await AsyncStorage.getItem('Fee')
                const StoreAPI_URL = await AsyncStorage.getItem('StoreAPI_URL')
                const token = await AsyncStorage.getItem('token')
                const apiKey = await AsyncStorage.getItem('confirmShareNumber')

                if (fee !== null && limit !== null) {
                    setFee(+fee)
                    setLimit(+limit)
                }

                if (StoreAPI_URL !== null && token !== null && apiKey !== null) {
                    setAPI_URL(StoreAPI_URL)
                    setToken(token)

                    axios
                        .post(
                            `${StoreAPI_URL}/GetMainAccount`,
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
                            const { code, item, itemdetail, message } = response.data

                            if (code === 10) {
                                let newSavings = []

                                newSavings.push(item)

                                setSourceAccount(item)
                                setSourceAccountList(newSavings)

                                if (favoriteNumber !== undefined) {
                                    const fav = removeDash(favoriteNumber)

                                    if (!FavBankCode) {
                                        setAccountType('promptPay')
                                        setPromptpayNumber(fav)
                                    } else {
                                        const bank = banks.find(bank => bank.BANK_CODE === FavBankCode)

                                        setBankCode(FavBankCode)
                                        setDestinationBank(bank)
                                        setBankAccountNumber(fav)
                                    }
                                }

                                if (qrNumber !== undefined) {
                                    setAccountType('promptPay')
                                    setPromptpayNumber(qrNumber)
                                }

                                setTimeout(() => {
                                    showHistory(StoreAPI_URL, apiKey, item.ACCOUNT_NO, itemdetail)
                                }, 1000)

                                try {
                                    await AsyncStorage.setItem('token', itemdetail)

                                    setIsLoading(false)
                                } catch (err) {
                                    console.log(err)
                                }
                            } else if (code === 20) {
                                setShowAlert(true)
                                setAlertType('Account')
                                setAlertMessage('กรุณาเลือกบัญชีหลักเพื่อใช้ในการโอนออกไปยังธนาคาร')

                                try {
                                    await AsyncStorage.setItem('token', item)
                                } catch (err) {
                                    console.log(err)
                                }
                            } else if (code === 30) {
                                setShowAlert(true)
                                setAlertType('Line')
                                setAlertMessage(message)

                                try {
                                    await AsyncStorage.setItem('token', item)
                                } catch (err) {
                                    console.log(err)
                                }
                            }
                        })
                        .catch(err => {
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
        setAmount('')
    }, [accountType])

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
                    message={alertMessage}
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

                    <SafeAreaView style={{ flex: 1 }}>
                        <View style={[styles.labelBox, styles.headerLabelBox,]}>
                            <Text style={styles.labelText}>โอนเงินไปยังธนาคาร</Text>
                        </View>

                        <ScrollView>
                            <TouchableOpacity activeOpacity={1}>
                                <View style={[{ height: verticalScale(160) }]}>
                                    <Text style={[styles.titleText, { padding: 10 }]}>จากบัญชี</Text>

                                    <View style={{ marginTop: -6 }}>
                                        <Carousel
                                            sliderWidth={windowWidth}
                                            sliderHeight={windowWidth}
                                            itemWidth={windowWidth - 90}
                                            data={sourceAccountList}
                                            renderItem={renderItem}
                                        />
                                    </View>
                                </View>

                                <View style={{ padding: 10 }}>
                                    <Text style={[styles.titleText]}> ไปยัง</Text>

                                    <View style={styles.formContainer}>
                                        <View style={styles.tapContainer}>
                                            <Pressable
                                                style={accountType === 'bank' ? styles.tapBtnActive : styles.tapBtn}
                                                onPress={() => (!favoriteNumber && !qrNumber) && setAccountType('bank')}
                                            >
                                                <Text style={accountType === 'bank' ? styles.tapTextActive : styles.tapText}>บัญชี</Text>
                                            </Pressable>

                                            <Pressable
                                                style={accountType === 'promptPay' ? styles.tapBtnActive : styles.tapBtn}
                                                onPress={() => !favoriteNumber && setAccountType('promptPay')}
                                            >
                                                <Text style={accountType === 'promptPay' ? styles.tapTextActive : styles.tapText}>พร้อมเพย์</Text>
                                            </Pressable>

                                            {
                                                !favoriteNumber && (
                                                    <Pressable
                                                        style={accountType === 'history' ? styles.tapBtnActive : styles.tapBtn}
                                                        onPress={() => !favoriteNumber && setAccountType('history')}
                                                    >
                                                        <Text style={accountType === 'history' ? styles.tapTextActive : styles.tapText}>ประวัติ</Text>
                                                    </Pressable>
                                                )
                                            }
                                        </View>

                                        {
                                            accountType === 'history' ? (
                                                <ScrollView style={{ height: 280, overflow: 'hidden' }}>
                                                    <TransferHistory history={history} />
                                                </ScrollView>
                                            ) : (
                                                accountType === 'bank' ? (
                                                    <View>
                                                        <Text style={styles.titleText}>ธนาคาร</Text>

                                                        <TouchableOpacity
                                                            style={styles.savingBox}
                                                            onPress={() => FavBankCode === undefined && setModalVisible(true)}
                                                            activeOpacity={FavBankCode !== undefined && 1}
                                                        >
                                                            {
                                                                !destinationBank ? (
                                                                    <Text style={[styles.savingText, { color: '#999' }]} numberOfLines={1}>เลือกธนาคาร</Text>
                                                                ) : (
                                                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                                        <Image source={destinationBank.logo} style={styles.bankLogo} />

                                                                        <View>
                                                                            <Text style={[styles.savingText]} numberOfLines={1}>{destinationBank.name}</Text>
                                                                            <Text style={[styles.savingText, styles.savingDetail]} numberOfLines={1}>{destinationBank.symbol}</Text>
                                                                        </View>
                                                                    </View>
                                                                )
                                                            }

                                                            {
                                                                FavBankCode === undefined && (
                                                                    <AntDesign name='down' size={16} color='#aaa' />
                                                                )
                                                            }
                                                        </TouchableOpacity>

                                                        <Text style={styles.titleText}>เลขที่บัญชี</Text>

                                                        <TextInputMask
                                                            editable={!favoriteNumber ? true : false}
                                                            type={'custom'}
                                                            keyboardType='numeric'
                                                            options={{ mask: '99999999999999999999' }}
                                                            value={bankAccountNumber}
                                                            onChangeText={text => setBankAccountNumber(text)}
                                                            style={styles.input}
                                                        />

                                                        <Text style={styles.titleText}>จำนวนเงิน</Text>

                                                        <TextInput
                                                            style={[styles.input, styles.amountInput]}
                                                            onChangeText={text => setAmount(text)}
                                                            value={amount}
                                                            onBlur={() => onBlur()}
                                                            keyboardType='numeric'
                                                            placeholder='0.00'
                                                        />
                                                    </View>
                                                ) : (
                                                    <View>
                                                        <Text style={styles.titleText}>หมายเลขพร้อมเพย์</Text>

                                                        {
                                                            !qrNumber ? (
                                                                <TextInputMask
                                                                    editable={!favoriteNumber ? true : false}
                                                                    type={'custom'}
                                                                    keyboardType='numeric'
                                                                    options={{ mask: '999999999999999' }}
                                                                    value={promptpayNumber}
                                                                    onChangeText={text => setPromptpayNumber(text)}
                                                                    style={styles.input}
                                                                />
                                                            ) : (
                                                                <TextInputMask
                                                                    editable={false}
                                                                    type={'custom'}
                                                                    keyboardType='numeric'
                                                                    options={{ mask: '999999999999999' }}
                                                                    value={promptpayNumber}
                                                                    style={styles.input}
                                                                />
                                                            )
                                                        }

                                                        <Text style={styles.titleText}>จำนวนเงิน</Text>

                                                        {
                                                            !qrAmount ? (
                                                                favAmount !== null && favAmount > 0 ? (
                                                                    <TextInput
                                                                        style={[styles.input, styles.amountInput]}
                                                                        onChangeText={text => setFavNumber(text)}
                                                                        value={favNumber}
                                                                        onBlur={() => onBlur()}
                                                                        keyboardType='numeric'
                                                                        placeholder='0.00'
                                                                    />
                                                                ) : (
                                                                    <TextInput
                                                                        style={[styles.input, styles.amountInput]}
                                                                        onChangeText={text => setAmount(text)}
                                                                        value={amount}
                                                                        onBlur={() => onBlur()}
                                                                        keyboardType='numeric'
                                                                        placeholder='0.00'
                                                                    />
                                                                )
                                                            ) : (
                                                                <TextInput
                                                                    editable={false}
                                                                    style={[styles.input, styles.amountInput]}
                                                                    value={prettyAmount(+qrAmount).toString()}
                                                                    keyboardType='numeric'
                                                                    placeholder='0.00'
                                                                />
                                                            )
                                                        }
                                                    </View>
                                                )
                                            )
                                        }

                                        {
                                            accountType !== 'history' && (
                                                <View>
                                                    <Text style={styles.guideText}>โอนเงินได้ไม่เกิน {prettyAmount(limit)} บาท ต่อวัน</Text>

                                                    <View style={{ marginTop: 10 }}>
                                                        <View style={styles.memoContainer}>
                                                            <Text style={styles.titleText}>บันทึกช่วยจำ</Text>
                                                            <Text style={styles.mamoLen}>{memo.length}/30</Text>
                                                        </View>

                                                        <TextInputMask
                                                            type={'custom'}
                                                            options={{ mask: '******************************' }}
                                                            value={memo}
                                                            onChangeText={text => setMemo(text)}
                                                            style={[styles.input, { marginBottom: verticalScale(15) }]}
                                                        />
                                                    </View>
                                                </View>
                                            )
                                        }
                                    </View>
                                </View>

                                {
                                    accountType !== 'history' && (
                                        <View style={{ width: '90%', alignSelf: 'center' }}>
                                            <TouchableOpacity onPress={onSubmit} style={styles.button}>
                                                <Text style={styles.btnText}>ตรวจสอบข้อมูล</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )
                                }
                            </TouchableOpacity>
                        </ScrollView>

                        <ActionSheet
                            visible={modalVisible}
                            onClose={() => setModalVisible(false)}
                            title='ธนาคาร'
                        >
                            <ScrollView style={{ width: '100%' }}>
                                {
                                    banks.map((bank) => (
                                        <TouchableOpacity key={bank.BANK_CODE} style={[styles.modalSavingList, styles.modalBankList]} onPress={() => selectBank(bank)}>
                                            <Image source={bank.logo} style={styles.bankLogo} />

                                            <View>
                                                <Text style={styles.savingText} numberOfLines={1}>{bank.name}</Text>
                                                <Text style={[styles.savingText, styles.savingDetail]} numberOfLines={1}>{bank.symbol}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))
                                }
                            </ScrollView>
                        </ActionSheet>
                    </SafeAreaView>

                    <AppAlert
                        visible={showAlert}
                        title={alertMessage === '' ? alertMessage : ' ไม่สำเร็จ'}
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

export default SendToBank

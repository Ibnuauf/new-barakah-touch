import React, { useState, useEffect, useReducer } from 'react'
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    TouchableWithoutFeedback,
    Keyboard,
    ScrollView,
    KeyboardAvoidingView,
    BackHandler,
    Platform
} from 'react-native'
import ActionSheet from '../../../components/ActionSheet'
import { scale, verticalScale } from 'react-native-size-matters'
import AppHeader2 from '../../../components/AppHeader2'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { APP_KEY } from '../../../environment'
import axios from 'axios'
import AppAlert from '../../../components/AppAlert'
import { TextInputMask } from 'react-native-masked-text'
import { styles } from '../../../styles/form'
import { loanListReducer, initialLoanListState } from '../../../reducers/loanListReducer'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { prettyAmount, removeDash, getAmount, getAccountType, isInteger } from '../../../util'
import NetInfo from '@react-native-community/netinfo'
import { addScreenshotListener } from 'react-native-detector'

export default function PayOffLoan({ route, navigation }) {
    const { favoriteShare, favoriteNumber, previousScreen } = route.params

    const [{ LOAN_LIST }, dispatch] = useReducer(loanListReducer, initialLoanListState)

    const [token, setToken] = useState(null)
    const [shareNumber, setShareNumber] = useState(null)
    const [shareNumberShow, setShareNumberShshareNumberShow] = useState(null)
    const [loanType, setLoanType] = useState('ownLoan')
    const [destinationMem, setDestinationMem] = useState('')
    const [destinationLoan, setDestinationLoan] = useState('')
    const [ownNumber, setOwnNumber] = useState(null)
    const [otherNumber, setOtherNumber] = useState(null)
    const [showAlert, setShowAlert] = useState(false)
    const [showAlertToken, setShowAlertToken] = useState(false)
    const [alertMessage, setAlertMessage] = useState('')
    const [loanId, setLoanId] = useState(null)
    const [loanCode, setLoanCode] = useState(null)
    const [loanOtherCode, setLoanOtherCode] = useState(null)
    const [loanName, setLoanName] = useState(null)
    const [debt, setDebt] = useState(null)
    const [otherDebt, setOtherDebt] = useState(null)
    const [modalVisible, setModalVisible] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isLoanEmpty, setIsLoanEmpty] = useState(false)
    const [name, setName] = useState(null)
    const [API_URL, setAPI_URL] = useState(null)
    const [loanDescription, setLoanDescription] = useState(null)
    const [textInputDisableHolder, setTextInputDisableHolder] = useState(true)

    const selectLoan = loan => {
        setLoanName(loan.LSUB_NAME)
        setLoanId(loan.LCONT_ID)
        setDebt(loan.LCONT_AMOUNT_SAL)
        setOwnNumber(loan.LCONT_SAL)
        setLoanCode(loan.CODE)
        setLoanDescription(loan.LSUB_NAME)
        setModalVisible(false)
    }

    const onBlur = () => {
        if (loanType === 'ownLoan') {
            if (ownNumber !== null && ownNumber !== '') {
                const prettyNumber = prettyAmount(ownNumber)

                if (prettyNumber[0] === '0.00') {
                    setOwnNumber(null)
                } else {
                    setOwnNumber(...prettyNumber)
                }
            }
        } else {
            if (otherNumber !== null && otherNumber !== '') {
                const prettyNumber = prettyAmount(otherNumber)

                if (prettyNumber[0] === '0.00') {
                    setOtherNumber(null)
                } else {
                    setOtherNumber(...prettyNumber)
                }
            }
        }
    }

    const next = () => {
        let ownAmount = ownNumber !== null ? getAmount(ownNumber) : ''
        let otherAmount = otherNumber !== null ? getAmount(otherNumber) : ''

        if (loanType === 'ownLoan') {
            if (LOAN_LIST.length <= 0) {
                return
            }

            let balance = getAmount(debt)

            if (isInteger(ownAmount)) {
                if (ownAmount < 0) {
                    setShowAlert(true)
                    setAlertMessage('จำนวนเงินไม่ถูกต้อง')
                    return
                }

                if (isLoanEmpty) {
                    setShowAlert(true)
                    setAlertMessage('ไม่พบหมายเลขสินเชื่อ')
                } else if (!ownAmount) {
                    setShowAlert(true)
                    setAlertMessage('กรุณากรอกจำนวนเงิน')
                } else if (ownAmount > balance) {
                    setShowAlert(true)
                    setAlertMessage('จำนวนที่ต้องการผ่อน มากกว่ายอดหนี้คงเหลือ')
                } else if (!(ownAmount >= 100 || ownAmount === balance)) {
                    setShowAlert(true)
                    setAlertMessage('ยอดผ่อนขั้นต่ำ 100 บาท')
                } else {
                    var MemID = (shareNumber.substring(0, 3)) + (shareNumber.substring(5, 11))
                    let LoanMemCode = MemID + loanCode

                    navigation.navigate('QrCodeGenerate', {
                        ref1: shareNumber,
                        ref2: LoanMemCode,
                        amount: +ownAmount,
                        accountName: shareNumberShow,
                        accountNumber: loanId,
                        accountDescription: loanName,
                        transactionType: 'Loan',
                        name: name,
                        loanDescription: loanDescription
                    })
                }
            } else {
                setShowAlert(true)
                setAlertMessage('กรุณาระบุจำนวนเงินเป็นจำนวนเต็ม')
            }
        } else {
            if (destinationMem?.length !== 12 && favoriteShare === undefined) {
                setShowAlert(true)
                setAlertMessage('กรุณากรอกเลขบัญชีหุ้นให้ครบ')
            } else if (destinationLoan?.length !== 14 && favoriteNumber === undefined) {
                setShowAlert(true)
                setAlertMessage('กรุณากรอกเลขสัญญาให้ครบ')
            } else {
                if (otherDebt === null) {
                    setShowAlert(true)
                    setAlertMessage('เลขบัญชีหุ้นหรือเลขสัญญาไม่ถูกต้อง!')
                } else {
                    let otherbalance = getAmount(otherDebt)

                    if (isInteger(otherAmount)) {
                        if (otherAmount < 0) {
                            setShowAlert(true)
                            setAlertMessage('จำนวนเงินไม่ถูกต้อง')
                            return
                        }

                        if (otherAmount > otherbalance) {
                            setShowAlert(true)
                            setAlertMessage('จำนวนที่ต้องการผ่อน มากกว่ายอดหนี้คงเหลือ')
                        } else if (!(otherAmount >= 100 || otherAmount === otherbalance)) {
                            setShowAlert(true)
                            setAlertMessage('ยอดผ่อนขั้นต่ำ 100 บาท')
                        } else if (favoriteNumber !== undefined && favoriteShare !== undefined) {
                            const favoriteShareWithoutDash = removeDash(favoriteShare)
                            const MemID = (favoriteShareWithoutDash.substring(0, 3)) + (favoriteShareWithoutDash.substring(5, 11))
                            const LoanMemCode = MemID + loanOtherCode

                            navigation.navigate('QrCodeGenerate', {
                                ref1: shareNumber,
                                ref2: LoanMemCode,
                                amount: +otherAmount,
                                accountName: destinationMem,
                                accountNumber: loanId,
                                accountDescription: loanName,
                                transactionType: 'Loan',
                                name: name,
                                loanDescription: loanDescription
                            })
                        } else {
                            let destinationMemReplaced = removeDash(destinationMem)
                            var MemID = (destinationMemReplaced.substring(0, 3)) + (destinationMemReplaced.substring(5, 11))
                            let LoanMemCode = MemID + loanOtherCode

                            navigation.navigate('QrCodeGenerate', {
                                ref1: shareNumber,
                                ref2: LoanMemCode,
                                amount: +otherAmount,
                                accountName: destinationMem,
                                accountNumber: loanId,
                                accountDescription: loanName,
                                transactionType: 'Loan',
                                name: name,
                                loanDescription: loanDescription
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

    const getLoanDetail = (mem, loanId) => {
        axios
            .post(
                `${API_URL}/CheckLoanID`,
                {
                    MEM: mem,
                    LCONT_ID: loanId,
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
                    setOtherNumber(response.data.item.LCONT_SAL)
                    setLoanId(response.data.item.LCONT_ID)
                    setLoanOtherCode(response.data.item.CODE)
                    setOtherDebt(response.data.item.LCONT_AMOUNT_SAL)
                    setLoanName(response.data.item.LSUB_NAME)
                    setName(response.data.item.NAME)
                    setLoanDescription(response.data.item.LSUB_NAME)
                } else {
                    setShowAlert(true)
                    setAlertMessage(response.data.message)
                    setOtherDebt(null)
                    setOtherNumber(null)
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
                    setShareNumberShshareNumberShow(MEM)
                    setAPI_URL(StoreAPI_URL)
                    setToken(token)
                    if (favoriteNumber !== undefined) {
                        setLoanType('otherLoan')

                        axios
                            .post(
                                `${StoreAPI_URL}/CheckLoanID`,
                                {
                                    MEM: favoriteShare,
                                    LCONT_ID: favoriteNumber,
                                },
                                {
                                    headers: {
                                        APP_KEY: APP_KEY,
                                        Authorization: `Bearer ${token}`,
                                    },
                                },
                            )
                            .then(async (response) => {
                                // console.log(response.data)
                                if (response.data.code === 10) {
                                    setOtherNumber(response.data.item.LCONT_SAL)
                                    setLoanId(response.data.item.LCONT_ID)
                                    setLoanOtherCode(response.data.item.CODE)
                                    setOtherDebt(response.data.item.LCONT_AMOUNT_SAL)
                                    setLoanName(response.data.item.LSUB_NAME)
                                    setName(response.data.item.NAME)
                                    setLoanDescription(response.data.item.LSUB_NAME)
                                    setIsLoading(false)
                                } else {
                                    setShowAlert(true)
                                    setAlertMessage(response.data.message)
                                    setOtherDebt(null)
                                    setOtherNumber(null)
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
                                `${StoreAPI_URL}/Loan`,
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
                                // console.log(response.data)
                                if (response.data !== undefined) {
                                    if (response.data.code === 10) {
                                        dispatch({ type: 'SET_LOAN_LIST', LOAN_LIST: response.data.item })

                                        setIsLoading(false)

                                        if (response.data.item.length > 0) {
                                            setOwnNumber(response.data.item[0].LCONT_SAL)
                                            setDebt(response.data.item[0].LCONT_AMOUNT_SAL)
                                            setLoanId(response.data.item[0].LCONT_ID)
                                            setLoanName(response.data.item[0].LSUB_NAME)
                                            setLoanCode(response.data.item[0].CODE)
                                            setName(response.data.item[0].NAME)
                                            setLoanDescription(response.data.item[0].LSUB_NAME)
                                        } else {
                                            setTextInputDisableHolder(false)
                                            setIsLoanEmpty(true)
                                        }

                                        try {
                                            await AsyncStorage.setItem('token', response.data.itemdetail,)
                                        } catch (err) {
                                            console.log(err)
                                        }
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
        setDestinationLoan('')
        setDestinationMem('')
        setOtherDebt(null)
    }, [loanType])

    useEffect(() => {
        if (destinationMem.length === 12 && destinationLoan.length === 14) {
            const accountNumber = removeDash(destinationMem)
            const accountType = getAccountType(accountNumber)

            if (accountType !== '01') {
                setShowAlert(true)
                setAlertMessage('เลขบัญชีหุ้นหรือเลขสัญญาไม่ถูกต้อง!')
                setOtherDebt(null)
                setOtherNumber(null)
            } else {
                getLoanDetail(destinationMem, destinationLoan)
            }
        }
    }, [destinationLoan, destinationMem])

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
                            <Text style={styles.labelText}>ชำระสินเชื่อ</Text>
                        </View>

                        <ScrollView style={{ padding: 10 }}>
                            <TouchableOpacity activeOpacity={1}>
                                <View style={styles.btnContainer}>
                                    <TouchableOpacity
                                        style={[loanType === 'ownLoan' ? styles.btnTabActive : styles.btnTab, { borderBottomLeftRadius: 30, borderTopLeftRadius: 30 }]}
                                        onPress={() => favoriteNumber === undefined && setLoanType('ownLoan')}
                                    >
                                        <Text style={loanType === 'ownLoan' ? styles.btnTabTextActive : styles.btnTabText}>สินเชื่อตัวเอง</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[loanType === 'otherLoan' ? styles.btnTabActive : styles.btnTab, { borderBottomRightRadius: 30, borderTopRightRadius: 30 }]}
                                        onPress={() => setLoanType('otherLoan')}
                                    >
                                        <Text style={loanType === 'otherLoan' ? styles.btnTabTextActive : styles.btnTabText}>สินเชื่อผู้อื่น</Text>
                                    </TouchableOpacity>
                                </View>

                                {
                                    loanType === 'ownLoan' ? (
                                        <View style={styles.formContainer}>
                                            <Text style={styles.titleText}> ไปยังสินเชื่อ</Text>

                                            {
                                                LOAN_LIST.length <= 0 ? (
                                                    <View style={styles.savingBox}>
                                                        <Text style={styles.savingText} numberOfLines={1}> ไม่พบหมายเลขสินเชื่อ</Text>
                                                    </View>
                                                ) : (
                                                    <TouchableOpacity style={styles.savingBox} onPress={() => setModalVisible(true)}>
                                                        <Text style={styles.savingText} numberOfLines={1}>{loanId} {loanName}</Text>
                                                        <AntDesign name='down' size={16} color='#aaa' />
                                                    </TouchableOpacity>
                                                )
                                            }

                                            <Text style={styles.titleText}>จำนวนเงิน</Text>

                                            <TextInput
                                                editable={textInputDisableHolder}
                                                style={[styles.input, styles.amountInput]}
                                                onChangeText={text => setOwnNumber(text)}
                                                value={ownNumber}
                                                placeholder='0.00'
                                                onBlur={onBlur}
                                                keyboardType='numeric'
                                            />

                                            {
                                                debt !== null && (
                                                    <Text style={styles.guideText}>หนี้คงเหลือ {debt} บาท</Text>
                                                )
                                            }
                                        </View>
                                    ) : (
                                        <View style={[styles.formContainer, { height: verticalScale(350) }]}>
                                            <Text style={styles.titleText}> ไปยังสินเชื่อ</Text>

                                            {
                                                favoriteNumber !== undefined && favoriteShare !== undefined ? (
                                                    <View>
                                                        <TextInputMask
                                                            editable={false}
                                                            type='custom'
                                                            placeholder='เลขบัญชีหุ้นปลายทาง'
                                                            keyboardType='numeric'
                                                            placeholderTextColor='#999'
                                                            options={{ mask: '999-99-99999' }}
                                                            value={favoriteShare}
                                                            style={styles.input}
                                                        />
                                                        <TextInputMask
                                                            editable={false}
                                                            type='custom'
                                                            placeholder='เลขที่สัญญาปลายทาง'
                                                            placeholderTextColor='#999'
                                                            options={{ mask: '*9-9999-999999' }}
                                                            value={favoriteNumber}
                                                            style={[styles.input, { marginTop: 10 }]}
                                                        />
                                                    </View>
                                                ) : (
                                                    <View>
                                                        <TextInputMask
                                                            autoFocus={true}
                                                            type='custom'
                                                            placeholder='เลขบัญชีหุ้นปลายทาง'
                                                            keyboardType='numeric'
                                                            placeholderTextColor='#999'
                                                            options={{ mask: '999-99-99999' }}
                                                            value={destinationMem}
                                                            onChangeText={text => setDestinationMem(text)}
                                                            style={styles.input}
                                                        />
                                                        <TextInputMask
                                                            type='custom'
                                                            placeholder='เลขที่สัญญาปลายทาง'
                                                            placeholderTextColor='#999'
                                                            options={{ mask: '*9-9999-999999' }}
                                                            value={destinationLoan}
                                                            onChangeText={text => setDestinationLoan(text)}
                                                            style={[styles.input, { marginTop: 10 }]}
                                                        />
                                                    </View>
                                                )
                                            }

                                            <Text style={[styles.titleText, { marginTop: scale(10) }]}>จำนวนเงิน</Text>

                                            <TouchableOpacity activeOpacity={1}>
                                                <TextInput
                                                    placeholder='0.00'
                                                    style={[styles.input, styles.amountInput]}
                                                    onChangeText={text => setOtherNumber(text)}
                                                    value={otherNumber}
                                                    onBlur={onBlur}
                                                    keyboardType='numeric'
                                                />
                                            </TouchableOpacity>

                                            {
                                                otherDebt !== null && (
                                                    <Text style={styles.guideText}>หนี้คงเหลือ {otherDebt} บาท</Text>
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
                        title="เลือกสินเชื่อ"
                    >
                        {
                            favoriteNumber === undefined && (
                                <ScrollView style={{ width: '100%' }}>
                                    {
                                        LOAN_LIST.length <= 0 ? (
                                            <TouchableOpacity style={styles.modalSavingList} onPress={() => setModalVisible(false)}>
                                                <Text style={styles.savingText}> ไม่พบหมายเลขสินเชื่อ</Text>
                                            </TouchableOpacity>
                                        ) : (
                                            LOAN_LIST.map((loan, index) => (
                                                <TouchableOpacity key={index} style={[styles.modalSavingList, { paddingVertical: 16 }]} onPress={() => selectLoan(loan)}>
                                                    <Text style={styles.savingText} numberOfLines={1}>{loan.LCONT_ID} {loan.LSUB_NAME}</Text>
                                                </TouchableOpacity>
                                            ))
                                        )
                                    }
                                </ScrollView>
                            )
                        }
                    </ActionSheet>

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
            </TouchableWithoutFeedback>
        )
    }
}

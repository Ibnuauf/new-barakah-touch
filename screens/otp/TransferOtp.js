import React, { useState, useEffect } from 'react'
import { View, Text, ImageBackground, TouchableOpacity, BackHandler, Platform, SafeAreaView } from 'react-native'
import axios from 'axios'
import { APP_KEY, LINE_ACCOUNT } from '../../environment'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { otpStyles } from '../../styles/otpStyles'
import { prettyTime } from '../../util'
import AppAlert from '../../components/AppAlert'
import moment from 'moment'
import { addScreenshotListener } from 'react-native-detector'
import OTPInput from '../../components/OTPInput'
import NumberKeyboard from '../../components/NumberKeyboard'

export default function TransferOtp({ route, navigation }) {
    const {
        PromptPayAccountNo,
        PromptPayAccountName,
        ToBankId,
        SenderName,
        SenderReference,
        Amount,
        memo,
        mgate_prev_inquiry_request
    } = route.params

    const [randomRef, setRandomRef] = useState(route.params.randomRef)

    const [apiKey, setApiKey] = useState(null)
    const [token, setToken] = useState(null)
    const [otp, setOtp] = useState('')
    const [time, setTime] = useState(180)
    const [interv, setInterv] = useState(null)
    const [showAlert, setShowAlert] = useState(false)
    const [alertMessage, setAlertMessage] = useState('')
    const [alertTitle, setAlertTitle] = useState(' ไม่สำเร็จ')
    const [alertType, setAlertType] = useState('normal')
    const [count, setCount] = useState(2)
    const [API_URL, setAPI_URL] = useState(null)
    const [currentTime, setCurrentTime] = useState('')
    const [fee, setFee] = useState(0)

    const redo = () => {
        navigation.reset({
            index: 0,
            routes: [{
                name: 'SendToBank',
                params: { previousScreen: 'TransactionMenu' }
            }]
        })
    }

    const onConfirmPressed = () => {
        setShowAlert(false)
        setAlertMessage('')

        if (alertType === 'authen') {
            navigation.reset({
                index: 0,
                routes: [{ name: 'PinInput' }]
            })
        } else if (alertType === 'block') {
            redo()
        }
    }

    const onKeyPress = (key) => {
        if (key === 'back') {
            setOtp(prev => prev.slice(0, -1))
            return
        }

        if (otp.length < 6) {
            setOtp(prev => prev + key)
        }
    }

    const verifyOTP = (pin) => {
        setShowAlert(true)

        axios
            .post(`${API_URL}/VerifyLineOTP`, {
                mgate_prev_inquiry_request: mgate_prev_inquiry_request,
                OTP_PIN: pin,
                OTP_EXPIRE: currentTime
            }, {
                headers: {
                    APP_KEY: APP_KEY,
                    Authorization: `Bearer ${token}`
                }
            })
            .then(async response => {
                // console.log(response.data)

                const { code, item, message } = response.data

                if (code === 10) {
                    //  สำเร็จ
                    navigation.reset({
                        index: 0,
                        routes: [{
                            name: 'SlipBank',
                            params: {
                                PromptPayAccountNo,
                                PromptPayAccountName,
                                ToBankId,
                                SenderName,
                                SenderReference,
                                Amount,
                                memo,
                                fee,
                                SLIP_NO: item.SLIP_NO,
                                CREATE_DATE: item.CREATE_DATE
                            }
                        }]
                    })
                } else if (code === 20) {
                    //  รหัส otp ผิด
                    if (count > 0) {
                        setAlertMessage(`รหัส OTP ไม่ถูกต้อง สามารถกรอกได้อีก ${count} ครั้ง!`)
                        setCount(count - 1)
                    } else {
                        clearInterval(interv)
                        setAlertType('block')
                        setAlertMessage('รหัส OTP ไม่ถูกต้องครบ 3 ครั้ง กรุณาทำรายการใหม่')
                        setCount(0)
                    }
                    setOtp('')
                } else if (code === 30) {
                    //  หมดเวลา
                    setAlertType('block')
                    setAlertMessage(message)
                } else if (code === 0) {
                    setAlertTitle('ระบบขัดข้อง')
                    setAlertMessage('กรุณาตรวจสอบการทำรายการ หากไม่สำเร็จกรุณาลองใหม่อีกครั้ง')
                    setAlertType('authen')
                } else {
                    setAlertMessage(message)
                }
            })
            .catch(err => {
                if (err.message === 'Network Error') {
                    setAlertType('authen')
                    setAlertMessage('กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่อีกครั้ง')
                } else if (err.message === 'Request failed with status code 401') {
                    setAlertType('authen')
                    setAlertMessage('คุณไม่ได้ทำรายการในเวลาที่กำหนด กรุณา Login อีกครั้ง')
                }
            })
    }

    const newOtp = () => {
        setShowAlert(true)

        axios
            .post(`${API_URL}/CIMB_Comfirm`, {
                API_KEY: apiKey,
                mgate_prev_inquiry_request: mgate_prev_inquiry_request
            }, {
                headers: {
                    APP_KEY: APP_KEY,
                    Authorization: `Bearer ${token}`,
                }
            })
            .then(async response => {
                // console.log(response.data)

                const { code, item, message, itemdetail } = response.data

                if (code === 10) {
                    setTime(180)
                    setRandomRef(item)
                    setShowAlert(false)

                    try {
                        await AsyncStorage.setItem('token', itemdetail)
                    } catch (error) {
                        console.log(error)
                    }
                } else {
                    setAlertMessage(message)
                }
            })
            .catch(err => {
                console.log({ err })
                if (err.message === 'Network Error') {
                    setAlertType('Authen')
                    setAlertMessage('ไม่สามารถทำรายการได้ กรุณาลองใหม่อีกครั้ง')
                } else if (err.message === 'Request failed with status code 401') {
                    setAlertType('Authen')
                    setAlertMessage('คุณไม่ได้ทำรายการในเวลาที่กำหนด กรุณา Login อีกครั้ง')
                }
            })
    }

    useEffect(() => {
        setTime(180)
        // setRandomRef(route.params.randomRef)

        const getCurrentTime = () => {
            const current = moment().format()
            const date = current.slice(0, 10)
            const time = current.slice(11, 19)
            setCurrentTime(date + ' ' + time)
        }

        getCurrentTime()
    }, [route])

    useEffect(() => {
        const getData = async () => {
            try {
                const fee = await AsyncStorage.getItem('Fee')
                const StoreAPI_URL = await AsyncStorage.getItem('StoreAPI_URL')
                const apiKey = await AsyncStorage.getItem('API_KEY')
                const token = await AsyncStorage.getItem('token')

                if (fee !== null) {
                    setFee(+fee)
                }

                if (StoreAPI_URL !== null && token !== null && apiKey !== null) {
                    setAPI_URL(StoreAPI_URL)
                    setApiKey(apiKey)
                    setToken(token)
                }
            } catch (err) {
                console.log(err)
            }
        }

        getData()
    }, [])

    useEffect(() => {
        if (otp.length === 6) {
            verifyOTP(otp)
        }
    }, [otp])

    useEffect(() => {
        const interval = setInterval(() => {
            if (time > 0) {
                setTime(prevTime => prevTime - 1)
            } else {
                setTime(0)
                clearInterval(interval)
            }

        }, 1000)
        setInterv(interval)

        return () => {
            clearInterval(interval)
        }
    }, [time])

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
        <ImageBackground source={require('../../assets/blue-wallpapers.jpg')} style={{ flex: 1 }} blurRadius={10}>
            <SafeAreaView style={otpStyles.container}>
                <View style={otpStyles.title}>
                    <Text style={otpStyles.largeTitle}>ใส่รหัส OTP 6 หลัก</Text>
                    <Text style={otpStyles.titleText}>OTP ส่งไปยัง {LINE_ACCOUNT}</Text>
                </View>

                {/* OTP Input */}
                <OTPInput value={otp} length={6} />

                <View style={[otpStyles.title, { marginTop: 20 }]}>
                    {
                        time > 0 ? (
                            <View>
                                <Text style={[otpStyles.titleText, otpStyles.refTitle]}>รหัสอ้างอิง: {randomRef} หมดอายุภายใน {prettyTime(time)} นาที</Text>
                                <TouchableOpacity onPress={() => newOtp()}>
                                    <Text style={[otpStyles.titleText, otpStyles.titleTextUnderline]}>ขอรหัส OTP ใหม่</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View>
                                <Text style={[otpStyles.titleText, otpStyles.refTitleTimeOut]}>รหัส OTP หมดอายุ กรุณาทำรายการใหม่อีกครั้ง</Text>
                                <TouchableOpacity onPress={async () => redo()}>
                                    <Text style={[otpStyles.titleText, otpStyles.titleTextUnderline]}>ทำรายการใหม่</Text>
                                </TouchableOpacity>
                            </View>
                        )
                    }
                </View>

                {/* Keyboard */}
                <NumberKeyboard onKeyPress={onKeyPress} />

                <AppAlert
                    visible={showAlert}
                    title={alertMessage === '' ? alertMessage : alertTitle}
                    message={alertMessage === '' ? 'Loading...' : alertMessage}
                    showConfirm={alertMessage !== ''}
                    showCancel={false}
                    onConfirm={onConfirmPressed}
                    onCancel={() => setShowAlert(false)}
                />
            </SafeAreaView>
        </ImageBackground>
    )
}

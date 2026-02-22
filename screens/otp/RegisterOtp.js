import React, { useState, useEffect } from 'react'
import { View, Text, ImageBackground, TouchableOpacity, BackHandler, Platform, SafeAreaView } from 'react-native'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import AppAlert from '../../components/AppAlert'
import DeviceInfo from 'react-native-device-info'
import { addScreenshotListener } from 'react-native-detector'
import { otpStyles } from '../../styles/otpStyles'
import { APP_KEY } from '../../environment'
import OTPInput from '../../components/OTPInput'
import NumberKeyboard from '../../components/NumberKeyboard'
import { prettyTime } from '../../util'

export default function RegisterOtp({ route, navigation }) {
    const [phoneNumber, setPhoneNumber] = useState(route.params.phoneNumber)
    const [pinId, setPinId] = useState(route.params.pinId)
    const [randomRef, setRandomRef] = useState(route.params.randomRef)

    const [apiKey, setApiKey] = useState(null)
    const [token, setToken] = useState(null)
    const [tokenOtp, setTokenOtp] = useState(null)
    const [otp, setOtp] = useState('')
    const [time, setTime] = useState(180)
    const [interv, setInterv] = useState(null)
    const [showAlert, setShowAlert] = useState(false)
    const [alertMessage, setAlertMessage] = useState('')
    const [alertType, setAlertType] = useState('normal')
    const [uniqueId, setUniqueId] = useState(null)
    const [brand, setBrand] = useState(null)
    const [model, setModel] = useState(null)
    const [count, setCount] = useState(2)
    const [API_URL, setAPI_URL] = useState(null)

    const redo = () => {
        setAlertType('normal')
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }]
        })
    }

    const onConfirmPressed = () => {
        setShowAlert(false)
        setAlertMessage('')

        if (alertType === 'authen') {
            setAlertType('normal')
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }]
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
            .post(`${API_URL}/VerifySmsOTPRegister`, {
                API_KEY: apiKey,
                pin: pin,
                pinId: pinId,
                DEVICE_UNIQUEID: uniqueId,
                DEVICE_BRAND: brand,
                DEVICE_MODEL: model
            }, {
                headers: {
                    APP_KEY: APP_KEY,
                    Authorization: `AppOTP ${tokenOtp}`
                }
            })
            .then(async response => {
                // console.log(response.data)

                if (response.data.verified === true) {
                    clearInterval(interv)

                    try {
                        await AsyncStorage.setItem('confirmShareNumber', apiKey)
                        await AsyncStorage.setItem('token', response.data.Token)
                    }
                    catch (err) {
                        console.log(err)
                    }

                    setTime(0)
                    setShowAlert(false)

                    setOtp('')
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'CreatePin' }]
                    })
                } else {
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

                setOtp('')
            })
    }

    const hidePhone = (phone) => {
        if (phone !== null)
            return '*** *** ' + phone.slice(6, 10)
        else
            return ''
    }

    const newOtp = () => {
        setShowAlert(true)
        axios
            .post(`${API_URL}/GetTelOTP`, {
                API_KEY: apiKey
            }, {
                headers: {
                    APP_KEY: APP_KEY,
                    Authorization: `Bearer ${token}`
                }
            })
            .then(response => {
                // console.log(response.data)
                if (response.data.code === 10) {
                    setTime(180)
                    setPhoneNumber(response.data.item.MOBILE_TEL)
                    setRandomRef(response.data.item.RANDOM)
                    setPinId(response.data.itemdOTP.pinId)
                    setToken(response.data.itemdetail.Token)
                    setTokenOtp(response.data.itemdetail.TokenOTP)

                    setShowAlert(false)
                } else {
                    setAlertMessage(response.data.message)
                }
            })
            .catch(err => {
                // console.error(err)
                if (err.message === 'Network Error') {
                    setAlertType('authen')
                    setAlertMessage('กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่อีกครั้ง')
                } else if (err.message === 'Request failed with status code 401') {
                    setAlertType('authen')
                    setAlertMessage('กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่อีกครั้ง')
                }
            })
    }

    useEffect(() => {
        setTime(180)
        setPhoneNumber(route.params.phoneNumber)
        setPinId(route.params.pinId)
        setRandomRef(route.params.randomRef)
    }, [route])

    useEffect(() => {
        const getData = async () => {
            try {
                const StoreAPI_URL = await AsyncStorage.getItem('StoreAPI_URL')
                const apiKey = await AsyncStorage.getItem('API_KEY')
                const token = await AsyncStorage.getItem('token')
                const tokenOtp = await AsyncStorage.getItem('tokenOTP')
                if (StoreAPI_URL !== null && token !== null && apiKey !== null && tokenOtp !== null) {
                    setAPI_URL(StoreAPI_URL)
                    setApiKey(apiKey)
                    setToken(token)
                    setTokenOtp(tokenOtp)
                }
            } catch (err) {
                console.log(err)
            }
        }

        const getDeviceInfo = () => {
            const brand = DeviceInfo.getBrand()
            const model = DeviceInfo.getModel()

            DeviceInfo.getUniqueId().then(uniqueId => {
                setUniqueId(uniqueId)
            })

            setBrand(brand)
            setModel(model)
        }

        getData()
        getDeviceInfo()
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
            "hardwareBackPress",
            backAction
        )

        return () => backHandler.remove()
    })

    return (
        <ImageBackground source={require('../../assets/blue-wallpapers.jpg')} style={{ flex: 1 }} blurRadius={10}>
            <SafeAreaView style={otpStyles.container}>
                <View style={otpStyles.title}>
                    <Text style={otpStyles.largeTitle}>ใส่รหัส OTP 6 หลัก</Text>
                    <Text style={otpStyles.titleText}>SMS ส่งไปยังเบอร์โทรศัพท์ {hidePhone(phoneNumber)}</Text>
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
                    title={alertMessage === '' ? alertMessage : ' ไม่สำเร็จ'}
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

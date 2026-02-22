/* 
  หน้า LoginScreen.js เป็นหน้าที่ใช้สำหรับให้ผู้ใช้เข้าสู่ระบบ
*/

import React, { useState, useEffect } from 'react'
import { TextInput, Text, View, TouchableOpacity, Keyboard, Platform } from 'react-native'
import axios from 'axios'
import { TextInputMask } from 'react-native-masked-text'
import AsyncStorage from '@react-native-async-storage/async-storage'
import AppAlert from '../components/AppAlert'
import DeviceInfo from 'react-native-device-info'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { APP_KEY, API_URL_TEST_DIRECT } from '../environment'
import { loginStyles } from '../styles/login'
import LoginLayout from '../components/layouts/LoginLayout'
import Button from '../components/Button'
import NetInfo from '@react-native-community/netinfo'
import { addScreenshotListener } from 'react-native-detector'

const LoginScreen = ({ route, navigation }) => {
    const [keyAuthen, setKeyAuthen] = useState(null)
    const [shareNumber, setShareNumber] = useState('')
    const [password, setPassword] = useState('')
    const [hidePassword, setHidePassword] = useState(true)
    const [showAlert, setShowAlert] = useState(false)
    const [alertMessage, setAlertMessage] = useState('')
    const [uniqueId, setUniqueId] = useState(null)
    const [brand, setBrand] = useState(null)
    const [model, setModel] = useState(null)
    const [API_URL, setAPI_URL] = useState(null)
    const [isConnect, setIsConnect] = useState(false)

    const memberForTest = '01-99999'

    const signIn = async () => {
        if (isConnect) {
            if (shareNumber.length < 12) {
                setShowAlert(true)
                setAlertMessage('กรุณากรอกหมายเลขบัญชีหุ้น 10 หลัก')
                setPassword('')
            } else if (password.length < 8) {
                setShowAlert(true)
                setAlertMessage('รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง!!')
                setPassword('')
            } else {
                let shareMem = shareNumber.substring(4, 12)

                if (shareMem === memberForTest) {
                    // ไปยัง api test ส่งเลขเครื่องไปด้วย

                    setShowAlert(true)
                    axios
                        .post(`${API_URL_TEST_DIRECT}/Login`, {
                            MEM: shareNumber,
                            PASSWORD: password,
                            DEVICE_UNIQUEID: uniqueId,
                            DEVICE_BRAND: brand,
                            DEVICE_MODEL: model
                        }, {
                            headers: {
                                APP_KEY: APP_KEY,
                                Authorization: `App ${keyAuthen}`
                            }
                        })
                        .then(async (response) => {
                            const shareNo = (response.data.itemdetail) !== null ? (response.data.itemdetail.Token).slice((response.data.itemdetail.Token).length - 12, (response.data.itemdetail.Token).length) : ''
                            //console.log(response.data)
                            if (response.data.code === 10) {
                                //  เข้าสู่ระบบสำเร็จ
                                try {
                                    await AsyncStorage.setItem('StoreAPI_URL', API_URL_TEST_DIRECT)
                                    await AsyncStorage.setItem('tokenOTP', response.data.itemdetail.TokenOTP)
                                    await AsyncStorage.setItem('token', response.data.itemdetail.Token)
                                    await AsyncStorage.setItem('API_KEY', response.data.itemdetail.API_KEY)
                                    await AsyncStorage.setItem('UserName', response.data.itemdetail.UserName)
                                    await AsyncStorage.setItem('shareNo', shareNo)
                                    await AsyncStorage.setItem('MEM', shareNo)
                                }
                                catch (err) {
                                    console.log(err)
                                }

                                if (shareMem === memberForTest) {
                                    await AsyncStorage.setItem('confirmShareNumber', response.data.itemdetail.API_KEY)
                                    navigation.reset({
                                        index: 0,
                                        routes: [{ name: 'PinInput' }]
                                    })
                                } else {
                                    navigation.reset({
                                        index: 0,
                                        routes: [
                                            {
                                                name: 'LoginOtp',
                                                params: {
                                                    phoneNumber: response.data.item.MOBILE_TEL,
                                                    randomRef: response.data.item.RANDOM,
                                                    pinId: response.data.itemdOTP.pinId,
                                                }
                                            }
                                        ]
                                    })
                                }
                            } else if (response.data.code === 20) {
                                //  ลงทะเบียนแล้ว แต่ยังไม่ได้กำหนด Pin
                                try {
                                    await AsyncStorage.setItem('StoreAPI_URL', API_URL_TEST_DIRECT)
                                    await AsyncStorage.setItem('tokenOTP', response.data.itemdetail.TokenOTP)
                                    await AsyncStorage.setItem('token', response.data.itemdetail.Token)
                                    await AsyncStorage.setItem('API_KEY', response.data.itemdetail.API_KEY)
                                }
                                catch (err) {
                                    console.log(err)
                                }

                                navigation.reset({
                                    index: 0,
                                    routes: [{ name: 'CreatePin' }]
                                })
                            } else {
                                setShowAlert(true)
                                setAlertMessage(response.data.message)
                                setPassword('')
                            }
                        })
                        .catch(err => {
                            if (err.message === 'Network Error') {
                                setShowAlert(true)
                                setAlertMessage('ไม่สามารถทำรายการได้ กรุณาลองใหม่อีกครั้ง')
                                setShareNumber('')
                                setPassword('')
                            }
                        })
                } else {
                    //ไปยัง api เครื่องจริง ไม่ต้องส่งเลขเครื่อง
                    setShowAlert(true)

                    axios
                        .post(`${API_URL}/Login`, {
                            MEM: shareNumber,
                            PASSWORD: password
                        }, {
                            headers: {
                                APP_KEY: APP_KEY,
                                Authorization: `App ${keyAuthen}`
                            }
                        })
                        .then(async (response) => {
                            const shareNo = (response.data.itemdetail) !== null ? (response.data.itemdetail.Token).slice((response.data.itemdetail.Token).length - 12, (response.data.itemdetail.Token).length) : ''

                            if (response.data.code === 10 || response.data.code === 20) {
                                //  เข้าสู่ระบบสำเร็จ
                                try {
                                    await AsyncStorage.setItem('tokenOTP', response.data.itemdetail.TokenOTP)
                                    await AsyncStorage.setItem('token', response.data.itemdetail.Token)
                                    await AsyncStorage.setItem('API_KEY', response.data.itemdetail.API_KEY)
                                    await AsyncStorage.setItem('UserName', response.data.itemdetail.UserName)
                                    await AsyncStorage.setItem('shareNo', shareNo)
                                    await AsyncStorage.setItem('MEM', shareNo)
                                }
                                catch (err) {
                                    console.log(err)
                                }

                                if (shareMem === memberForTest) {
                                    await AsyncStorage.setItem('confirmShareNumber', response.data.itemdetail.API_KEY)
                                    navigation.reset({
                                        index: 0,
                                        routes: [
                                            {
                                                name: 'PinInput'
                                            }
                                        ]
                                    })
                                } else {
                                    //  ไปยังหน้า LoginOtp พร้อมส่งค่า phoneNumber, randomRef, pinId
                                    navigation.reset({
                                        index: 0,
                                        routes: [
                                            {
                                                name: 'LoginOtp',
                                                params: {
                                                    phoneNumber: response.data.item.MOBILE_TEL,
                                                    randomRef: response.data.item.RANDOM,
                                                    pinId: response.data.itemdOTP.pinId,
                                                    code: response.data.code
                                                }
                                            }
                                        ]
                                    })
                                }
                            } else {
                                setShowAlert(true)
                                setAlertMessage(response.data.message)
                                setPassword('')
                            }
                        })
                        .catch(err => {
                            if (err.message === 'Network Error') {
                                setShowAlert(true)
                                setAlertMessage('ไม่สามารถทำรายการได้ กรุณาลองใหม่อีกครั้ง')
                                setShareNumber('')
                                setPassword('')
                            }
                        })
                }
            }
        } else {
            setShowAlert(true)
            setAlertMessage('กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตและลองใหม่อีกครั้ง')
            setShareNumber('')
            setPassword('')
        }
    }

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state) => {
            setIsConnect(state.isInternetReachable)
        })

        return () => {
            unsubscribe()
        }
    }, [isConnect])

    useEffect(() => {
        const getKey_Authen = async () => {
            try {
                const StoreAPI_URL = await AsyncStorage.getItem('StoreAPI_URL')
                const keyAuthen = await AsyncStorage.getItem('KEY_AUTHEN')
                if (keyAuthen !== null) {
                    setKeyAuthen(keyAuthen)
                }
                if (StoreAPI_URL !== null) {
                    setAPI_URL(StoreAPI_URL)
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

        getKey_Authen()
        getDeviceInfo()
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
        <LoginLayout onPress={() => Keyboard.dismiss()}>
            <Text style={loginStyles.title}>เข้าสู่ระบบ</Text>

            <View style={loginStyles.inputView} >
                <TextInputMask
                    type={'custom'}
                    placeholder='เลขบัญชีหุ้น 10 หลัก'
                    keyboardType='numeric'
                    placeholderTextColor='#003f5c'
                    options={{
                        mask: '999-99-99999'
                    }}
                    value={shareNumber}
                    onChangeText={text => {
                        setShareNumber(text)
                    }}
                    style={loginStyles.inputText}
                />
            </View>

            <View style={loginStyles.inputView} >
                <TextInput
                    style={loginStyles.inputText}
                    secureTextEntry={hidePassword}
                    placeholder="รหัสผ่าน"
                    value={password}
                    placeholderTextColor="#003f5c"
                    onChangeText={text => setPassword(text)}
                />
                <TouchableOpacity style={loginStyles.eye} onPress={() => setHidePassword(!hidePassword)}>
                    {
                        hidePassword ? (
                            <Ionicons name="eye-off-outline" size={20} color="#0047AB" />
                        ) : (
                            <Ionicons name="eye-outline" size={20} color="#0047AB" />
                        )
                    }
                </TouchableOpacity>
            </View>

            <Button title='เข้าสู่ระบบ' onPress={signIn} />

            <TouchableOpacity onPress={() => navigation.navigate('ForgetPassword', { initialRoute: route.name })}>
                <Text style={loginStyles.forgot}>ลืมรหัสผ่าน?</Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', top: 30 }}>
                <Text style={loginStyles.registerBtn}>สมาชิกใหม่?</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                    <Text style={[loginStyles.registerBtn, { marginLeft: 5, textDecorationLine: 'underline' }]}>ลงทะเบียนออนไลน์</Text>
                </TouchableOpacity>
            </View>

            <AppAlert
                visible={showAlert}
                title={alertMessage === '' ? alertMessage : ' ไม่สำเร็จ'}
                message={alertMessage === '' ? 'Loading...' : alertMessage}
                showConfirm={alertMessage !== ''}
                showCancel={false}
                onConfirm={() => {
                    setShowAlert(false)
                    setAlertMessage('')
                }}
                onCancel={() => setShowAlert(false)}
            />
        </LoginLayout>
    )
}

export default LoginScreen
/* 
  หน้า CreatePasswordScreen.js เป็นหน้าที่ใช้สำหรับให้ผู้ใช้กำหนดรหัสผ่าน
*/

//  import ไลบรารี่
import React, { useState, useEffect } from 'react'
import { TextInput, Text, View, BackHandler, Keyboard, TouchableOpacity, Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import AppAlert from '../components/AppAlert'
import DeviceInfo from 'react-native-device-info'
import axios from 'axios'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { addScreenshotListener } from 'react-native-detector'
import { APP_KEY } from '../environment'

import { loginStyles } from '../styles/login'
import LoginLayout from '../components/layouts/LoginLayout'
import Button from '../components/Button'


const CreatePasswordScreen = ({ route, navigation }) => {
    //  ค่า MEM ที่รับมาจากหน้า Register
    const { MEM } = route.params

    //  ส่วนของการประกาศตัวแปรเริ่มต้น
    const [apiKey, setApiKey] = useState('')
    const [password, setPassword] = useState(null)
    const [hidePassword, setHidePassword] = useState(true)
    const [confirmPassword, setConfirmPassword] = useState(null)
    const [hideConfirmPassword, setHideConfirmPassword] = useState(true)
    const [token, setToken] = useState(null)
    const [showAlert, setShowAlert] = useState(false)
    const [alertMessage, setAlertMessage] = useState('')
    const [alertType, setAlertType] = useState('normal')
    const [uniqueId, setUniqueId] = useState(null)
    const [brand, setBrand] = useState(null)
    const [model, setModel] = useState(null)
    const [API_URL, setAPI_URL] = useState(null)

    //  ฟังก์ชันนี้ทำงานเมื่อกดปุ่ม "ยืนยัน"
    const createPass = () => {
        setShowAlert(true)

        if (!password) {
            setAlertMessage('กรุณากรอกรหัสผ่าน')
        } else {
            if (password !== confirmPassword) {
                setAlertMessage('รหัสผ่านไม่ตรงกัน')
                setPassword(null)
                setConfirmPassword(null)
            } else {
                // console.log(apiKey, password)
                axios
                    .post(
                        `${API_URL}/Account`,
                        {
                            API_KEY: apiKey,
                            PASSWORD: password,
                            DEVICE_UNIQUEID: uniqueId,
                            DEVICE_BRAND: brand,
                            DEVICE_MODEL: model,
                        },
                        {
                            headers: {
                                APP_KEY: APP_KEY,
                                Authorization: `Bearer ${token}`,
                            },
                        },
                    )
                    .then(async response => {
                        const shareNo = (response.data.itemdetail) !== null ? (response.data.itemdetail.Token).slice((response.data.itemdetail.Token).length - 12, (response.data.itemdetail.Token).length) : ''
                        // console.log(response.data)
                        if (response.data.code === 10) {
                            //  เก็บค่า tokenOTP, token, UserName ใน AsyncStorage
                            try {
                                await AsyncStorage.setItem('token', response.data.itemdetail.Token,)
                                await AsyncStorage.setItem('tokenOTP', response.data.itemdetail.TokenOTP,)
                                await AsyncStorage.setItem('UserName', response.data.itemdetail.UserName,)
                                await AsyncStorage.setItem('shareNo', shareNo)
                                await AsyncStorage.setItem('MEM', shareNo)

                                //  ไปยังหน้า RegisterOtp พร้อมส่งค่า phoneNumber, randomRef, pinId, MEM
                                navigation.reset({
                                    index: 0,
                                    routes: [
                                        {
                                            name: 'RegisterOtp',
                                            params: {
                                                phoneNumber: response.data.item.MOBILE_TEL,
                                                randomRef: response.data.item.RANDOM,
                                                pinId: response.data.itemdOTP.pinId,
                                                MEM: MEM,
                                            }
                                        }
                                    ]
                                })
                            } catch (err) {
                                console.log(err)
                            }

                            setShowAlert(false)
                            setAlertMessage('')
                        } else {
                            setAlertMessage(response.data.message)
                        }
                    })
                    .catch(err => {
                        if (err.message === 'Network Error') {
                            setAlertMessage(
                                'กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่อีกครั้ง',
                            )
                            setAlertType('Authen')
                        } else if (err.message === 'Request failed with status code 401') {
                            setAlertMessage(
                                'คุณไม่ได้ทำรายการในเวลาที่กำหนด กรุณา Login อีกครั้ง',
                            )
                            setAlertType('Authen')
                        }
                    })

                setPassword(null)
                setConfirmPassword(null)
            }
        }
    }

    //  ฟังก์ชันนี้ทำงานเมื่อผู้ใช้กดตกลงใน alert
    const onConfirmPressed = () => {
        setShowAlert(false)
        setAlertMessage('')

        if (alertType === 'Authen') {
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }]
            })
        }
    }

    //  useEffect จะเป็นส่วนที่ทำงานครั้งแรกเมื่อโหลดหน้า CreatePasswordScreen.js ขึ้นมา
    useEffect(() => {
        //  รับค่าข้อมูลเครื่อง (brand, uniqueId, model) โดยใช้ไลบรารี่ DeviceInfo
        const getDeviceInfo = () => {
            const brand = DeviceInfo.getBrand()
            const model = DeviceInfo.getModel()

            DeviceInfo.getUniqueId().then(uniqueId => {
                setUniqueId(uniqueId)
            })

            setBrand(brand)
            setModel(model)
        }

        //  ดึงค่า token, apiKey จาก AsyncStorage
        const getToken = async () => {
            try {
                const StoreAPI_URL = await AsyncStorage.getItem('StoreAPI_URL')
                const token = await AsyncStorage.getItem('token')
                const apiKey = await AsyncStorage.getItem('API_KEY')
                if (StoreAPI_URL !== null && token !== null && apiKey !== null) {
                    setAPI_URL(StoreAPI_URL)
                    setApiKey(apiKey)
                    setToken(token)
                }
            } catch (err) {
                console.log(err)
            }
        }

        getDeviceInfo()
        getToken()
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

    //  useEffect อันนี้ทำหน้าที่ block ปุ่ม back
    useEffect(() => {
        const backAction = () => {
            return true
        }

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction,
        )

        return () => backHandler.remove()
    })

    //  return คือส่วนของการแสดงผลของหน้านี้
    return (
        <LoginLayout onPress={() => Keyboard.dismiss()}>
            <Text style={loginStyles.title}>สร้างรหัสผ่าน</Text>

            <View style={loginStyles.inputView}>
                <TextInput
                    value={password}
                    style={loginStyles.inputText}
                    secureTextEntry={hidePassword}
                    placeholder="รหัสผ่าน..."
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

            <View style={loginStyles.inputView}>
                <TextInput
                    value={confirmPassword}
                    style={loginStyles.inputText}
                    secureTextEntry={hideConfirmPassword}
                    placeholder="ยืนยันรหัสผ่าน..."
                    placeholderTextColor="#003f5c"
                    onChangeText={text => setConfirmPassword(text)}
                />
                <TouchableOpacity style={loginStyles.eye} onPress={() => setHideConfirmPassword(!hideConfirmPassword)}>
                    {
                        hideConfirmPassword ? (
                            <Ionicons name="eye-off-outline" size={20} color="#0047AB" />
                        ) : (
                            <Ionicons name="eye-outline" size={20} color="#0047AB" />
                        )
                    }
                </TouchableOpacity>
            </View>

            {/* เมื่อกดปุ่ม "ยืนยัน" จะเรียกใช้ฟังก์ชัน createPass() */}
            <Button title="ยืนยัน" onPress={createPass} />

            <AppAlert
                visible={showAlert}
                title={alertMessage === '' ? alertMessage : ' ไม่สำเร็จ'}
                message={alertMessage === '' ? 'Loading...' : alertMessage}
                showConfirm={alertMessage !== ''}
                showCancel={false}
                onConfirm={onConfirmPressed}
                onCancel={() => setShowAlert(false)}
            />
        </LoginLayout>
    )
}

export default CreatePasswordScreen

import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, Keyboard, Platform } from 'react-native'
import LoginLayout from '../components/layouts/LoginLayout'
import { loginStyles } from '../styles/login'
import { TextInputMask } from 'react-native-masked-text'
import Button from '../components/Button'
import AppAlert from '../components/AppAlert'
import { APP_KEY } from '../environment'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import DeviceInfo from 'react-native-device-info'
import NetInfo from '@react-native-community/netinfo'
import { addScreenshotListener } from 'react-native-detector'

export default function ForgetPassword({ route, navigation }) {
    const [keyAuthen, setKeyAuthen] = useState(null)
    const [shareNumber, setShareNumber] = useState(null)
    const [showAlert, setShowAlert] = useState(false)
    const [alertMessage, setAlertMessage] = useState('')
    const [alertType, setAlertType] = useState('normal')
    const [uniqueId, setUniqueId] = useState(null)
    const [brand, setBrand] = useState(null)
    const [model, setModel] = useState(null)
    const [API_URL, setAPI_URL] = useState(null)
    const [isConnect, setIsConnect] = useState(false)

    const confirmShareMem = () => {
        setShareNumber(null)
        setShowAlert(true)

        if (isConnect) {
            if (shareNumber?.length === 12) {
                axios
                    .post(`${API_URL}/GetShrMem`, {
                        MEM: shareNumber,
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
                        // console.log(response.data)
                        if (response.data.code === 10) {
                            try {
                                await AsyncStorage.setItem('token', response.data.item.Token)
                                await AsyncStorage.setItem('API_KEY', response.data.item.API_KEY)
                                await AsyncStorage.setItem('UserName', response.data.item.UserName)

                                navigation.navigate('RequestOtp', {
                                    initialRoute: route.name,
                                    phoneNumber: response.data.item.MOBILE_TEL
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
                            setAlertMessage('ไม่สามารถทำรายการได้ กรุณาลองใหม่อีกครั้ง')
                            setAlertType('Authen')
                        }
                    })
            } else {
                setAlertMessage('กรุณากรอกหมายเลขหุ้น')
            }
        } else {
            setAlertMessage('กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วและใหม่อีกครั้ง')
            setAlertType('Authen')
        }
    }

    const onConfirmPressed = () => {
        setShowAlert(false)
        setAlertMessage('')

        if (alertType === 'Authen') {
            setAlertType('normal')
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }]
            })
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
        const getData = async () => {
            try {
                const StoreAPI_URL = await AsyncStorage.getItem('StoreAPI_URL')
                const keyAuthen = await AsyncStorage.getItem('KEY_AUTHEN')
                const brand = DeviceInfo.getBrand()
                const model = DeviceInfo.getModel()

                DeviceInfo.getUniqueId().then(uniqueId => {
                    setUniqueId(uniqueId)
                })

                if (keyAuthen !== null) {
                    setKeyAuthen(keyAuthen)
                }

                if (StoreAPI_URL !== null) {
                    setAPI_URL(StoreAPI_URL)
                }

                setBrand(brand)
                setModel(model)
            } catch (err) {
                console.log((err))
            }
        }

        getData()
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
            <TouchableOpacity style={loginStyles.closeIcon} onPress={() => navigation.goBack()}>
                <MaterialIcons name='close' size={36} color='#0047AB' />
            </TouchableOpacity>

            <Text style={loginStyles.largeTitle}>ตั้งค่า รหัสผ่านใหม่</Text>

            <View style={loginStyles.inputView} >
                <TextInputMask
                    type={'custom'}
                    placeholder='เลขบัญชีหุ้น 10 หลัก'
                    keyboardType='numeric'
                    placeholderTextColor='#003f5c'
                    options={{ mask: '999-99-99999' }}
                    value={shareNumber}
                    onChangeText={text => setShareNumber(text)}
                    style={loginStyles.inputText}
                />
            </View>

            <Button title='ถัดไป' onPress={confirmShareMem} />

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

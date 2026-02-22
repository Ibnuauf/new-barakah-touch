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
import NetInfo from '@react-native-community/netinfo'
import { addScreenshotListener } from 'react-native-detector'

export default function ForgetPin({ route, navigation }) {
    const [keyAuthen, setKeyAuthen] = useState(null)
    const [shareNumber, setShareNumber] = useState(null)
    const [showAlert, setShowAlert] = useState(false)
    const [alertMessage, setAlertMessage] = useState('')
    const [alertType, setAlertType] = useState('normal')
    const [API_URL, setAPI_URL] = useState(null)
    const [isConnect, setIsConnect] = useState(false)

    const onConfirmPressed = () => {
        setShowAlert(false)
        setAlertMessage('')

        if (alertType === 'authen') {
            setAlertType('normal')
            navigation.reset({
                index: 0,
                routes: [{ name: 'PinInput' }]
            })
        }
    }

    const confirmShareMem = () => {
        setShowAlert(true)

        if (shareNumber?.length === 12) {
            setShareNumber(null)

            if (isConnect) {
                axios
                    .post(`${API_URL}/GetShrMem`, {
                        MEM: shareNumber,
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

                                navigation.navigate('RequestOtp', {
                                    initialRoute: route.name,
                                    phoneNumber: response.data.item.MOBILE_TEL
                                })
                            } catch (err) {
                                console.log(err)
                            }

                            setShowAlert(false)
                        } else {
                            setAlertMessage(response.data.message)
                        }
                    })
                    .catch(err => {
                        if (err.message === 'Network Error') {
                            setAlertType('authen')
                            setAlertMessage('ไม่สามารถทำรายการได้ กรุณาลองใหม่อีกครั้ง')
                        }
                    })
            } else {
                setAlertType('authen')
                setAlertMessage('กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วและใหม่อีกครั้ง')
            }
        } else {
            setAlertMessage('กรุณากรอกหมายเลขหุ้น')
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

        getKey_Authen()
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

            <Text style={loginStyles.largeTitle}>ตั้งค่า PIN ผ่านใหม่</Text>

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

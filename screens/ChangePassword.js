import React, { useState, useEffect } from 'react'
import {
    TextInput,
    Text,
    View,
    TouchableOpacity,
    Keyboard,
    Platform
} from 'react-native'
import { loginStyles } from '../styles/login'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import { APP_KEY } from '../environment'
import AppAlert from '../components/AppAlert'
import LoginLayout from '../components/layouts/LoginLayout'
import Button from '../components/Button'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { addScreenshotListener } from 'react-native-detector'

export default function ChangePassword({ route, navigation }) {
    const [apiKey, setApiKey] = useState('')
    const [currentPassword, setCurrentPassword] = useState(null)
    const [hideCurrentPassword, setHideCurrentPassword] = useState(true)
    const [newPassword, setNewPassword] = useState(null)
    const [hideNewPassword, setHideNewPassword] = useState(true)
    const [confirmNewPassword, setConfirmNewPassword] = useState(null)
    const [hideConfirmNewPassword, setHideConfirmNewPassword] = useState(true)
    const [token, setToken] = useState(null)
    const [showAlert, setShowAlert] = useState(false)
    const [alertMessage, setAlertMessage] = useState('')
    const [alertType, setAlertType] = useState('normal')
    const [API_URL, setAPI_URL] = useState(null)

    const onConfirmPressed = () => {
        setAlertMessage('')
        setShowAlert(false)

        if (alertType === 'authen') {
            navigation.reset({
                index: 0,
                routes: [{ name: 'PinInput' }]
            })
        } else if (alertType === 'success') {
            navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }]
            })
        }
    }

    const createPass = () => {
        setShowAlert(true)

        if (!currentPassword && !newPassword && !confirmNewPassword) {
            setAlertMessage('กรุณากรอกรหัสผ่านให้ครบทุกช่อง')
        } else {
            if (newPassword !== confirmNewPassword) {
                setAlertMessage('รหัสผ่านใหม่ไม่ตรงกัน')
            } else {
                // console.log(apiKey, currentPassword, newPassword, confirmNewPassword)
                axios
                    .post(`${API_URL}/EditPassword`, {
                        API_KEY: apiKey,
                        PASSWORD: confirmNewPassword,
                        OLD_PASSWORD: currentPassword
                    }, {
                        headers: {
                            APP_KEY: APP_KEY,
                            Authorization: `Bearer ${token}`
                        }
                    })
                    .then(async response => {
                        // console.log(response.data)
                        if (response.data.code === 10) {
                            try {
                                await AsyncStorage.setItem('token', response.data.item)
                                setAlertType('success')
                                setAlertMessage(response.data.message)
                            } catch (err) {
                                console.log(err)
                            }
                        } else {
                            setAlertMessage(response.data.message)
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
        }
        setCurrentPassword(null)
        setNewPassword(null)
        setConfirmNewPassword(null)
    }

    useEffect(() => {
        const getToken = async () => {
            try {
                const StoreAPI_URL = await AsyncStorage.getItem('StoreAPI_URL')
                const value = await AsyncStorage.getItem('token')
                if (StoreAPI_URL !== null && value !== null) {
                    setAPI_URL(StoreAPI_URL)
                    setToken(value)
                }
            } catch (err) {
                console.log(err)
            }
        }

        const getApiKey = async () => {
            try {
                const apiKey = await AsyncStorage.getItem('confirmShareNumber')
                if (apiKey !== null) {
                    setApiKey(apiKey)
                }
            } catch (err) {
                console.log(err)
            }
        }

        getToken()
        getApiKey()
    }, [route])

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

            <Text style={loginStyles.title}>เปลี่ยนรหัสผ่าน</Text>

            <View style={loginStyles.inputView} >
                <TextInput
                    value={currentPassword}
                    style={loginStyles.inputText}
                    secureTextEntry={hideCurrentPassword}
                    placeholder='รหัสผ่านปัจจุบัน'
                    placeholderTextColor='#003f5c'
                    onChangeText={text => setCurrentPassword(text)}
                />
                <TouchableOpacity style={loginStyles.eye} onPress={() => setHideCurrentPassword(!hideCurrentPassword)}>
                    {
                        hideCurrentPassword ? (
                            <Ionicons name='eye-off-outline' size={20} color='#0047AB' />
                        ) : (
                            <Ionicons name='eye-outline' size={20} color='#0047AB' />
                        )
                    }
                </TouchableOpacity>
            </View>

            <View style={loginStyles.inputView} >
                <TextInput
                    value={newPassword}
                    style={loginStyles.inputText}
                    secureTextEntry={hideNewPassword}
                    placeholder='รหัสผ่านใหม่'
                    placeholderTextColor='#003f5c'
                    onChangeText={text => setNewPassword(text)}
                />
                <TouchableOpacity style={loginStyles.eye} onPress={() => setHideNewPassword(!hideNewPassword)}>
                    {
                        hideNewPassword ? (
                            <Ionicons name='eye-off-outline' size={20} color='#0047AB' />
                        ) : (
                            <Ionicons name='eye-outline' size={20} color='#0047AB' />
                        )
                    }
                </TouchableOpacity>
            </View>

            <View style={loginStyles.inputView} >
                <TextInput
                    value={confirmNewPassword}
                    style={loginStyles.inputText}
                    secureTextEntry={hideConfirmNewPassword}
                    placeholder='ยืนยันรหัสผ่านใหม่อีกครั้ง'
                    placeholderTextColor='#003f5c'
                    onChangeText={text => setConfirmNewPassword(text)}
                />
                <TouchableOpacity style={loginStyles.eye} onPress={() => setHideConfirmNewPassword(!hideConfirmNewPassword)}>
                    {
                        hideConfirmNewPassword ? (
                            <Ionicons name='eye-off-outline' size={20} color='#0047AB' />
                        ) : (
                            <Ionicons name='eye-outline' size={20} color='#0047AB' />
                        )
                    }
                </TouchableOpacity>
            </View>

            <Button title='ยืนยัน' onPress={createPass} />

            <AppAlert
                visible={showAlert}
                title={alertMessage === '' ? alertMessage : alertType === 'success' ? 'สำเร็จ' : ' ไม่สำเร็จ'}
                message={alertMessage === '' ? 'Loading...' : alertMessage}
                showConfirm={alertMessage !== ''}
                confirmButtonColor={alertType === 'success' ? '#5cb85c' : '#DD6B55'}
                showCancel={false}
                onConfirm={onConfirmPressed}
                onCancel={() => setShowAlert(false)}
            />
        </LoginLayout>
    )
}

import React, { useState, useEffect } from 'react'
import {
    TextInput,
    Text,
    View,
    BackHandler,
    Keyboard,
    TouchableOpacity,
    Platform
} from 'react-native'
import { loginStyles } from '../styles/login'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import { APP_KEY } from '../environment'
import AppAlert from '../components/AppAlert'
import LoginLayout from '../components/layouts/LoginLayout'
import Button from '../components/Button'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { addScreenshotListener } from 'react-native-detector'

const EditPassword = ({ navigation }) => {
    const [apiKey, setApiKey] = useState('')
    const [password, setPassword] = useState(null)
    const [hidePassword, setHidePassword] = useState(true)
    const [confirmPassword, setConfirmPassword] = useState(null)
    const [hideConfirmPassword, setHideConfirmPassword] = useState(true)
    const [token, setToken] = useState(null)
    const [showAlertToken, setShowAlertToken] = useState(false)
    const [showAlert, setShowAlert] = useState(false)
    const [alertMessage, setAlertMessage] = useState('')
    const [showAlertSuccess, setShowAlertSuccess] = useState(false)
    const [API_URL, setAPI_URL] = useState(null)

    const createPass = () => {
        if (!password) {
            setShowAlert(true)
            setAlertMessage('กรุณากรอกรหัสผ่าน')
        } else {
            if (password !== confirmPassword) {
                setShowAlert(true)
                setAlertMessage('รหัสผ่านไม่ตรงกัน')
                setPassword(null)
                setConfirmPassword(null)
            } else {
                axios
                    .post(`${API_URL}/EditPassword`, {
                        API_KEY: apiKey,
                        PASSWORD: password
                    }, {
                        headers: {
                            APP_KEY: APP_KEY,
                            Authorization: `Bearer ${token}`
                        }
                    })
                    .then(async response => {
                        // console.log(response.data)
                        const shareNo = (response.data.item) !== null ? (response.data.item).slice((response.data.item).length - 12, (response.data.item).length) : ''

                        if (response.data.code === 10) {
                            try {
                                await AsyncStorage.setItem('token', response.data.item)
                                await AsyncStorage.setItem('shareNo', shareNo)
                                await AsyncStorage.setItem('MEM', shareNo)
                                setShowAlertSuccess(true)
                                setAlertMessage(response.data.message)
                            } catch (err) {
                                console.log(err)
                            }
                        }
                    })
                    .catch(err => {
                        if (err.message === 'Network Error') {
                            setShowAlertToken(true)
                            setAlertMessage('กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่อีกครั้ง')
                        } else if (err.message === 'Request failed with status code 401') {
                            setShowAlertToken(true)
                            setAlertMessage('คุณไม่ได้ทำรายการในเวลาที่กำหนด กรุณา Login อีกครั้ง')
                        }
                    })

                setPassword(null)
                setConfirmPassword(null)
            }
        }
    }

    useEffect(() => {
        const getToken = async () => {
            try {
                const StoreAPI_URL = await AsyncStorage.getItem('StoreAPI_URL')
                const apiKey = await AsyncStorage.getItem('API_KEY')
                const token = await AsyncStorage.getItem('token')
                if (StoreAPI_URL !== null && token !== null && apiKey !== null) {
                    setAPI_URL(StoreAPI_URL)
                    setToken(token)
                    setApiKey(apiKey)
                }
            } catch (err) {
                console.log(err)
            }
        }

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
        <LoginLayout onPress={() => Keyboard.dismiss()}>
            <Text style={loginStyles.title}>สร้างรหัสผ่าน</Text>

            <View style={loginStyles.inputView} >
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

            <View style={loginStyles.inputView} >
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

            <Button title='ยืนยัน' onPress={createPass} />

            <AppAlert
                visible={showAlert}
                title={' ไม่สำเร็จ'}
                message={alertMessage}
                showConfirm={alertMessage !== ''}
                showCancel={false}
                onConfirm={() => setShowAlert(false)}
                onCancel={() => setShowAlert(false)}
            />

            <AppAlert
                visible={showAlertToken}
                title={' ไม่สำเร็จ'}
                message={alertMessage}
                showConfirm={alertMessage !== ''}
                showCancel={false}
                onConfirm={() => {
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'Login' }]
                    })
                }}
                onCancel={() => setShowAlertToken(false)}
            />

            <AppAlert
                visible={showAlertSuccess}
                title={'สำเร็จ'}
                message={alertMessage}
                showConfirm={alertMessage !== ''}
                confirmButtonColor='#5cb85c'
                showCancel={false}
                onConfirm={() => {
                    navigation.navigate('CreatePin')
                    setShowAlertSuccess(false)
                }}
                onCancel={() => setShowAlertSuccess(false)}
            />
        </LoginLayout>
    )
}

export default EditPassword
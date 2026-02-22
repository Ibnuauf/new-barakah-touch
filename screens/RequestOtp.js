import React, { useState, useEffect } from 'react'
import { Text, TouchableOpacity, Platform } from 'react-native'
import LoginLayout from '../components/layouts/LoginLayout'
import axios from 'axios'
import { APP_KEY } from '../environment'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { scale, ScaledSheet } from 'react-native-size-matters'
import AppAlert from '../components/AppAlert'
import Button from '../components/Button'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import { addScreenshotListener } from 'react-native-detector'

export default function RequestOtp({ route, navigation }) {
    const { initialRoute, phoneNumber } = route.params
    const [token, setToken] = useState(null)
    const [apiKey, setApiKey] = useState('')
    const [showAlert, setShowAlert] = useState(false)
    const [alertMessage, setAlertMessage] = useState('')
    const [API_URL, setAPI_URL] = useState(null)

    const hidePhone = (phone) => {
        if (phone !== null)
            return '*** *** ' + phone.slice(6, 10)
        else
            return ''
    }

    const getOtp = () => {
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
            .then(async (response) => {
                // console.log(response.data)
                if (response.data.code === 10) {
                    try {
                        await AsyncStorage.setItem('tokenOTP', response.data.itemdetail.TokenOTP)
                        await AsyncStorage.setItem('token', response.data.itemdetail.Token)

                        if (initialRoute === 'ForgetPin') {
                            navigation.navigate('ForgetPinOtp', {
                                phoneNumber: response.data.item.MOBILE_TEL,
                                randomRef: response.data.item.RANDOM,
                                pinId: response.data.itemdOTP.pinId,
                            })
                        } else if (initialRoute === 'ForgetPassword') {
                            navigation.navigate('ForgetPasswordOtp', {
                                phoneNumber: response.data.item.MOBILE_TEL,
                                randomRef: response.data.item.RANDOM,
                                pinId: response.data.itemdOTP.pinId,
                            })
                        }
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
                // console.error(err)
                if (err.message === 'Network Error') {
                    setAlertMessage('กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่อีกครั้ง')
                } else if (err.message === 'Request failed with status code 401') {
                    setAlertMessage('คุณไม่ได้ทำรายการในเวลาที่กำหนด กรุณา Login อีกครั้ง')
                }
            })
    }

    const close = () => {
        if (initialRoute === 'ForgetPin') {
            navigation.reset({
                index: 0,
                routes: [{ name: 'PinInput' }]
            })
        } else {
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }]
            })
        }
    }

    const onConfirmPressed = () => {
        setShowAlert(false)
        setAlertMessage('')

        if (initialRoute === 'ForgetPin') {
            navigation.reset({
                index: 0,
                routes: [{ name: 'PinInput' }]
            })
        } else if (initialRoute === 'ForgetPassword') {
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }]
            })
        }
    }

    useEffect(() => {
        const getApiKey = async () => {
            try {
                const StoreAPI_URL = await AsyncStorage.getItem('StoreAPI_URL')
                const apiKey = await AsyncStorage.getItem('API_KEY')
                if (StoreAPI_URL !== null && apiKey !== null) {
                    setAPI_URL(StoreAPI_URL)
                    setApiKey(apiKey)
                }
            } catch (err) {
                console.log(err)
            }
        }

        const getToken = async () => {
            try {
                const value = await AsyncStorage.getItem('token')
                if (value !== null) {
                    setToken(value)
                }
            } catch (err) {
                console.log(err)
            }
        }

        getApiKey()
        getToken()
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
        <LoginLayout>
            <TouchableOpacity style={styles.closeIcon} onPress={() => close()}>
                <MaterialIcons name='close' size={36} color='#0047AB' />
            </TouchableOpacity>

            <Text style={styles.largeTitle}>ยืนยันตัวตน</Text>
            <Text style={styles.titleText}>ระบบจะส่งรหัส OTP ไปยังเบอร์โทรศัพท์</Text>
            <Text style={[styles.titleText, { marginBottom: scale(20) }]}>{hidePhone(phoneNumber)}</Text>

            <Button title='ตกลง' onPress={() => getOtp()} />

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

const styles = ScaledSheet.create({
    titleText: {
        fontFamily: 'Sarabun-Regular',
        fontSize: '14@s',
        color: '#0047AB',
        width: '100%',
        textAlign: 'center'
    },
    largeTitle: {
        fontFamily: "Sarabun-SemiBold",
        fontSize: '22@s',
        color: "#0047AB",
        width: '100%',
        textAlign: 'center',
        marginBottom: '30@vs',
        marginTop: '15@vs'
    },
    closeIcon: {
        position: 'absolute',
        top: 40,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.03)',
        width: 50,
        height: 50,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center'
    }
})
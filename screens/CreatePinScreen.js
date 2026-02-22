/* 
  หน้า CreatePinScreen.js เป็นหน้าที่ใช้สำหรับให้ผู้ใช้กำหนด Pin
*/

import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, BackHandler, Platform } from 'react-native'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import AppAlert from '../components/AppAlert'
import { addScreenshotListener } from 'react-native-detector'
import { APP_KEY } from '../environment'
import { styles } from '../styles/pin'
import PinLayout from '../components/layouts/PinLayout'

export default function CreatePinScreen({ navigation }) {
    const [pin, setPin] = useState([])
    const [passCode, setPinCode] = useState(['', '', '', '', '', ''])
    const [title, setTitle] = useState('1 - กำหนด Pin')
    const [firstPin, setFirstPin] = useState('')
    const [token, setToken] = useState(null)
    const [apiKey, setApiKey] = useState(null)
    const [showAlert, setShowAlert] = useState(false)
    const [alertMessage, setAlertMessage] = useState('')
    const [alertType, setAlertType] = useState('normal')
    const [API_URL, setAPI_URL] = useState(null)

    const numbers = [
        { id: 1 },
        { id: 2 },
        { id: 3 },
        { id: 4 },
        { id: 5 },
        { id: 6 },
        { id: 7 },
        { id: 8 },
        { id: 9 },
        { id: 'Reset' },
        { id: 0 },
    ]

    const onConfirmPressed = () => {
        setShowAlert(false)
        setAlertMessage('')

        if (alertType === 'authen') {
            setAlertType('normal')
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }]
            })
        }
    }

    const onPressNumber = (num) => {
        if (num !== 'Reset') {
            setPin([...pin, num])
            let tempCode = passCode
            for (let i = 0; i < tempCode.length; i++) {
                if (tempCode[i] === '') {
                    tempCode[i] = num
                    break
                } else {
                    continue
                }
            }
            setPinCode(tempCode)
        } else {
            setPin([])
            setPinCode(['', '', '', '', '', ''])
            setTitle('1 - กำหนด Pin')
            setFirstPin('')
        }
    }

    const onPressBackspace = () => {
        let array = [...pin]
        let index = pin.length - 1
        if (index !== -1) {
            array.splice(index, 1)
            setPin(array)
        }

        let tempCode = passCode
        for (let i = tempCode.length - 1; i >= 0; i--) {
            if (tempCode[i] !== '') {
                tempCode[i] = ''
                break
            } else {
                continue
            }
        }
        setPinCode(tempCode)
    }

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

    useEffect(() => {
        const getToken = async () => {
            try {
                const StoreAPI_URL = await AsyncStorage.getItem('StoreAPI_URL')
                const token = await AsyncStorage.getItem('token')
                const apiKey = await AsyncStorage.getItem('API_KEY')
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
        if (firstPin === '') {
            if (pin.length === 6) {
                setFirstPin(pin.join(''))
                setPin([])
                setPinCode(['', '', '', '', '', ''])
                setTitle('2 - ยืนยัน Pin ของคุณ')
            }
        } else {
            if (pin.length === 6) {
                setTitle('2 - ยืนยัน Pin ของคุณ')
                setShowAlert(true)
                if (pin.join('') === firstPin) {
                    axios
                        .post(`${API_URL}/Pin`, {
                            API_KEY: apiKey,
                            PIN_KEY: firstPin
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
                                    await AsyncStorage.setItem('token', response.data.item)
                                    await AsyncStorage.setItem('confirmShareNumber', apiKey)

                                } catch (err) {
                                    console.log(err)
                                }
                                setShowAlert(false)
                                navigation.reset({
                                    index: 0,
                                    routes: [{ name: 'Home' }]
                                })

                            } else {
                                setAlertMessage(response.data.message)
                                setPin([])
                                setPinCode(['', '', '', '', '', ''])
                                setTitle('1 - กำหนด Pin')
                                setFirstPin('')
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

                    setPin([])
                } else {
                    setAlertMessage('Pin ไม่ตรงกัน')
                    setPin([])
                    setPinCode(['', '', '', '', '', ''])
                    setTitle('1 - กำหนด Pin')
                    setFirstPin('')
                }
            }
        }
    }, [pin])

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
        <PinLayout>
            <Text style={styles.titleText}>{title}</Text>

            <View style={styles.codeContainer}>
                {
                    passCode.map((p, i) => {
                        let style = p !== '' ? styles.codeSelected : styles.code
                        return <View style={style} key={i}></View>
                    })
                }
            </View>

            <View style={styles.container}>
                <View style={styles.numberContainer}>
                    {
                        numbers.map((number, i) => {
                            let style = number.id === 'Reset' ? { fontSize: 18, fontFamily: 'Sarabun-Regular' } : {}
                            return (
                                <TouchableOpacity style={styles.number} key={i} onPress={() => onPressNumber(number.id)}>
                                    <Text style={[styles.numberText, style]}>{number.id}</Text>
                                </TouchableOpacity>
                            )
                        })
                    }
                    <TouchableOpacity style={styles.number} onPress={() => onPressBackspace()}>
                        <MaterialIcons name='backspace' size={28} color='#0047AB' />
                    </TouchableOpacity>
                </View>
            </View>

            <AppAlert
                visible={showAlert}
                title={alertMessage === '' ? alertMessage : ' ไม่สำเร็จ'}
                message={alertMessage === '' ? 'Loading...' : alertMessage}
                showConfirm={alertMessage !== ''}
                showCancel={false}
                onConfirm={onConfirmPressed}
                onCancel={() => setShowAlert(false)}
            />
        </PinLayout>
    )
}

/*
    หน้า ServiceList.js คือหน้าที่โชว์เมนู 'บริการอื่นๆ' 
*/

import React, { useState, useEffect } from 'react'
import { View, Text, BackHandler, Linking, ScrollView, Platform } from 'react-native'
import { menuListStyles } from '../../styles/menuList'
import AppHeader2 from '../../components/AppHeader2'
import AppAlert from '../../components/AppAlert'
import { APP_KEY } from '../../environment'
import axios from 'axios'
import NetInfo from '@react-native-community/netinfo'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { addScreenshotListener } from 'react-native-detector'
import MenuItem from '../../components/MenuItem'

export default function ServiceList({ navigation }) {
    const [API_URL, setAPI_URL] = useState(null)
    const [shareNumber, setShareNumber] = useState('')
    const [idCardNumber, setIdCardNumber] = useState('')
    const [brNo, setBrNo] = useState('')
    const [showAlert, setShowAlert] = useState(false)
    const [alertMessage, setAlertMessage] = useState('')
    const [alertTitle, setAlertTitle] = useState('')
    const [alertType, setAlertType] = useState('normal')
    const [skipStatus, setSkipStatus] = useState('N')

    const onConfirmPressed = () => {
        setShowAlert(false)
        setAlertMessage('')
        setAlertTitle('')

        if (alertType === 'Authen') {
            navigation.reset({
                index: 0,
                routes: [{ name: 'PinInput' }]
            })
        }
    }

    const handleBackNavigator = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }]
        })
    }

    const lineNotify = () => {
        setShowAlert(true)

        if (idCardNumber) {
            axios
                .post(`${API_URL}/linetoken`, {
                    MEM_ID: shareNumber,
                    BR_NO: brNo,
                    ID_CARD: idCardNumber
                }, {
                    headers: {
                        APP_KEY: APP_KEY
                    }
                })
                .then(async (response) => {
                    const { code, itemdetail, message } = await response.data

                    if (code === 10 || code === 20) {
                        setShowAlert(false)
                        Linking.openURL(itemdetail).catch(err => console.log(err))
                    } else {
                        setAlertTitle(' ไม่สำเร็จ')
                        setAlertMessage(message)
                    }
                })
                .catch(err => {
                    if (err.message === 'Network Error') {
                        setShowAlert(true)
                        setAlertTitle(' ไม่สำเร็จ')
                        setAlertMessage('กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่อีกครั้ง')
                        setAlertType('Authen')
                    } else if (err.message === 'Request failed with status code 401') {
                        setShowAlert(true)
                        setAlertTitle(' ไม่สำเร็จ')
                        setAlertMessage('คุณไม่ได้ทำรายการในเวลาที่กำหนด กรุณา Login อีกครั้ง')
                        setAlertType('Authen')
                    }
                })
        }
    }

    useEffect(() => {
        const getData = async () => {
            try {
                const StoreAPI_URL = await AsyncStorage.getItem('StoreAPI_URL')
                const token = await AsyncStorage.getItem('token')
                const apiKey = await AsyncStorage.getItem('confirmShareNumber')
                const SkipStatus = await AsyncStorage.getItem('SkipStatus')

                if (SkipStatus !== null) {
                    setSkipStatus('Y')
                }

                if (StoreAPI_URL !== null && token !== null) {
                    setAPI_URL(StoreAPI_URL)

                    axios
                        .post(`${StoreAPI_URL}/Profile`, {
                            API_KEY: apiKey
                        }, {
                            headers: {
                                APP_KEY: APP_KEY,
                                Authorization: `Bearer ${token}`
                            }
                        })
                        .then(async (response) => {
                            if (response.data.code === 10) {
                                const brNo = (response.data.item.SHR_MEM).slice(0, 3)
                                const memId = (response.data.item.SHR_MEM).slice(7, 12)

                                setBrNo(brNo)
                                setShareNumber(memId)
                                setIdCardNumber(response.data.item.ID_CARD)

                                try {
                                    await AsyncStorage.setItem('token', response.data.itemdetail)
                                } catch (err) {
                                    console.log(err)
                                }
                            }
                        })
                        .catch(err => {
                            if (err.message === 'Network Error') {
                                setShowAlert(true)
                                setAlertTitle(' ไม่สำเร็จ')
                                setAlertMessage('กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่อีกครั้ง')
                                setAlertType('Authen')
                            } else if (err.message === 'Request failed with status code 401') {
                                setShowAlert(true)
                                setAlertTitle(' ไม่สำเร็จ')
                                setAlertMessage('คุณไม่ได้ทำรายการในเวลาที่กำหนด กรุณา Login อีกครั้ง')
                                setAlertType('Authen')
                            }
                        })
                }
            } catch (err) {
                console.log(err)
            }
        }

        const unsubscribe = NetInfo.addEventListener((state) => {
            if (state.isInternetReachable) {
                getData()
            } else {
                setShowAlert(true)
                setAlertTitle(' ไม่สำเร็จ')
                setAlertMessage('กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตและลองใหม่อีกครั้ง')
                setAlertType('Authen')
            }
        })

        return () => { unsubscribe() }
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
            handleBackNavigator()
            return true
        }

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        )

        return () => backHandler.remove()
    })

    return (
        <View style={menuListStyles.container}>
            <AppHeader2 onPress={handleBackNavigator} />

            <View style={[menuListStyles.labelBox, menuListStyles.headerBox]}>
                <Text style={menuListStyles.labelText}>บริการอื่นๆ</Text>
            </View>

            <ScrollView>
                <View style={menuListStyles.listContainer}>
                    <MenuItem
                        title='พร้อมเพย์ (QR Code)'
                        description='รองรับ Mobile Banking ทุกธนาคาร'
                        image={require('../../assets/prompt-pay.png')}
                        onPress={() => navigation.navigate('PromptPayList')}
                    />

                    <MenuItem
                        title='เปิดบริการ LINE แจ้งเตือน'
                        description='รับข้อความแจ้งเตือนผ่าน LINE'
                        image={require('../../assets/line-1.png')}
                        onPress={() => lineNotify()}
                    />

                    {
                        skipStatus === 'Y' ? (
                            <MenuItem
                                title='ยืนยันยอดออนไลน์'
                                description='ยืนยันยอดหุ้น เงินฝาก และสินเชื่อ'
                                image={require('../../assets/confirm2.png')}
                                onPress={() => navigation.navigate('ConfirmStatus')}
                            />
                        ) : null
                    }
                </View>
            </ScrollView>

            <AppAlert
                visible={showAlert}
                title={alertTitle}
                message={alertMessage === '' ? 'Loading...' : alertMessage}
                showConfirm={alertMessage !== ''}
                showCancel={false}
                onConfirm={onConfirmPressed}
                onCancel={() => setShowAlert(false)}
            />
        </View>
    )
}

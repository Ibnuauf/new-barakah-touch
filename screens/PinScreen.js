/* 
  หน้า PinScreen.js เป็นหน้าที่ให้ผู้ใช้กรอก pin เพื่อเข้าไปสู่หน้า home
*/

import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, Image, Platform } from 'react-native'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { scale } from 'react-native-size-matters'
import AppAlert from '../components/AppAlert'
import DeviceInfo from 'react-native-device-info'
import moment from 'moment'
import NetInfo from '@react-native-community/netinfo'
import { APP_KEY, API_URL_TEST_DIRECT } from '../environment'
import { styles } from '../styles/pin'
import PinLayout from '../components/layouts/PinLayout'
import { addScreenshotListener } from 'react-native-detector'
import PromoPopup from '../components/PromoPopup'

export default function PinScreen({ route, navigation }) {
    const [keyAuthen, setKeyAuthen] = useState(null)
    const [apiKey, setApiKey] = useState('')
    const [userName, setUserName] = useState('')
    const [pin, setPin] = useState([])
    const [passCode, setPinCode] = useState(['', '', '', '', '', ''])
    const [showAlert, setShowAlert] = useState(false)
    const [alertMessage, setAlertMessage] = useState('')
    const [alertType, setAlertType] = useState('normal')
    const [uniqueId, setUniqueId] = useState(null)
    const [brand, setBrand] = useState(null)
    const [model, setModel] = useState(null)
    const [modalVisible, setModalVisible] = useState(false)
    const [imagePopup, setImagePopup] = useState([])  // *Array
    const [photo, setPhoto] = useState(null)
    const [API_URL, setAPI_URL] = useState()
    const [check1, setCheck1] = useState(null)
    const [isConnect, setIsConnect] = useState(false)

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
        { id: 'ลืม PIN' },
        { id: 0 },
    ]

    const onConfirmPressed = () => {
        setShowAlert(false)
        setAlertMessage('')

        if (alertType === 'block') {
            clearCache()

            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }]
            })
        }
    }

    const clearCache = async () => {
        try {
            const keys = await AsyncStorage.getAllKeys()

            keys.forEach(async key => {
                if (key !== 'StoreAPI_URL' && key !== 'KEY_AUTHEN' && key !== 'Fee' && key !== 'Maximum_Limit' && key !== 'BankAccountCode') {
                    await AsyncStorage.removeItem(key)
                }
            })
        } catch (error) {
            console.error(error)
        }
    }

    const getPopup = async (date, API_URL) => {
        const checboxPop = await AsyncStorage.getItem('checboxPopup')
        const imagePop = await AsyncStorage.getItem('imagePopup')
        const apiKeyPop = await AsyncStorage.getItem('apiKeyPopup')
        const apiKeyp = await AsyncStorage.getItem('confirmShareNumber')

        if (API_URL !== null) {
            axios
                .get(`${API_URL}/LinkPopup`, {
                    headers: {
                        APP_KEY: APP_KEY
                    }
                })
                .then(response => {
                    if (response.data.item !== null) {
                        let dateNumber = date.split('/').join('')

                        if (response.data.item.length > 0) {
                            const popups = response.data.item
                            let popupList = []

                            if (checboxPop !== 'true' || apiKeyPop !== apiKeyp) {
                                popups.forEach((element) => {
                                    let endDateNumber = element.LINK_END_DATE.split('/').join('')

                                    if (+dateNumber <= +endDateNumber) {
                                        popupList.push(element.LINK_PATH)

                                        setImagePopup(popupList)
                                        setModalVisible(true)
                                    }
                                })
                            } else {
                                if (imagePop !== popups[0].LINK_PATH) {
                                    popups.forEach((element) => {
                                        let endDateNumber = element.LINK_END_DATE.split('/').join('')

                                        if (+dateNumber <= +endDateNumber) {
                                            popupList.push(element.LINK_PATH)

                                            setImagePopup(popupList)
                                            setModalVisible(true)
                                        }
                                    })
                                }
                            }
                        }
                    }
                })
                .catch(error => {
                    console.log(error)
                })
        }
    }

    const clearSkipStatus = async () => {
        try {
            await AsyncStorage.removeItem('SkipStatus')
        } catch (error) {
            console.log(error);
        }
    }

    const onPressNumber = (num) => {
        if (num !== 'ลืม PIN') {
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
            navigation.navigate('ForgetPin')
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
        const getImage = async () => {
            try {
                const imageUri = await AsyncStorage.getItem('imageUri')
                if (imageUri !== null) {
                    setPhoto(imageUri)
                }
            } catch (error) {
                console.log(error)
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

        const getKey_Authen = async () => {
            try {
                const value = await AsyncStorage.getItem('KEY_AUTHEN')
                if (value !== null) {
                    setKeyAuthen(value)
                }
            } catch (err) {
                console.log(err)
            }
        }

        const getUserName = async () => {
            try {
                const StoreAPI_URL = await AsyncStorage.getItem('StoreAPI_URL')
                const userName = await AsyncStorage.getItem('UserName')
                const shareNo = await AsyncStorage.getItem('shareNo')
                if (userName !== null) {
                    setUserName(userName)
                    if (shareNo === '001-01-99999') {
                        await AsyncStorage.setItem('StoreAPI_URL', API_URL_TEST_DIRECT)
                        setAPI_URL(API_URL_TEST_DIRECT)
                    } else {
                        setAPI_URL(StoreAPI_URL)
                    }
                }

                getDate(StoreAPI_URL)
            } catch (err) {
                console.log(err)
            }
        }

        const getDate = async (API_URL) => {
            const dateFomat = moment().format('YYYY/MM/DD')
            await getPopup(dateFomat, API_URL)
        }

        getDeviceInfo()
        getKey_Authen()
        getApiKey()
        getUserName()
        getImage()
        clearSkipStatus()
    }, [route])

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state) => {
            setIsConnect(state.isInternetReachable)
        })

        return () => {
            unsubscribe()
        }
    }, [isConnect])

    useEffect(() => {
        if (pin.length === 6) {
            if (isConnect) {
                setShowAlert(true)
                axios
                    .post(`${API_URL}/LoginPIN`, {
                        API_KEY: apiKey,
                        PIN_KEY: pin.join(''),
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
                        const shareNo = (response.data.item) !== null ? (response.data.item).slice((response.data.item).length - 12, (response.data.item).length) : ''
                        //  กรณีเข้าใช้สำเร็จ
                        if (response.data.code === 10) {
                            try {
                                await AsyncStorage.setItem('token', response.data.item)
                                await AsyncStorage.setItem('UserName', response.data.itemdetail)
                                await AsyncStorage.setItem('shareNo', shareNo)
                                await AsyncStorage.setItem('MEM', shareNo)

                                navigation.reset({
                                    index: 0,
                                    routes: [{ name: 'Home' }]
                                })
                            } catch (err) {
                                console.log(err)
                            }
                        } else if (response.data.code === 50 || response.data.code === 40) {
                            //  กรณีเปลี่ยนเครื่อง(code:50) หรือลาออกแล้ว(code:40)
                            setAlertType('block')
                            setAlertMessage(response.data.message)
                            setPin([])
                            setPinCode(['', '', '', '', '', ''])
                        } else {
                            setAlertMessage(response.data.message)
                            setPin([])
                            setPinCode(['', '', '', '', '', ''])
                        }
                    })
                    .catch(error => {
                        if (error.message === 'Network Error') {
                            setAlertMessage('กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่อีกครั้ง')
                        } else if (error.message === 'Request failed with status code 404') {
                            setAlertMessage('เนื่องจากอยู่ระหว่างการปรับปรุงระบบชั่วคราว')
                        }

                        setPin([])
                        setPinCode(['', '', '', '', '', ''])
                    })
            } else {
                setShowAlert(true)
                setAlertMessage('กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่อีกครั้ง')
                setPin([])
                setPinCode(['', '', '', '', '', ''])
            }
        }
    }, [pin])

    useEffect(() => {
        if (check1 === true) {
            const getpopup = async () => {
                const apikeypop = await AsyncStorage.getItem('confirmShareNumber')
                await AsyncStorage.setItem('checboxPopup', 'true')
                await AsyncStorage.setItem('imagePopup', imagePopup[0])
                await AsyncStorage.setItem('apiKeyPopup', apikeypop)
            }
            getpopup()
        }

        if (check1 === false) {
            const getpopup = async () => {
                await AsyncStorage.setItem('checboxPopup', '')
                await AsyncStorage.setItem('imagePopup', '')
                await AsyncStorage.setItem('apiKeyPopup', '')
            }
            getpopup()
        }

    }, [check1])

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
            <View style={[styles.codeContainer, { justifyContent: 'center', alignItems: 'center' }]}>
                {
                    photo && (
                        <View style={[styles.avatar]}>
                            <Image source={{ uri: photo }} style={styles.userImage} />
                        </View>
                    )
                }
            </View>

            <Text style={[styles.titleText, { marginTop: 10 }]}>{userName}</Text>
            <Text style={[styles.titleText, { marginTop: -2 }]}>ใส่รหัส PIN เพื่อยืนยันตัวตน</Text>

            <View style={[styles.codeContainer]}>
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
                            let forgetStyle = number.id === 'ลืม PIN' ? { fontSize: scale(14), fontFamily: 'Sarabun-Regular' } : {}
                            return (
                                <TouchableOpacity style={styles.number} key={i} onPress={() => onPressNumber(number.id)}>
                                    <Text style={[styles.numberText, forgetStyle]}>{number.id}</Text>
                                </TouchableOpacity>
                            )
                        })
                    }
                    <TouchableOpacity style={styles.number} onPress={() => onPressBackspace()}>
                        <MaterialIcons name='backspace' size={24} color='#0047AB' />
                    </TouchableOpacity>
                </View>
            </View>

            <PromoPopup
                visible={modalVisible}
                images={imagePopup}
                checked={check1}
                onCheck={() => setCheck1(!check1)}
                onClose={() => setModalVisible(false)}
            />

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

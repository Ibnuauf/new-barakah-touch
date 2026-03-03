import React, { useState, useEffect } from 'react'
import { Text, View, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, ScrollView, Platform } from 'react-native'
import { styles } from '../../styles/favorite'
import AppHeader2 from '../../components/AppHeader2'
import { TextInputMask } from 'react-native-masked-text'
import AntDesign from 'react-native-vector-icons/AntDesign'
import Ionicons from 'react-native-vector-icons/Ionicons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import { APP_KEY } from '../../environment'
import AppAlert from '../../components/AppAlert'
import { getAccountType, removeDash } from '../../util'
import { addScreenshotListener } from 'react-native-detector'

const CreateFavorite = ({ route, navigation }) => {
    const { id, previousScreen } = route.params

    const [token, setToken] = useState(null)
    const [apiKey, setApiKey] = useState(null)
    const [shareNumber, setShareNumber] = useState('')
    const [accountNumber, setAccountNumber] = useState('')
    const [loanNumber, setLoanNumber] = useState('')
    const [favoriteName, setFavoriteName] = useState('')
    const [showAlert, setShowAlert] = useState(false)
    const [alertMessage, setAlertMessage] = useState('')
    const [alertType, setAlertType] = useState('normal')
    const [API_URL, setAPI_URL] = useState(null)

    const handleBackNavigator = () => {
        navigation.reset({
            index: 0,
            routes: [
                {
                    name: 'FavoriteDashboard',
                    params: {
                        previousScreen: previousScreen
                    }
                }
            ]
        })
    }

    const onConfirmPressed = () => {
        setShowAlert(false)
        setAlertMessage('')
        setAlertType('normal')

        if (alertType === 'Authen') {
            navigation.reset({
                index: 0,
                routes: [{ name: 'PinInput' }]
            })
        }
    }

    const saveFavorite = (favoriteNo) => {
        axios
            .post(`${API_URL}/InsertFavorite`, {
                API_KEY: apiKey,
                TYPE: previousScreen === 'TransactionMenu' ? '01' : '02',
                ACC_TYPE: removeDash(favoriteNo),
                FAVORITE_NAME: favoriteName,
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
                        success()

                    } catch (err) {
                        console.log(err)
                    }
                } else {
                    setShowAlert(true)
                    setAlertMessage(response.data.message)
                }
            })
            .catch(err => {
                if (err.message === 'Network Error') {
                    setShowAlert(true)
                    setAlertMessage('กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่อีกครั้ง')
                    setAlertType('Authen')
                } else if (err.message === 'Request failed with status code 401') {
                    setShowAlert(true)
                    setAlertMessage('คุณไม่ได้ทำรายการในเวลาที่กำหนด กรุณา Login อีกครั้ง')
                    setAlertType('Authen')
                }
            })
    }

    const success = () => {
        navigation.reset({
            index: 0,
            routes: [{
                name: 'FavoriteSuccess',
                params: {
                    type: id,
                    newFavoriteName: favoriteName,
                    previousScreen: previousScreen
                }
            }]
        })
    }

    const onSubmit = () => {
        if (id === 'ผ่อนชำระ') {
            const accountNumber = removeDash(shareNumber)
            const accountType = getAccountType(accountNumber)

            if (accountType !== '01') {
                setShowAlert(true)
                setAlertMessage('เลขบัญชีหุ้นหรือเลขสัญญาไม่ถูกต้อง!')
            } else {
                axios
                    .post(`${API_URL}/InsertFavorite`, {
                        API_KEY: apiKey,
                        TYPE: previousScreen === 'TransactionMenu' ? '01' : '02',
                        ACC_TYPE: loanNumber,
                        FAVORITE_NAME: favoriteName,
                        MEM_ID_REC: shareNumber.slice(7, 12),
                        BR_NO_REC: shareNumber.slice(0, 3),
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
                                success()

                            } catch (err) {
                                console.log(err)
                            }
                        } else {
                            setShowAlert(true)
                            setAlertMessage(response.data.message)
                        }
                    })
                    .catch(err => {
                        if (err.message === 'Network Error') {
                            setShowAlert(true)
                            setAlertMessage('กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่อีกครั้ง')
                            setAlertType('Authen')
                        } else if (err.message === 'Request failed with status code 401') {
                            setShowAlert(true)
                            setAlertMessage('คุณไม่ได้ทำรายการในเวลาที่กำหนด กรุณา Login อีกครั้ง')
                            setAlertType('Authen')
                        }
                    })
            }
        } else if (id === 'บัญชีเงินฝาก') {
            saveFavorite(accountNumber)
        } else {
            const accountNumber = removeDash(shareNumber)
            const accountType = getAccountType(accountNumber)

            if (accountType !== '01') {
                setShowAlert(true)
                setAlertMessage('เลขบัญชีหุ้นไม่ถูกต้อง!')
            } else {
                saveFavorite(shareNumber)
            }
        }
    }

    useEffect(() => {
        const getData = async () => {
            try {
                const StoreAPI_URL = await AsyncStorage.getItem('StoreAPI_URL')
                const token = await AsyncStorage.getItem('token')
                const apiKey = await AsyncStorage.getItem('confirmShareNumber')

                if (token !== null) {
                    setToken(token)
                }

                if (apiKey !== null) {
                    setApiKey(apiKey)
                }

                if (StoreAPI_URL !== null) {
                    setAPI_URL(StoreAPI_URL)
                }

            } catch (error) {
                console.log(error)
            }
        }

        getData()
    }, [route])

    useEffect(() => {
        if (accountNumber.length === 14) {
            axios
                .post(
                    `${API_URL}/CheckAccountNO`,
                    {
                        API_KEY: apiKey,
                        ACCOUNT_NO: removeDash(accountNumber)
                    },
                    {
                        headers: {
                            APP_KEY: APP_KEY,
                            Authorization: `Bearer ${token}`,
                        },
                    },
                )
                .then(async response => {
                    if (response.data.code !== 10) {
                        setShowAlert(true)
                        setAlertMessage(response.data.message)
                        setAccountNumber('')
                    }
                })
                .catch(err => {
                    console.log(err.message)
                    if (err.message === 'Network Error') {
                        setShowAlert(true)
                        setAlertMessage('กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่อีกครั้ง')
                        setAlertType('Authen')
                    } else if (err.message === 'Request failed with status code 401') {
                        setShowAlert(true)
                        setAlertMessage('คุณไม่ได้ทำรายการในเวลาที่กำหนด กรุณา Login อีกครั้ง')
                        setAlertType('Authen')
                    }
                })
        }
    }, [accountNumber])

    useEffect(() => {
        if (shareNumber.length === 12) {
            if (id === 'ผ่อนชำระ') {
                if (loanNumber.length === 13) {
                    axios
                        .post(
                            `${API_URL}/CheckLoanID`,
                            {
                                MEM: shareNumber,
                                LCONT_ID: loanNumber,
                            },
                            {
                                headers: {
                                    APP_KEY: APP_KEY,
                                    Authorization: `Bearer ${token}`,
                                },
                            },
                        )
                        .then(async response => {
                            if (response.data.code !== 10) {
                                setShowAlert(true)
                                setAlertMessage(response.data.message)
                                setLoanNumber('')
                            }
                        })
                        .catch(err => {
                            console.log(err.message)
                            if (err.message === 'Network Error') {
                                setShowAlert(true)
                                setAlertMessage('กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่อีกครั้ง')
                                setAlertType('Authen')
                            } else if (err.message === 'Request failed with status code 401') {
                                setShowAlert(true)
                                setAlertMessage('คุณไม่ได้ทำรายการในเวลาที่กำหนด กรุณา Login อีกครั้ง')
                                setAlertType('Authen')
                            }
                        })
                }
            } else {
                axios
                    .post(
                        `${API_URL}/CheckMemID`,
                        {
                            API_KEY: apiKey,
                            MEM: shareNumber,
                        },
                        {
                            headers: {
                                APP_KEY: APP_KEY,
                                Authorization: `Bearer ${token}`,
                            },
                        },
                    )
                    .then(async response => {
                        if (response.data.code !== 10) {
                            setShowAlert(true)
                            setAlertMessage(response.data.message)
                            setShareNumber('')
                        }
                    })
                    .catch(err => {
                        console.log(err.message)
                        if (err.message === 'Network Error') {
                            setShowAlert(true)
                            setAlertMessage('กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่อีกครั้ง')
                            setAlertType('Authen')
                        } else if (err.message === 'Request failed with status code 401') {
                            setShowAlert(true)
                            setAlertMessage('คุณไม่ได้ทำรายการในเวลาที่กำหนด กรุณา Login อีกครั้ง')
                            setAlertType('Authen')
                        }
                    })
            }
        }

    }, [shareNumber, loanNumber])

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
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
                <AppHeader2 onPress={handleBackNavigator} />

                <View style={styles.labelBox}>
                    <Text style={styles.labelText}>เพิ่มรายการโปรด{id}</Text>
                </View>

                <ScrollView style={{ padding: 20 }}>
                    <TouchableOpacity activeOpacity={1}>
                        {
                            id === 'บัญชีเงินฝาก' ? (
                                <View>
                                    <Text style={styles.labelText}>เลขบัญชีผู้รับ</Text>

                                    <View style={styles.inputBox}>
                                        <TextInputMask
                                            type={'custom'}
                                            keyboardType='numeric'
                                            options={{ mask: '999-99-99999-9' }}
                                            value={accountNumber}
                                            onChangeText={text => setAccountNumber(text)}
                                            style={styles.input}
                                        />

                                        <AntDesign name='contacts' size={24} color='#8c8c8c' />
                                    </View>
                                </View>
                            ) : (
                                id === 'ฝากหุ้น' ? (
                                    <View>
                                        <Text style={styles.labelText}>เลขบัญชีหุ้นผู้รับ</Text>

                                        <View style={styles.inputBox}>
                                            <TextInputMask
                                                type={'custom'}
                                                keyboardType='numeric'
                                                options={{ mask: '999-99-99999' }}
                                                value={shareNumber}
                                                onChangeText={text => setShareNumber(text)}
                                                style={styles.input}
                                            />

                                            <AntDesign name='contacts' size={24} color='#8c8c8c' />
                                        </View>
                                    </View>
                                ) : (
                                    <View>
                                        <Text style={styles.labelText}>เลขบัญชีหุ้นผู้รับ</Text>

                                        <View style={styles.inputBox}>
                                            <TextInputMask
                                                type={'custom'}
                                                keyboardType='numeric'
                                                options={{ mask: '999-99-99999' }}
                                                value={shareNumber}
                                                onChangeText={text => setShareNumber(text)}
                                                style={styles.input}
                                            />

                                            <AntDesign name='contacts' size={24} color='#8c8c8c' />
                                        </View>

                                        <Text style={styles.labelText}>เลขที่สัญญา</Text>

                                        <View style={styles.inputBox}>
                                            <TextInputMask
                                                type={'custom'}
                                                options={{ mask: '*.999999/9999' }}
                                                value={loanNumber}
                                                onChangeText={text => setLoanNumber(text)}
                                                style={styles.input}
                                            />

                                            <AntDesign name='contacts' size={24} color='#8c8c8c' />
                                        </View>
                                    </View>
                                )
                            )
                        }

                        <View style={{ marginTop: 20 }}>
                            <Text style={styles.labelText}>ชื่อรายการโปรด</Text>

                            <View style={styles.inputBox}>
                                <TextInput
                                    style={styles.input}
                                    onChangeText={text => setFavoriteName(text)}
                                    value={favoriteName}
                                />

                                <Ionicons name='pricetag-outline' size={24} color='#8c8c8c' />
                            </View>
                        </View>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={handleBackNavigator} style={styles.backBtn} >
                                <Text style={styles.backText}>ยกเลิก</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={onSubmit} style={styles.nextBtn} >
                                <Text style={styles.nextText}>บันทึก</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </ScrollView>

                <AppAlert
                    visible={showAlert}
                    title={alertMessage === '' ? alertMessage : ' ไม่สำเร็จ'}
                    message={alertMessage === '' ? 'Loading...' : alertMessage}
                    showConfirm={alertMessage !== ''}
                    showCancel={false}
                    onConfirm={onConfirmPressed}
                    onCancel={() => setShowAlert(false)}
                />
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    )
}

export default CreateFavorite

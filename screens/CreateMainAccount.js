import React, { useState, useEffect } from 'react'
import { Text, View, StatusBar, TouchableOpacity, ScrollView, Platform, SafeAreaView } from 'react-native'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { styles } from './AccountSetting'
import axios from 'axios'
import { APP_KEY } from '../environment'
import AsyncStorage from '@react-native-async-storage/async-storage'
import ActionSheet from '../components/ActionSheet'
import AppAlert from '../components/AppAlert'
import { scale } from 'react-native-size-matters'
import { addScreenshotListener } from 'react-native-detector'

const CreateMainAccount = ({ navigation, route }) => {
    const { accountNo } = route.params

    const [showAlert, setShowAlert] = useState(false)
    const [alertMessage, setAlertMessage] = useState('')
    const [alertType, setAlertType] = useState('')
    const [savings, setSavings] = useState([])
    const [modalVisible, setModalVisible] = useState(false)
    const [selectedAccount, setSelectedAccount] = useState(null)
    const [token, setToken] = useState(null)
    const [apiUrl, setApiUrl] = useState(null)
    const [apiKey, setApiKey] = useState(null)
    const [isLoaing, setIsLoading] = useState(true)

    const handleBackNavigator = () => {
        navigation.goBack()
    }

    const selectSaving = (saving) => {
        setSelectedAccount(saving)
        setModalVisible(false)
    }

    const onConfirmPressed = () => {
        if (alertType === 'success') {
            navigation.reset({
                index: 0,
                routes: [{ name: 'AccountSetting' }]
            })
        } else if (alertType === 'authen') {
            navigation.reset({
                index: 0,
                routes: [{ name: 'PinInput' }]
            })
        } else {
            setShowAlert(false)
        }
    }

    const onSubmit = () => {
        if (selectedAccount) {
            axios
                .post(`${apiUrl}/UpdateMainAccount`, {
                    API_KEY: apiKey,
                    ACCOUNT_NO: accountNo ? accountNo : null,
                    ACCOUNT_NO_NEW: selectedAccount.ACCOUNT_NO
                }, {
                    headers: {
                        APP_KEY: APP_KEY,
                        Authorization: `Bearer ${token}`
                    }
                })
                .then(async response => {
                    const { code, message, item } = response.data

                    if (code === 0) {
                        setShowAlert(true)
                        setAlertMessage(message)
                        setAlertType('success')

                        try {
                            await AsyncStorage.setItem('token', item)
                        } catch (err) {
                            console.log(err)
                        }
                    }
                })
                .catch(err => {
                    if (err.message === 'Network Error') {
                        setShowAlert(true)
                        setAlertType('authen')
                        setAlertMessage('กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่อีกครั้ง')
                    } else if (err.message === 'Request failed with status code 401') {
                        setShowAlert(true)
                        setAlertType('authen')
                        setAlertMessage('คุณไม่ได้ทำรายการในเวลาที่กำหนด กรุณา Login อีกครั้ง')
                    }
                })
        }
    }

    useEffect(() => {
        const getToken = async () => {
            try {
                const StoreAPI_URL = await AsyncStorage.getItem('StoreAPI_URL')
                const token = await AsyncStorage.getItem('token')
                const apiKey = await AsyncStorage.getItem('confirmShareNumber')

                if (StoreAPI_URL !== null && token !== null && apiKey !== null) {
                    setApiUrl(StoreAPI_URL)
                    setApiKey(apiKey)

                    axios
                        .post(`${StoreAPI_URL}/SavingItem`, {
                            API_KEY: apiKey
                        }, {
                            headers: {
                                APP_KEY: APP_KEY,
                                Authorization: `Bearer ${token}`
                            }
                        })
                        .then(async (response) => {
                            const { code, item, itemdetail, message } = response.data

                            if (code === 10) {
                                const wadiahs = await item.SavingItem.filter(saving => saving.ACC_TYPE === '02')

                                setSavings(wadiahs)
                                setIsLoading(false)

                                try {
                                    await AsyncStorage.setItem('token', itemdetail)
                                    setToken(itemdetail)
                                } catch (err) {
                                    console.log(err)
                                }
                            } else {
                                setShowAlert(true)
                                setAlertMessage(message)
                            }
                        })
                        .catch(err => {
                            if (err.message === 'Network Error') {
                                setShowAlert(true)
                                setAlertType('authen')
                                setAlertMessage('กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่อีกครั้ง')
                            } else if (err.message === 'Request failed with status code 401') {
                                setShowAlert(true)
                                setAlertType('authen')
                                setAlertMessage('คุณไม่ได้ทำรายการในเวลาที่กำหนด กรุณา Login อีกครั้ง')
                            }
                        })
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

    return (
        <View style={styles.container}>
            <StatusBar barStyle='light-content' />

            <View style={styles.header}>
                <SafeAreaView style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity style={{ paddingRight: 16, paddingLeft: 6 }} onPress={handleBackNavigator}>
                        <FontAwesome5 name='chevron-left' size={18} color='#fff' />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerText} numberOfLines={1}>จัดการบัญชี</Text>
                    </View>
                </SafeAreaView>
            </View>

            <View style={styles.labelBox}>
                <Text style={styles.labelText}>เลือกบัญชีหลัก</Text>
            </View>

            <View style={{}}>
                <View style={styles.formContainer}>
                    <Text style={styles.labelText}>บัญชี</Text>

                    <TouchableOpacity style={styles.savingBox} onPress={() => !isLoaing && setModalVisible(true)}>
                        {
                            !selectedAccount ? (
                                <View>
                                    <Text style={[styles.labelText, { color: '#777' }]}>เลือกบัญชีหลัก</Text>
                                </View>
                            ) : (
                                <View>
                                    <Text style={styles.savingText} numberOfLines={1}>{selectedAccount.ACCOUNT_NAME}</Text>
                                    <Text style={[styles.savingText, styles.savingDetail]} numberOfLines={1}>{selectedAccount.ACCOUNT_SHOW}</Text>
                                </View>
                            )
                        }

                        <AntDesign name='down' size={18} color='#aaa' />
                    </TouchableOpacity>

                    <View style={{ marginTop: 16, paddingHorizontal: 10, flexDirection: 'row' }}>
                        <AntDesign name='infocirlce' size={18} color='#69b1ff' style={{ marginTop: 4 }} />

                        <View style={{ marginLeft: 10 }}>
                            <Text style={[styles.text, { fontSize: scale(13) }]}>โปรดเลือกบัญชีหลักเพื่อใช้สำหรับ</Text>
                            <Text style={[styles.text, { fontSize: scale(13) }]}>- โอนออกไปยังธนาคาร</Text>
                            <Text style={[styles.text, { fontSize: scale(13) }]}>- สแกนจ่าย</Text>
                            <Text style={[styles.text, { fontSize: scale(13) }]}>- QR รับเงิน</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        onPress={handleBackNavigator}
                        style={[styles.button, styles.backBtn]}
                    >
                        <Text style={styles.backText}>ยกเลิก</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => selectedAccount && onSubmit()}
                        style={[styles.button, styles.nextBtn]}
                    >
                        <Text style={styles.nextText}>บันทึก</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ActionSheet
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                title='เลือกบัญชี'
            >
                <ScrollView style={{ width: '100%' }}>
                    {
                        savings.map((saving, index) => (
                            <TouchableOpacity key={index} style={styles.modalBankList} onPress={() => selectSaving(saving)}>

                                <View>
                                    <Text style={styles.savingText} numberOfLines={1}>{saving.ACCOUNT_NAME}</Text>
                                    <Text style={[styles.savingText, styles.savingDetail]} numberOfLines={1}>{saving.ACCOUNT_SHOW}</Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    }
                </ScrollView>
            </ActionSheet>

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
        </View>
    )
}

export default CreateMainAccount

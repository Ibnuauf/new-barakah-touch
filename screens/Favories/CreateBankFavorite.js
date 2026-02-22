import React, { useState, useEffect } from 'react'
import {
    Text,
    View,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Keyboard,
    KeyboardAvoidingView,
    ScrollView,
    Image,
    Pressable,
    Platform
} from 'react-native'
import { styles } from '../../styles/favorite'
import AppHeader2 from '../../components/AppHeader2'
import { TextInputMask } from 'react-native-masked-text'
import AntDesign from 'react-native-vector-icons/AntDesign'
import Ionicons from 'react-native-vector-icons/Ionicons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import { APP_KEY, PRIMARY_COLOR } from '../../environment'
import AppAlert from '../../components/AppAlert'
import { banks } from '../../util'
import ActionSheet from '../../components/ActionSheet'
import { addScreenshotListener } from 'react-native-detector'

const CreateBankFavorite = ({ route, navigation }) => {
    const { previousScreen } = route.params

    const [token, setToken] = useState(null)
    const [apiKey, setApiKey] = useState(null)
    const [accountNumber, setAccountNumber] = useState('')
    const [promptpayNumber, setPromptpayNumber] = useState('')
    const [favoriteName, setFavoriteName] = useState('')
    const [showAlert, setShowAlert] = useState(false)
    const [alertMessage, setAlertMessage] = useState('')
    const [alertType, setAlertType] = useState('normal')
    const [API_URL, setAPI_URL] = useState(null)
    const [destinationBank, setDestinationBank] = useState(null)
    const [modalVisible, setModalVisible] = useState(false)
    const [accountType, setAccountType] = useState('bank')
    const [bankCode, setBankCode] = useState(null)

    const handleBackNavigator = () => {
        navigation.reset({
            index: 0,
            routes: [{
                name: 'FavoriteDashboard',
                params: {
                    previousScreen: previousScreen
                }
            }]
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

    const selectBank = bank => {
        setBankCode(bank.BANK_CODE)
        setDestinationBank(bank)
        setModalVisible(false)
    }

    const success = () => {
        navigation.reset({
            index: 0,
            routes: [{
                name: 'FavoriteSuccess',
                params: {
                    type: 'บัญชีธนาคาร/พร้อมเพย์',
                    newFavoriteName: favoriteName,
                    previousScreen: previousScreen
                }
            }]
        })
    }

    const insertFavorite = (accountNumber) => {
        axios
            .post(`${API_URL}/InsertFavorite`, {
                API_KEY: apiKey,
                TYPE: previousScreen === 'TransactionMenu' ? '01' : '02',
                ACC_TYPE: accountNumber,
                FAVORITE_NAME: favoriteName,
                BANK_CODE: bankCode
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

    const onSubmit = () => {
        if (accountType === 'bank') {
            insertFavorite(accountNumber)
        } else {
            insertFavorite(promptpayNumber)
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
                    <Text style={styles.labelText}>เพิ่มรายการโปรดบัญชีธนาคาร</Text>
                </View>

                <ScrollView style={{ padding: 20 }}>
                    <TouchableOpacity activeOpacity={1}>

                        <View style={styles.tabContainer}>
                            <Pressable style={[styles.tab, accountType === 'bank' && styles.tabActive]} onPress={() => setAccountType('bank')}>
                                <Text style={[styles.labelText, accountType === 'bank' ? { fontSize: 15, color: '#fff' } : { fontSize: 15, color: PRIMARY_COLOR }]}>บัญชีธนาคาร</Text>
                            </Pressable>

                            <Pressable style={[styles.tab, accountType === 'promptpay' && styles.tabActive]} onPress={() => setAccountType('promptpay')}>
                                <Text style={[styles.labelText, accountType === 'promptpay' ? { fontSize: 15, color: '#fff' } : { fontSize: 15, color: PRIMARY_COLOR }]}>พร้อมเพย์</Text>
                            </Pressable>
                        </View>

                        {
                            accountType === 'bank' ? (
                                <View>
                                    <View style={{ marginTop: 10 }}>
                                        <Text style={styles.labelText}>ธนาคาร</Text>

                                        <TouchableOpacity style={styles.savingBox} onPress={() => setModalVisible(true)}>
                                            {
                                                !destinationBank ? (
                                                    <Text style={[styles.labelText, { fontFamily: 'Sarabun-Regular', color: '#999' }]} numberOfLines={1}>เลือกธนาคาร</Text>
                                                ) : (
                                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                        <Image source={destinationBank.logo} style={styles.bankLogo} />

                                                        <View>
                                                            <Text style={[styles.savingText]}>{destinationBank.name}</Text>
                                                            <Text style={[styles.savingText, styles.savingDetail]}>{destinationBank.symbol}</Text>
                                                        </View>
                                                    </View>
                                                )
                                            }

                                            <AntDesign name='down' size={18} color='#aaa' />
                                        </TouchableOpacity>
                                    </View>

                                    <View style={{ marginTop: 10 }}>
                                        <Text style={styles.labelText}>เลขที่บัญชี</Text>
                                        <View style={styles.inputBox}>
                                            <TextInputMask
                                                type={'custom'}
                                                keyboardType='numeric'
                                                options={{
                                                    mask: '999999999999999',
                                                }}
                                                value={accountNumber}
                                                onChangeText={text => {
                                                    setAccountNumber(text)
                                                }}
                                                style={styles.input}
                                            />

                                            <AntDesign name='contacts' size={24} color='#8c8c8c' />
                                        </View>
                                    </View>
                                </View>
                            ) : (
                                <View style={{ marginTop: 10 }}>
                                    <Text style={styles.labelText}>หมายเลขพร้อมเพย์</Text>
                                    <View style={styles.inputBox}>
                                        <TextInputMask
                                            type={'custom'}
                                            keyboardType='numeric'
                                            options={{
                                                mask: '9999999999999',
                                            }}
                                            value={promptpayNumber}
                                            onChangeText={text => {
                                                setPromptpayNumber(text)
                                            }}
                                            style={styles.input}
                                        />

                                        <AntDesign name='contacts' size={24} color='#8c8c8c' />
                                    </View>
                                </View>
                            )
                        }

                        <View style={{ marginTop: 10 }}>
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
                            <TouchableOpacity
                                onPress={() => handleBackNavigator()}
                                style={styles.backBtn}
                            >
                                <Text style={styles.backText}>ยกเลิก</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => onSubmit()}
                                style={styles.nextBtn}
                            >
                                <Text style={styles.nextText}>บันทึก</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </ScrollView>

                <ActionSheet
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    title='ธนาคาร'
                >
                    <ScrollView style={{ width: '100%' }}>
                        {
                            banks.map((bank) => (
                                <TouchableOpacity key={bank.BANK_CODE} style={styles.modalBankList} onPress={() => selectBank(bank)}>
                                    <Image source={bank.logo} style={styles.bankLogo} />

                                    <View>
                                        <Text style={styles.savingText} numberOfLines={1}>{bank.name}</Text>
                                        <Text style={[styles.savingText, styles.savingDetail]} numberOfLines={1}>{bank.symbol}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))
                        }
                    </ScrollView>
                </ActionSheet>

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

export default CreateBankFavorite

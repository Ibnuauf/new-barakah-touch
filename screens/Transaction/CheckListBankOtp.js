import React, { useState, useEffect } from 'react'
import { View, Text, Image, TouchableOpacity, BackHandler, ScrollView, Platform, SafeAreaView } from 'react-native'
import { accountNumberFormat, prettyAmount, searchBankIcon, searchBankName } from '../../util'
import AppAlert from '../../components/AppAlert'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { styles } from '../../styles/checkList'
import axios from 'axios'
import { APP_KEY, PRIMARY_COLOR } from '../../environment'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { addScreenshotListener } from 'react-native-detector'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'

const CheckListBankOtp = ({ navigation, route }) => {
    const {
        PromptPayAccountNo,
        PromptPayAccountName,
        ToBankId,
        SenderName,
        SenderReference,
        Amount,
        memo,
        mgate_prev_inquiry_request
    } = route.params

    const [apiKey, setApiKey] = useState(null)
    const [token, setToken] = useState(null)
    const [showAlert, setShowAlert] = useState(false)
    const [alertMessage, setAlertMessage] = useState('')
    const [alertType, setAlertType] = useState('normal')
    const [API_URL, setAPI_URL] = useState(null)
    const [bankIcon, setBankIcon] = useState(null)
    const [fee, setFee] = useState(0)

    const onConfirmPressed = () => {
        setShowAlert(false)
        setAlertMessage('')

        if (alertType === 'Authen') {
            setAlertType('normal')
            navigation.reset({
                index: 0,
                routes: [{ name: 'PinInput' }]
            })
        }
    }

    const onSubmit = () => {
        setShowAlert(true)

        axios
            .post(`${API_URL}/CIMB_Comfirm`, {
                API_KEY: apiKey,
                mgate_prev_inquiry_request: mgate_prev_inquiry_request
            }, {
                headers: {
                    APP_KEY: APP_KEY,
                    Authorization: `Bearer ${token}`,
                }
            })
            .then(async response => {
                // console.log(response.data)

                const { code, item, message } = response.data

                if (code === 10) {
                    navigation.reset({
                        index: 0,
                        routes: [{
                            name: 'TransferOtp',
                            params: {
                                PromptPayAccountNo,
                                PromptPayAccountName,
                                ToBankId,
                                SenderName,
                                SenderReference,
                                Amount,
                                memo,
                                randomRef: item,
                                mgate_prev_inquiry_request
                            }
                        }]
                    })
                } else {
                    setShowAlert(true)
                    setAlertMessage(message)
                }
            })
            .catch(err => {
                console.log({ err })
                if (err.message === 'Network Error') {
                    setShowAlert(true)
                    setAlertType('Authen')
                    setAlertMessage('ไม่สามารถทำรายการได้ กรุณาลองใหม่อีกครั้ง')
                } else if (err.message === 'Request failed with status code 401') {
                    setShowAlert(true)
                    setAlertType('Authen')
                    setAlertMessage('คุณไม่ได้ทำรายการในเวลาที่กำหนด กรุณา Login อีกครั้ง')
                }
            })
    }

    const handleBackNavigator = () => {
        navigation.reset({
            index: 0,
            routes: [{
                name: 'SendToBank',
                params: {
                    previousScreen: route.name
                }
            }]
        })
    }

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
        const getToken = async () => {
            if (!ToBankId) {
                if (PromptPayAccountNo?.length === 10) {
                    setBankIcon(require('../../assets/bank/smartphone.png'))
                } else {
                    setBankIcon(require('../../assets/bank/idcard.png'))
                }
            } else {
                setBankIcon(searchBankIcon(ToBankId))
            }

            try {
                const fee = await AsyncStorage.getItem('Fee')
                const StoreAPI_URL = await AsyncStorage.getItem('StoreAPI_URL')
                const token = await AsyncStorage.getItem('token')
                const apiKey = await AsyncStorage.getItem('confirmShareNumber')

                if (fee !== null) {
                    setFee(+fee)
                }

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
        const backAction = () => {
            handleBackNavigator()
            return true
        }

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction)

        return () => backHandler.remove()
    })

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.header}>
                <SafeAreaView style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity style={{ paddingRight: 16 }} onPress={handleBackNavigator}>
                        <FontAwesome5 name='chevron-left' size={18} color={PRIMARY_COLOR} />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerText} numberOfLines={1}>ตรวจสอบข้อมูล</Text>
                    </View>
                </SafeAreaView>
            </View>

            <View style={styles.body}>
                <ScrollView>
                    <View style={{ paddingVertical: 14 }}>
                        <View style={styles.subSection1}>
                            <Image style={styles.icon} source={require('../../assets/new-logo-barakah3.png')} />

                            <View>
                                <Text style={styles.primaryText}>{SenderName}</Text>
                                <Text style={styles.secondaryText} numberOfLines={1}>{accountNumberFormat(SenderReference)}</Text>
                                <Text style={styles.secondaryText} numberOfLines={1}>วาดีอะฮ์</Text>
                            </View>
                        </View>

                        <View style={{ paddingHorizontal: 20 }}>
                            <AntDesign name='arrowdown' size={32} color='#777' alignItems='center' />
                        </View>

                        <View style={styles.subSection1}>
                            <View style={[styles.icon, { justifyContent: 'center', alignItems: 'center' }]}>
                                {
                                    bankIcon && (
                                        <Image style={styles.bankIcon} source={bankIcon} />
                                    )
                                }
                            </View>

                            <View>
                                <Text style={styles.primaryText}>{PromptPayAccountName}</Text>
                                <Text style={styles.secondaryText} numberOfLines={1}>{PromptPayAccountNo}</Text>

                                {
                                    !ToBankId ? (
                                        <Text style={styles.secondaryText} numberOfLines={1}>พร้อมเพย์</Text>
                                    ) : (
                                        <Text style={styles.secondaryText} numberOfLines={1}>{searchBankName(ToBankId)}</Text>
                                    )
                                }
                            </View>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.leftItem}>
                            <Text style={styles.primaryText}>จำนวนเงิน</Text>
                        </View>

                        <View style={styles.rightItem}>
                            <Text style={styles.largeText}>{prettyAmount(Amount)}</Text>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.leftItem}>
                            <Text style={styles.primaryText}>ค่าธรรมเนียม</Text>
                        </View>

                        <View style={styles.rightItem}>
                            <Text style={styles.primaryText}>{prettyAmount(fee)}</Text>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.leftItem}>
                            <Text style={[styles.primaryText, { color: '#4096ff' }]}>ยอดรวม</Text>
                        </View>

                        <View style={styles.rightItem}>
                            <Text style={[styles.largeText, { color: '#4096ff' }]}>{prettyAmount(Amount + fee)}</Text>
                        </View>
                    </View>

                    {
                        memo !== '' && (
                            <View style={styles.section}>
                                <View style={styles.leftItem}>
                                    <Text style={styles.secondaryText}>บันทึกช่วยจำ</Text>
                                </View>
                                <View style={styles.rightItem}>
                                    <Text style={styles.secondaryText}>{memo}</Text>
                                </View>
                            </View>
                        )
                    }
                </ScrollView>

                <View style={styles.warnning}>
                    <AntDesign name='exclamationcircle' size={24} color='#ff7875' />
                    <Text style={styles.warnningHeader}>ระวังโอนเงินผิดบัญชี!</Text>
                    <Text style={styles.warnningText}>กรุณาตรวจสอบข้อมูลบัญชีปลายทาง หากกด 'ยืนยัน' แล้วจะไม่สามารถยกเลิกรายการได้</Text>
                </View>

                <TouchableOpacity onPress={onSubmit} style={styles.button}>
                    <Text style={styles.btnText}>ยืนยัน</Text>
                </TouchableOpacity>
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
        </View>
    )
}

export default CheckListBankOtp

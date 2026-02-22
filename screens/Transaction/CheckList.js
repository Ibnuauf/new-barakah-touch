import React, { useEffect, useState } from 'react'
import { View, Text, Image, TouchableOpacity, BackHandler, ScrollView, Platform, SafeAreaView } from 'react-native'
import axios from 'axios'
import { APP_KEY, PRIMARY_COLOR } from '../../environment'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { prettyAmount, removeDash } from '../../util'
import AppAlert from '../../components/AppAlert'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { styles } from '../../styles/checkList'
import { addScreenshotListener } from 'react-native-detector'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'

const CheckList = ({ route, navigation }) => {
    const { ref1, ref2, ref3, sourceAccount, destinationAccount, memo, MEM, other, previousScreen } = route.params

    const [apiKey, setApiKey] = useState(null)
    const [token, setToken] = useState(null)
    const [showAlert, setShowAlert] = useState(false)
    const [alertMessage, setAlertMessage] = useState('')
    const [alertTitle, setAlertTitle] = useState(' ไม่สำเร็จ')
    const [alertType, setAlertType] = useState('normal')
    const [favorites, setFavorites] = useState(null)
    const [API_URL, setAPI_URL] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    const handleBackNavigator = () => {
        if (!previousScreen || Platform.OS === 'ios') {
            navigation.goBack()
        } else {
            navigation.reset({
                index: 0,
                routes: [{
                    name: previousScreen,
                    params: {
                        previousScreen: route.name
                    }
                }]
            })
        }
    }

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
        // ฝากหุ้น
        if (destinationAccount.SHR_) {
            setShowAlert(true)
            axios
                .post(
                    `${API_URL}/ShareDEP_IN`,
                    {
                        API_KEY: apiKey,
                        MEM: MEM,
                        ACCOUNT_NO: ref2,
                        SHR_BTH: ref3,
                        CAUSE: memo
                    },
                    {
                        headers: {
                            APP_KEY: APP_KEY,
                            Authorization: `Bearer ${token}`,
                        },
                    },
                )
                .then(async response => {
                    // console.log(response.data)
                    if (response.data.code == 10) {
                        try {
                            await AsyncStorage.setItem('token', response.data.item)

                            navigation.reset({
                                index: 0,
                                routes: [{
                                    name: 'Slip',
                                    params: {
                                        ref1: MEM,
                                        ref2: ref2,
                                        ref3: ref3,
                                        sourceAccount: sourceAccount,
                                        destinationAccount: destinationAccount,
                                        memo: memo,
                                        SLIP: response.data.itemdetail.SLIP_NO,
                                        CREATE_DATE: response.data.itemdetail.CREATE_DATE,
                                        favoritesArray: favorites,
                                        transactionType: 'ฝากหุ้น',
                                    }
                                }]
                            })
                        } catch (err) {
                            console.log(err)
                        }
                    } else if (response.data.code === 0) {
                        setAlertTitle('ระบบขัดข้อง')
                        setAlertMessage('กรุณาตรวจสอบการทำรายการ หากไม่สำเร็จกรุณาลองใหม่อีกครั้ง')
                        setAlertType('Authen')
                    } else {
                        setAlertMessage(response.data.message)
                        return
                    }
                })
                .catch(err => {
                    if (err.message === 'Network Error') {
                        setAlertType('Authen')
                        setAlertMessage('กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่อีกครั้ง')
                    } else if (err.message === 'Request failed with status code 401') {
                        setAlertType('Authen')
                        setAlertMessage('คุณไม่ได้ทำรายการในเวลาที่กำหนด กรุณา Login อีกครั้ง')
                    }
                })
        }

        // เงินฝาก
        if (destinationAccount.ACCOUNT_SHOW || destinationAccount.ACCOUNT_NO) {
            let retSaving = removeDash(ref1)
            let retSavingGoto = removeDash(ref2)

            setShowAlert(true)

            axios
                .post(
                    `${API_URL}/TransferPaymentIN`,
                    {
                        API_KEY: apiKey,
                        ACCOUNT_NO: retSaving,
                        ACCOUNT_NO_TO: retSavingGoto,
                        AMOUNT: ref3,
                        CAUSE: memo
                    },
                    {
                        headers: {
                            APP_KEY: APP_KEY,
                            Authorization: `Bearer ${token}`,
                        },
                    },
                )
                .then(async response => {
                    // console.log(response.data)
                    if (response.data.code === 10) {
                        try {
                            await AsyncStorage.setItem('token', response.data.item)

                            navigation.reset({
                                index: 0,
                                routes: [{
                                    name: 'Slip',
                                    params: {
                                        ref1: ref1,
                                        ref2: ref2,
                                        ref3: ref3,
                                        sourceAccount: sourceAccount,
                                        destinationAccount: destinationAccount,
                                        memo: memo,
                                        SLIP: response.data.itemdetail.SLIP_NO,
                                        CREATE_DATE: response.data.itemdetail.CREATE_DATE,
                                        other: 'เงินฝาก',
                                        favoritesArray: favorites,
                                        transactionType: 'เงินฝาก',
                                    }
                                }]
                            })
                        } catch (err) {
                            console.log(err)
                        }
                    } else if (response.data.code === 0) {
                        setAlertTitle('ระบบขัดข้อง')
                        setAlertMessage('กรุณาตรวจสอบการทำรายการ หากไม่สำเร็จกรุณาลองใหม่อีกครั้ง')
                        setAlertType('Authen')
                    } else {
                        setAlertMessage(response.data.message)

                        if (response.data.code === 90) {
                            setAlertType('Authen')
                        }
                    }
                })
                .catch(err => {
                    if (err.message === 'Network Error') {
                        setAlertType('Authen')
                        setAlertMessage('กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่อีกครั้ง')
                    } else if (err.message === 'Request failed with status code 401') {
                        setAlertType('Authen')
                        setAlertMessage('คุณไม่ได้ทำรายการในเวลาที่กำหนด กรุณา Login อีกครั้ง')
                    }
                })
        }

        //สินเชื่อ
        if (destinationAccount.LCONT_ID) {
            let refSaving = removeDash(ref1)

            setShowAlert(true)

            axios
                .post(
                    `${API_URL}/PayLoanIN`,
                    {
                        API_KEY: apiKey,
                        ACCOUNT_NO: refSaving,
                        LCONT_ID: ref2,
                        SUM_SAL: ref3,
                        CODE: destinationAccount.CODE,
                        MEM: other,
                        CAUSE: memo
                    },
                    {
                        headers: {
                            APP_KEY: APP_KEY,
                            Authorization: `Bearer ${token}`,
                        },
                    },
                )
                .then(async response => {
                    // console.log(response.data)
                    if (response.data.code === 10) {
                        try {
                            await AsyncStorage.setItem('token', response.data.item.Token)
                        } catch (err) {
                            console.log(err)
                        }

                        navigation.reset({
                            index: 0,
                            routes: [{
                                name: 'Slip',
                                params: {
                                    ref1: ref1,
                                    ref2: ref2,
                                    ref3: ref3,
                                    sourceAccount: sourceAccount,
                                    destinationAccount: destinationAccount,
                                    memo: memo,
                                    SLIP: response.data.item.SLIP_NO,
                                    CREATE_DATE: response.data.item.CREATE_DATE,
                                    other: other,
                                    favoritesArray: favorites,
                                    transactionType: 'ผ่อนชำระ',
                                }
                            }]
                        })
                    } else if (response.data.code === 0) {
                        setAlertTitle('ระบบขัดข้อง')
                        setAlertMessage('กรุณาตรวจสอบการทำรายการ หากไม่สำเร็จกรุณาลองใหม่อีกครั้ง')
                        setAlertType('Authen')
                    } else {
                        setAlertMessage(response.data.message)
                    }
                })
                .catch(err => {
                    if (err.message === 'Network Error') {
                        setAlertType('Authen')
                        setAlertMessage('กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่อีกครั้ง')
                    } else if (err.message === 'Request failed with status code 401') {
                        setAlertType('Authen')
                        setAlertMessage('คุณไม่ได้ทำรายการในเวลาที่กำหนด กรุณา Login อีกครั้ง')
                    }
                })
        }
    }

    const getFavorites = async (apiKey, token, API_URL) => {
        axios
            .post(`${API_URL}/Favorite`, {
                API_KEY: apiKey,
                TYPE: '01',
            }, {
                headers: {
                    APP_KEY: APP_KEY,
                    Authorization: `Bearer ${token}`
                }
            })
            .then(async (response) => {
                // console.log(response.data.item.FAVORITE)
                if (response.data.code === 10) {
                    const favorites = response.data.item.FAVORITE.filter(
                        favorite => favorite.TYPE === '01'
                    )

                    try {
                        await AsyncStorage.setItem('token', response.data.item.Token)
                    } catch (err) {
                        console.log(err)
                    }

                    setFavorites(favorites)
                    setIsLoading(false)
                }

                setIsLoading(false)
            })
            .catch(err => {
                console.log(err.message)
            })
    }

    useEffect(() => {
        const getToken = async () => {
            try {
                const StoreAPI_URL = await AsyncStorage.getItem('StoreAPI_URL')
                const token = await AsyncStorage.getItem('token')
                const apiKey = await AsyncStorage.getItem('confirmShareNumber')

                if (StoreAPI_URL !== null && token !== null && apiKey !== null) {
                    setAPI_URL(StoreAPI_URL)
                    setToken(token)
                    setApiKey(apiKey)

                    setTimeout(() => {
                        getFavorites(apiKey, token, StoreAPI_URL)
                    }, 1000)
                }
            } catch (err) {
                console.log(err)
            }
        }

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

    useEffect(() => {
        const backAction = () => {
            handleBackNavigator()
            return true
        }

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction)

        return () => backHandler.remove()
    })

    return (
        <View style={{ width: '100%', height: '100%' }}>
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
                    <View style={styles.subSection1}>
                        <Image style={styles.icon} source={require('../../assets/Ibnuauf-Logo-for-App.png')} />

                        <View>
                            <Text style={styles.primaryText}>{sourceAccount.ACCOUNT_NAME}</Text>
                            <Text style={styles.secondaryText} numberOfLines={1}>{sourceAccount.ACCOUNT_SHOW}</Text>
                            <Text style={styles.secondaryText} numberOfLines={1}>({sourceAccount.ACC_DESC})</Text>
                        </View>
                    </View>

                    <View style={{ paddingHorizontal: 22, marginVertical: 6 }}>
                        <AntDesign name='arrowdown' size={28} color='#aaa' alignItems='center' />
                    </View>

                    <View style={styles.subSection1}>
                        <Image style={styles.icon} source={require('../../assets/Ibnuauf-Logo-for-App.png')} />

                        <View>
                            <Text style={styles.primaryText}>
                                {destinationAccount.ACCOUNT_NAME || destinationAccount.NAME || other}
                            </Text>

                            <Text style={styles.secondaryText} numberOfLines={1}>
                                {destinationAccount.ACCOUNT_SHOW || destinationAccount.ACCOUNT_NO || destinationAccount.SHR_ || destinationAccount.LCONT_ID}
                            </Text>

                            <Text style={styles.secondaryText} numberOfLines={1}>
                                ({destinationAccount.ACC_DESC || destinationAccount.SHR_TYPE || destinationAccount.LSUB_NAME})
                            </Text>
                        </View>
                    </View>

                    <View style={[styles.section, { marginTop: 20 }]}>
                        <View style={styles.leftItem}>
                            <Text style={styles.primaryText}>จำนวนเงิน</Text>
                        </View>
                        <View style={styles.rightItem}>
                            <Text style={styles.largeText}>{prettyAmount(ref3)}</Text>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.leftItem}>
                            <Text style={styles.primaryText}>ค่าธรรมเนียม</Text>
                        </View>
                        <View style={styles.rightItem}>
                            <Text style={styles.largeText}>0.00</Text>
                        </View>
                    </View>

                    {
                        memo !== '' && (
                            <View style={styles.section}>
                                <View style={styles.leftItem}>
                                    <Text style={styles.primaryText}>บันทึกช่วยจำ</Text>
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

                <TouchableOpacity onPress={() => !isLoading && onSubmit()} style={styles.button} >
                    <Text style={styles.btnText}>ยืนยัน</Text>
                </TouchableOpacity>
            </View>

            <AppAlert
                visible={showAlert}
                title={alertMessage === '' ? '' : alertTitle}
                message={alertMessage === '' ? 'Loading...' : alertMessage}
                showConfirm={alertMessage !== ''}
                showCancel={false}
                onConfirm={onConfirmPressed}
                onCancel={() => setShowAlert(false)}
            />
        </View>
    )
}

export default CheckList

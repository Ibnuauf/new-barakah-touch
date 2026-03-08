/*
    หน้า SavingStatement คือหน้าสำหรับแสดงรายละเอียดของบัญชี และstatement การฝากถอน
*/

import React, { useEffect, useReducer, useState } from 'react'
import { View, Text, ActivityIndicator, ImageBackground, ScrollView, BackHandler, TouchableOpacity, Platform } from 'react-native'
import axios from 'axios'
import { ScaledSheet, scale } from 'react-native-size-matters'
import AppAlert from '../../components/AppAlert'
import AsyncStorage from '@react-native-async-storage/async-storage'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import { APP_KEY } from '../../environment'
import AppHeader2 from '../../components/AppHeader2'
import Statement from '../../components/Statement'
import { savingReducer, initialSavingState } from '../../reducers/savingReducer'
import ActionSheet from '../../components/ActionSheet'
import { getMonths, showMonth } from '../../util'
import { addScreenshotListener } from 'react-native-detector'

export default function SavingStatement({ route, navigation }) {
    const { ACCOUNT_NO } = route.params

    const [{ SAVING, STATEMENTS }, dispatch] = useReducer(savingReducer, initialSavingState)

    const [showAlert, setShowAlert] = useState(false)
    const [alertMessage, setAlertMessage] = useState('')
    const [modalVisible, setModalVisible] = useState(false)
    const [sixMonths, setSixMonths] = useState(null)
    const [month, setMonth] = useState(null)
    const [token, setToken] = useState(null)
    const [API_URL, setAPI_URL] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    const handleBackNavigator = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'Saving' }]
        })
    }

    const onSelect = item => {
        setMonth(showMonth(item))
        setIsLoading(true)

        axios
            .post(`${API_URL}/SavingDetail`, {
                ACCOUNT_NO: ACCOUNT_NO,
                MONTH: item.m,
                YEAR: item.y
            }, {
                headers: {
                    APP_KEY: APP_KEY,
                    Authorization: `Bearer ${token}`
                }
            })
            .then(async (response) => {
                if (response.data !== undefined) {
                    const saving = await response.data.item
                    const statements = await response.data.itemdetail.SavingDetail
                    const token = await response.data.itemdetail.Token

                    dispatch({ type: 'SET_SAVING', SAVING: saving, STATEMENTS: statements })
                    setIsLoading(false)

                    try {
                        await AsyncStorage.setItem('token', token)
                    } catch (err) {
                        console.log(err)
                    }
                }
            })
            .catch(err => {
                if (err.message === 'Network Error') {
                    setShowAlert(true)
                    setAlertMessage('กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่อีกครั้ง')
                } else if (err.message === 'Request failed with status code 401') {
                    setShowAlert(true)
                    setAlertMessage('คุณไม่ได้ทำรายการในเวลาที่กำหนด กรุณา Login อีกครั้ง')
                }
            })

        setModalVisible(false)
    }

    useEffect(() => {
        const getToken = async () => {
            const d = new Date()
            let year = d.getFullYear()
            let month = d.getMonth() + 1

            const months = getMonths()
            setSixMonths(months)

            setMonth(showMonth(months[0]))

            try {
                const StoreAPI_URL = await AsyncStorage.getItem('StoreAPI_URL')
                const token = await AsyncStorage.getItem('token')

                setAPI_URL(StoreAPI_URL)
                setToken(token)

                if (StoreAPI_URL !== null && token !== null) {
                    axios
                        .post(`${StoreAPI_URL}/SavingDetail`, {
                            ACCOUNT_NO: ACCOUNT_NO,
                            MONTH: month,
                            YEAR: year
                        }, {
                            headers: {
                                APP_KEY: APP_KEY,
                                Authorization: `Bearer ${token}`
                            }
                        })
                        .then(async (response) => {
                            if (response.data !== undefined) {
                                const saving = await response.data.item
                                const statements = await response.data.itemdetail.SavingDetail
                                const token = await response.data.itemdetail.Token

                                dispatch({ type: 'SET_SAVING', SAVING: saving, STATEMENTS: statements })

                                try {
                                    await AsyncStorage.setItem('token', token)
                                } catch (err) {
                                    console.log(err)
                                }
                            }
                        })
                        .catch(err => {
                            if (err.message === 'Network Error') {
                                setShowAlert(true)
                                setAlertMessage('กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่อีกครั้ง')
                            } else if (err.message === 'Request failed with status code 401') {
                                setShowAlert(true)
                                setAlertMessage('คุณไม่ได้ทำรายการในเวลาที่กำหนด กรุณา Login อีกครั้ง')
                            }
                        })
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

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        )

        return () => backHandler.remove()
    })

    if (SAVING === null) {
        return (
            <View style={{ flex: 1 }}>
                <AppHeader2 onPress={handleBackNavigator} />

                <View style={{ height: '92%', justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator color='#0000ff' />
                </View>

                <AppAlert
                    visible={showAlert}
                    title={alertMessage === '' ? alertMessage : ' ไม่สำเร็จ'}
                    message={alertMessage === '' ? 'Loading...' : alertMessage}
                    showConfirm={alertMessage !== ''}
                    showCancel={false}
                    onConfirm={() => {
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'PinInput' }]
                        })
                    }}
                    onCancel={() => setShowAlert(false)}
                />
            </View>
        )
    }
    return (
        <View style={{ flex: 1 }}>
            <AppHeader2 onPress={handleBackNavigator} />

            <View style={[styles.labelBox, { borderBottomColor: '#ccc', borderBottomWidth: 1 }]}>
                <Text style={styles.labelText}>บัญชีเงินฝาก</Text>
            </View>

            <View style={styles.container}>
                <View style={styles.cardContainer}>
                    <ImageBackground source={require('../../assets/card/saving24.png')} style={styles.image}>
                        <ScrollView horizontal={true} style={styles.accountName}>
                            <View style={{ justifyContent: 'center' }}>
                                <Text style={[styles.cardBoldText, { fontSize: scale(16) }]} numberOfLines={1}>{SAVING.ACCOUNT_NAME}</Text>
                            </View>
                        </ScrollView>
                        <View style={styles.accountNumber}>
                            <Text style={styles.cardText}>{SAVING.ACCOUNT_NO}</Text>
                            <Text style={styles.cardText}>{SAVING.ACC_DESC}</Text>
                        </View>
                        <View style={styles.balance}>
                            <Text style={styles.cardText}>ยอดเงินคงเหลือ (บาท)</Text>
                            <Text style={[styles.cardBoldText]}>{SAVING.BALANCE}</Text>
                        </View>
                        <View style={styles.balance}>
                            <Text style={styles.cardText}>ยอดเงินที่ใช้ได้ (บาท)</Text>
                            <Text style={[styles.cardBoldText, { fontSize: scale(18) }]}>{SAVING.AVAILABLE}</Text>
                        </View>
                    </ImageBackground>
                </View>
            </View>

            <View style={styles.labelBox}>
                <Text style={styles.labelText}>วันที่ทำรายการ</Text>
                <TouchableOpacity style={styles.monthButton} onPress={() => setModalVisible(true)}>
                    <Text style={styles.monthText}>{month}</Text>
                    <FontAwesome5 name='chevron-down' style={{ marginLeft: 6 }} size={14} color='#1677ff' />
                </TouchableOpacity>
            </View>

            {
                isLoading ? (
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <ActivityIndicator color='#0000ff' />
                    </View>
                ) : (
                    <Statement saving={SAVING} statements={STATEMENTS} />
                )
            }

            <ActionSheet
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                title='เลือกเดือน'
            >
                <ScrollView style={{ width: '100%' }}>
                    {
                        sixMonths.map((item, index) => (
                            <TouchableOpacity key={index} style={styles.modalItemBox} onPress={() => onSelect(item)}>
                                <Text style={styles.modalItemText}>{showMonth(item)}</Text>
                            </TouchableOpacity>
                        ))
                    }
                </ScrollView>
            </ActionSheet>
        </View>
    )
}

const styles = ScaledSheet.create({
    labelBox: {
        width: '100%',
        height: '50@vs',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: '14@msr',
        backgroundColor: '#ddd',
    },
    labelText: {
        fontFamily: 'Sarabun-Regular',
        fontSize: '15@s',
        color: '#333',
        paddingVertical: '1.5@vs'
    },
    container: {
        height: '30%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    cardContainer: {
        height: '90%',
        width: '90%',
        borderRadius: '12@s',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
        overflow: 'hidden'
    },
    image: {
        flex: 1,
        padding: '20@msr',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: '12@s',
    },
    balance: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        flex: 1,
    },
    accountNumber: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        flex: 1
    },
    accountName: {
        flexDirection: 'row',
        flex: 1,
        borderBottomColor: '#91caff',
        borderBottomWidth: 2,
        marginBottom: '10@s',
    },
    cardText: {
        fontFamily: 'Sarabun-Medium',
        fontSize: '14@s',
        color: '#fff',
        paddingVertical: '1.5@vs',
    },
    cardBoldText: {
        fontFamily: 'Sarabun-Bold',
        fontSize: '14@s',
        color: '#fff',
        paddingVertical: '1@vs',
    },
    modalHeaderContent: {
        alignSelf: 'flex-start',
        paddingLeft: '10@s'
    },
    modalText: {
        marginBottom: 15,
        fontFamily: 'Sarabun-Medium',
        fontSize: '14@s',
        color: '#434343',
    },
    modalItemBox: {
        borderBottomColor: '#f0f0f0',
        borderBottomWidth: 1,
        height: '50@vs',
        justifyContent: 'center',
        paddingHorizontal: '15@msr',
    },
    modalItemText: {
        fontFamily: 'Sarabun-Regular',
        fontSize: '14@s',
        color: '#595959',
        padding: '3@s',
    },
    monthButton: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    monthText: {
        fontFamily: 'Sarabun-Regular',
        color: '#1677ff',
        fontSize: 15
    }
})

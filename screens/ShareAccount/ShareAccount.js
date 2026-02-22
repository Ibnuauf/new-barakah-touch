/*
    หน้า ShareAccount คือหน้าสำหรับแสดงจำนวนหุ้นที่ผู้ใช้มี และแสดง statement การฝากหุ้น
*/

import React, { useEffect, useState, useReducer } from 'react'
import { View, Text, ActivityIndicator, ScrollView, ImageBackground, TouchableOpacity, Platform, BackHandler } from 'react-native'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ScaledSheet, scale } from 'react-native-size-matters'
import AppAlert from '../../components/AppAlert'
import NetInfo from '@react-native-community/netinfo'
import { addScreenshotListener } from 'react-native-detector'
import { APP_KEY } from '../../environment'
import AppHeader2 from '../../components/AppHeader2'
import { shareReducer, initialShareState } from '../../reducers/shareReducer'
import StatementDetail from '../../components/StatementDetail'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import { statementStyles } from '../../components/Statement'

export default function ShareAccount({ route, navigation }) {
    const [{ SHARE, STATEMENTS }, dispatch] = useReducer(shareReducer, initialShareState)

    const [showAlert, setShowAlert] = useState(false)
    const [alertMessage, setAlertMessage] = useState('')
    const [id, setId] = useState(null)

    const handleBackNavigator = () => {
        dispatch({ type: 'CLEAR_SHARE' })
        navigation.goBack()
    }

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

    useEffect(() => {
        const getToken = async () => {
            try {
                const StoreAPI_URL = await AsyncStorage.getItem('StoreAPI_URL')
                const token = await AsyncStorage.getItem('token')
                const apiKey = await AsyncStorage.getItem('confirmShareNumber')
                if (StoreAPI_URL !== null && token !== null && apiKey !== null) {
                    axios
                        .post(`${StoreAPI_URL}/Shr`, {
                            API_KEY: apiKey
                        }, {
                            headers: {
                                APP_KEY: APP_KEY,
                                Authorization: `Bearer ${token}`
                            }
                        })
                        .then(async (response) => {
                            // console.log(response.data)
                            if (response.data !== undefined) {
                                dispatch({ type: 'SET_SHARE', SHARE: response.data.item, STATEMENTS: response.data.itemdetail.SHR_DETAIL })

                                try {
                                    await AsyncStorage.setItem('token', response.data.itemdetail.Token)
                                } catch (err) {
                                    console.log(err)
                                }
                            }
                        })
                        .catch(err => {
                            if (err.message === 'Network Error') {
                                setShowAlert(true)
                                setAlertMessage('ไม่สามารถทำรายการได้ กรุณาลองใหม่อีกครั้ง')
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

        const unsubscribe = NetInfo.addEventListener((state) => {
            if (state.isInternetReachable) {
                getToken()
            } else {
                setShowAlert(true)
                setAlertMessage('กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตและลองใหม่อีกครั้ง')
            }
        })

        return () => {
            unsubscribe()
        }
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

    if (SHARE === null) {
        return (
            <View style={{ flex: 1 }}>
                <AppHeader2 />

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
    } else {
        return (
            <View style={{ flex: 1 }}>
                <AppHeader2 onPress={handleBackNavigator} />

                <View style={[styles.labelBox, { borderBottomColor: '#ccc', borderBottomWidth: 1 }]}>
                    <Text style={styles.labelText}>บัญชีหุ้น</Text>
                </View>

                <View style={styles.container}>
                    <View style={styles.cardContainer}>
                        <ImageBackground source={require('../../assets/card/saving1.png')} style={styles.image}>
                            <View style={styles.accountName}>
                                <Text style={styles.cardBoldText} numberOfLines={1}>{SHARE.NAME}</Text>
                            </View>
                            <View style={styles.accountNumber}>
                                <Text style={styles.cardText}>{SHARE.SHR_}</Text>
                                <Text style={styles.cardText}>สมาชิกทั่วไป</Text>
                            </View>
                            <View style={styles.balance}>
                                <Text style={styles.cardText}>ยอดหุ้นคงเหลือ (บาท)</Text>
                                <Text style={[styles.cardBoldText, { fontSize: scale(18) }]}>{SHARE.SHR_SUM_BTH}</Text>
                            </View>
                        </ImageBackground>
                    </View>
                </View>

                <View style={styles.labelBox}>
                    <Text style={styles.labelText}>วันที่ทำรายการ</Text>
                    <Text style={styles.labelText}>จำนวนเงิน</Text>
                </View>

                <ScrollView style={{ width: '100%', height: '56%' }}>
                    {
                        STATEMENTS.map((statement, i) => (
                            <TouchableOpacity
                                key={i}
                                activeOpacity={0.8}
                                onPress={() => id !== i ? setId(i) : setId(null)}
                            >
                                <View style={statementStyles.statementBox}>
                                    <View style={statementStyles.detailsBox}>
                                        <Text style={statementStyles.statementText}>{statement.FLG_PRN}</Text>
                                        <Text style={statementStyles.secondaryText}>{statement.DATE_TODAY}</Text>
                                    </View>

                                    <View style={statementStyles.amountBox}>
                                        <Text style={[statementStyles.statementText, styles.amountText]}>+ {statement.TMP_SHARE_BHT} บาท</Text>
                                    </View>

                                    <View style={statementStyles.iconBox}>
                                        {
                                            id === i ? (
                                                <FontAwesome5 name='chevron-up' style={{ marginRight: 6 }} size={16} color='#ccc' />
                                            ) : (
                                                <FontAwesome5 name='chevron-down' style={{ marginRight: 6 }} size={16} color='#ccc' />
                                            )
                                        }
                                    </View>
                                </View>

                                {
                                    id === i && (
                                        <StatementDetail statement={statement} />
                                    )
                                }
                            </TouchableOpacity>
                        ))
                    }
                </ScrollView>
            </View>
        )
    }
}

const styles = ScaledSheet.create({
    labelBox: {
        width: '100%',
        height: '50@vs',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: '14@s',
        backgroundColor: '#ddd',
    },
    labelText: {
        fontFamily: 'Sarabun-Regular',
        fontSize: '15@s',
        color: '#333',
        paddingVertical: '1.5@vs'
    },
    amountText: {
        color: '#52c41a',
        fontSize: 17
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
            width: '0@s',
            height: '4@s',
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
        overflow: 'hidden'
    },
    image: {
        flex: 1,
        padding: '15@s',
        justifyContent: 'center',
        borderRadius: '12@s',
    },
    balance: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: '10@vs'
    },
    accountNumber: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: '10@vs'
    },
    accountName: {
        paddingVertical: 10,
        borderBottomColor: '#187bcd',
        borderBottomWidth: '2@s',
        marginBottom: '8@s'
    },
    cardText: {
        fontFamily: 'Sarabun-Regular',
        fontSize: '14@s',
        color: '#fff',
        paddingVertical: '1.5@vs',
    },
    cardBoldText: {
        fontFamily: 'Sarabun-Medium',
        fontSize: '18@s',
        color: '#fff',
        paddingVertical: '2@vs'
    },
})

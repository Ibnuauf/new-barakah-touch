/*
    หน้า MembershipCard จะโชว์ข้อมูลบัตรสมาชิก
*/

import React, { useEffect, useState, useReducer } from 'react'
import { View, Text, ActivityIndicator, ImageBackground, ScrollView, Platform, BackHandler } from 'react-native'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ScaledSheet, scale } from 'react-native-size-matters'
import AppAlert from '../../components/AppAlert'
import NetInfo from '@react-native-community/netinfo'
import { addScreenshotListener } from 'react-native-detector'
import { APP_KEY } from '../../environment'
import AppHeader2 from '../../components/AppHeader2'
import Barcode from '../../components/Barcode'
import { memberReducer, initialMemberState } from '../../reducers/memberReducer'

export default function MembershipCard({ route, navigation }) {
    const [{ MEMBER, COUPONS }, dispatch] = useReducer(memberReducer, initialMemberState)

    const [showAlert, setShowAlert] = useState(false)
    const [alertMessage, setAlertMessage] = useState('')

    const handleBackNavigator = () => {
        dispatch({ type: 'CLEAR_MEMBER' })
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
                        .post(`${StoreAPI_URL}/MemCard`, {
                            API_KEY: apiKey
                        }, {
                            headers: {
                                APP_KEY: APP_KEY,
                                Authorization: `Bearer ${token}`
                            }
                        })
                        .then(async (response) => {
                            // console.log(response.data)
                            if (response.data === undefined) {
                                navigation.reset({
                                    index: 0,
                                    routes: [{ name: 'PinInput' }]
                                })
                            } else if (response.data.item) {
                                dispatch({ type: 'SET_MEMBER', MEMBER: response.data.item, COUPONS: response.data.itemdetail.COUPON })

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

    if (MEMBER === null) {
        return (
            <View style={{ flex: 1 }}>
                <AppHeader2 />

                <View style={{ height: '92%', justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator color="#0000ff" />
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

                <View style={styles.container}>
                    <View style={styles.cardContainer}>
                        <ImageBackground source={require('../../assets/card/member.png')} style={styles.image}>
                            <View style={styles.barcodeContainer}>
                                <Barcode
                                    value={'9' + MEMBER.MEM}
                                    options={{ format: 'CODE39' }}
                                />
                            </View>
                        </ImageBackground>
                    </View>
                </View>

                <View style={styles.labelBox}>
                    <Text style={styles.labelText}>คูปองส่วนลด</Text>
                    <Text style={styles.labelText}>คะแนนสะสม {MEMBER.COUPON_POINT} คะแนน</Text>
                </View>

                <ScrollView style={{ width: '100%', height: '60%' }}>
                    {
                        COUPONS.map((coupon, i) => (
                            <View key={i} style={styles.statementBox}>
                                <View style={styles.detailsBox}>
                                    <Text style={styles.statementText}>หมดอายุ {coupon.EXPIRE_DATE}</Text>
                                    <Text style={styles.secondaryText}>ซื้อขั้นต่ำ {coupon.BUY_MIN} บาท</Text>
                                </View>
                                <View style={styles.amountBox}>
                                    <View style={styles.amountDetailBox}>
                                        <Text style={[styles.statementText, { color: 'green' }]}>{coupon.COUPON_AMOUNT} บาท</Text>
                                    </View>
                                </View>
                            </View>
                        ))
                    }
                </ScrollView>
            </View>
        )
    }
}

const styles = ScaledSheet.create({
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
        alignItems: 'center',
        borderRadius: '15@s',
    },
    barcodeContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        height: '57%',
        width: '80%',
    },
    labelBox: {
        width: '100%',
        height: '55@vs',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: '14@msr',
        backgroundColor: '#ddd',
    },
    labelText: {
        fontFamily: 'Sarabun-Regular',
        fontSize: '15@s',
        color: '#333'
    },
    statementBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: '65@vs',
        paddingHorizontal: '14@msr',
        borderBottomColor: '#ccc',
        borderBottomWidth: 1
    },
    statementText: {
        fontFamily: 'Sarabun-Regular',
        fontSize: '14@s',
        color: '#333',
        padding: 3
    },
    secondaryText: {
        fontSize: '13@s',
        color: '#777',
        fontFamily: 'Sarabun-Light',
        padding: 3
    },
    amountBox: {
        flexDirection: 'row',
        width: '50%',
        justifyContent: 'space-around',
        alignItems: 'center'
    },
    detailsBox: {
        width: '50%',
        justifyContent: 'space-evenly',
    },
    amountDetailBox: {
        flex: 1,
        alignItems: 'flex-end',
    },
    emptyText: {
        fontFamily: 'Sarabun-Light',
        fontSize: scale(14),
        width: '100%',
        textAlign: 'center'
    },
    emptyContainer: {
        height: '92%',
        justifyContent: 'center',
        alignItems: 'center'
    }
})
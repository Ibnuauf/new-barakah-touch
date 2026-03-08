/*
    หน้า Loan คือหน้าสำหรับแสดงจำนวนสินเชื่อที่ผู้ใช้มีทั้งหมด
*/

import React, { useEffect, useState, useReducer } from 'react'
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, BackHandler, SafeAreaView, Platform } from 'react-native'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ScaledSheet } from 'react-native-size-matters'
import AppAlert from '../../components/AppAlert'
import NetInfo from '@react-native-community/netinfo'
import { addScreenshotListener } from 'react-native-detector'
import { APP_KEY } from '../../environment'
import AppHeader2 from '../../components/AppHeader2'
import { prettyAmount, getAmount } from '../../util'
import { loanListReducer, initialLoanListState } from '../../reducers/loanListReducer'

export default function Loan({ route, navigation }) {
    const [{ LOAN_LIST }, dispatch] = useReducer(loanListReducer, initialLoanListState)

    const [showAlert, setShowAlert] = useState(false)
    const [alertMessage, setAlertMessage] = useState('')
    const [totalDebt, setTotalDebt] = useState(0)
    const [showBalance, setShowBalance] = useState(false)

    const handleBackNavigator = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }]
        })
    }

    const alert = () => {
        return (
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
        )
    }

    useEffect(() => {
        const getToken = async () => {
            try {
                const StoreAPI_URL = await AsyncStorage.getItem('StoreAPI_URL')
                const token = await AsyncStorage.getItem('token')
                const apiKey = await AsyncStorage.getItem('confirmShareNumber')
                if (StoreAPI_URL !== null && token !== null && apiKey !== null) {
                    axios
                        .post(`${StoreAPI_URL}/Loan`, {
                            API_KEY: apiKey
                        }, {
                            headers: {
                                APP_KEY: APP_KEY,
                                Authorization: `Bearer ${token}`
                            }
                        })
                        .then(async (response) => {
                            // console.log(response.data)
                            if (response.data.code === 10) {
                                dispatch({ type: 'SET_LOAN_LIST', LOAN_LIST: response.data.item })

                                const totalDebt = (response.data.item).reduce((accumulator, object) => {
                                    const debt = getAmount(object.LCONT_AMOUNT_SAL.split('.').join('')) / 100
                                    return accumulator + debt
                                }, 0)

                                setTotalDebt(totalDebt)

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

    if (LOAN_LIST === null) {
        return (
            <View style={{ flex: 1 }}>
                <AppHeader2 onPress={handleBackNavigator} />

                <View style={styles.emptyContainer}>
                    <ActivityIndicator color='#0000ff' />
                </View>

                {
                    alert()
                }
            </View>
        )
    } else {
        if (LOAN_LIST !== undefined && LOAN_LIST.length > 0) {
            return (
                <View style={styles.container}>
                    <AppHeader2 onPress={handleBackNavigator} />

                    <View style={[styles.labelBox, { borderBottomColor: '#ccc', borderBottomWidth: 1 }]}>
                        <Text style={styles.labelText}>สินเชื่อ</Text>
                    </View>

                    {
                        showBalance ? (
                            <TouchableOpacity
                                style={styles.toggleButton}
                                activeOpacity={0.7}
                                onPress={() => setShowBalance(!showBalance)}
                            >
                                <Text style={[styles.statementText, { color: '#ff7875' }]}>ซ่อนยอดหนี้รวม</Text>
                                <FontAwesome5 name='chevron-up' size={16} color='#ff7875' style={{ marginLeft: 4 }} />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={styles.toggleButton}
                                activeOpacity={0.7}
                                onPress={() => setShowBalance(!showBalance)}
                            >
                                <Text style={[styles.statementText, { color: '#ff7875' }]}>แสดงยอดหนี้รวม</Text>
                                <FontAwesome5 name='chevron-right' size={14} color='#ff7875' style={{ marginLeft: 4 }} />
                            </TouchableOpacity>
                        )
                    }

                    <SafeAreaView style={styles.showDebtArea}>
                        <ScrollView style={{ width: '100%', height: '60%' }}>
                            {
                                showBalance && (
                                    <View style={styles.totalDebtContainer}>
                                        <View style={styles.totalDebtCard}>
                                            <Text style={[styles.secondaryText, { marginTop: 0 }]}>ยอดหนี้คงเหลือรวมทั้งหมด</Text>
                                            <Text style={styles.totalDebtTxt}>{prettyAmount(totalDebt)} บาท</Text>
                                        </View>
                                    </View>
                                )
                            }

                            {
                                LOAN_LIST.map((data, i) => (
                                    <TouchableOpacity
                                        key={i}
                                        style={styles.statementBox}
                                        onPress={() => navigation.navigate('LoanDetail', { LCONT_ID: data.LCONT_ID, CODE: data.CODE })}
                                    >
                                        <View style={styles.detailsBox}>
                                            <Text style={styles.statementText} numberOfLines={1}>{data.LCONT_ID}</Text>
                                            <Text style={styles.secondaryText}>{data.LSUB_NAME}</Text>
                                        </View>
                                        <View style={styles.amountBox}>
                                            <View style={styles.amountDetailBox}>
                                                <Text style={[styles.statementText, { color: '#ff7875' }]} numberOfLines={1}>{data.LCONT_AMOUNT_SAL} บาท</Text>
                                                <Text style={styles.secondaryText} numberOfLines={1}>ยอดหนี้คงเหลือ</Text>
                                            </View>
                                            <FontAwesome5 name='chevron-right' size={14} color='#ccc' />
                                        </View>
                                    </TouchableOpacity>
                                ))
                            }
                        </ScrollView>
                    </SafeAreaView>

                    {
                        alert()
                    }
                </View>
            )
        } else {
            return (
                <View style={{ flex: 1 }}>
                    <AppHeader2 onPress={handleBackNavigator} />

                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}> ไม่พบข้อมูลสินเชื่อ</Text>
                    </View>

                    {
                        alert()
                    }
                </View>
            )
        }
    }
}

const styles = ScaledSheet.create({
    container: {
        flex: 1,
    },
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
    statementBox: {
        flexDirection: 'row',
        paddingHorizontal: 10,
        paddingVertical: 20,
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: '#fff',
        width: '95%',
        marginVertical: '4@vs',
        borderRadius: 10,
        shadowColor: '#333',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 2,
    },
    detailsBox: {
        width: '50%',
        justifyContent: 'center',
    },
    statementText: {
        fontFamily: 'Sarabun-Regular',
        fontSize: '14@s',
        color: '#333',
        paddingVertical: '1.5@vs'
    },
    amountBox: {
        flexDirection: 'row',
        width: '50%',
        alignItems: 'center'
    },
    secondaryText: {
        fontFamily: 'Sarabun-Light',
        fontSize: '13@s',
        color: '#333',
        paddingVertical: '2@vs',
        marginTop: '5@vs'
    },
    amountDetailBox: {
        flex: 1,
        alignItems: 'flex-end',
        marginRight: 4
    },
    emptyText: {
        fontFamily: 'Sarabun-Light',
        fontSize: '14@s',
        width: '100%',
        textAlign: 'center',
        paddingVertical: 3
    },
    emptyContainer: {
        height: '92%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    totalDebtContainer: {
        paddingVertical: '10@vs',
        justifyContent: 'center',
        alignItems: 'center',
    },
    totalDebtCard: {
        backgroundColor: '#fff',
        alignItems: 'center',
        width: '90%',
        paddingVertical: '12@vs',
        borderRadius: 16,
        shadowColor: '#333',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 2,
    },
    totalDebtTxt: {
        fontFamily: 'Sarabun-Medium',
        fontSize: '18@s',
        color: '#ff7875',
    },
    showDebtArea: {
        flex: 1,
        backgroundColor: '#fefefe',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20
    },
    toggleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10
    }
})

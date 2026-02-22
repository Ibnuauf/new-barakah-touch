/*
    หน้า LoanDetail คือหน้าสำหรับแสดงรายละเอียดของสินเชื่อ และstatement การผ่อน
*/

import React, { useEffect, useReducer, useState } from 'react'
import { View, Text, ScrollView, ActivityIndicator, BackHandler, TouchableOpacity, Platform } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'
import AppAlert from '../../components/AppAlert'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import AppHeader2 from '../../components/AppHeader2'
import { APP_KEY } from '../../environment'
import { initialLoanState, loanReducer } from '../../reducers/loanReducer'
import StatementDetail from '../../components/StatementDetail'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import { statementStyles } from '../../components/Statement'
import { addScreenshotListener } from 'react-native-detector'
import { getAmount, prettyAmount } from '../../util'

export default function LoanDetail({ route, navigation }) {
    const { LCONT_ID, CODE } = route.params

    const [{ LOAN, STATEMENTS }, dispatch] = useReducer(loanReducer, initialLoanState)

    const [showAlert, setShowAlert] = useState(false)
    const [alertMessage, setAlertMessage] = useState('')
    const [id, setId] = useState(null)
    const [chart, setChart] = useState(null)

    const handleBackNavigator = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'Loan' }]
        })
    }

    useEffect(() => {
        const getToken = async () => {
            try {
                const StoreAPI_URL = await AsyncStorage.getItem('StoreAPI_URL')
                const token = await AsyncStorage.getItem('token')
                if (StoreAPI_URL !== null && token !== null) {
                    axios
                        .post(`${StoreAPI_URL}/LoanDetail`, {
                            LCONT_ID: LCONT_ID,
                            CODE: CODE
                        }, {
                            headers: {
                                APP_KEY: APP_KEY,
                                Authorization: `Bearer ${token}`
                            }
                        })
                        .then(async (response) => {
                            if (response.data.code === 10) {
                                dispatch({ type: 'SET_LOAN', LOAN: response.data.item, STATEMENTS: response.data.itemdetail.PAYDEPT })

                                setChart(response.data.itemdetail.OTHER)

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

    if (LOAN === null) {
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
    } else {
        return (
            <View style={{ flex: 1 }}>
                <AppHeader2 onPress={handleBackNavigator} />

                <View style={[styles.labelBox, { borderBottomColor: '#ccc', borderBottomWidth: 1 }]}>
                    <Text style={styles.labelText}>สินเชื่อ</Text>
                </View>

                <View style={styles.infoBox}>
                    <Text style={[styles.infoText, { fontFamily: 'Sarabun-Regular' }]}>เลขสัญญา</Text>
                    <Text style={styles.infoText}>{LOAN.LCONT_ID}</Text>
                </View>
                <View style={styles.infoBox}>
                    <Text style={[styles.infoText, { fontFamily: 'Sarabun-Regular' }]}>ประเภทสินเชื่อ</Text>
                    <Text style={styles.infoText}>{LOAN.LSUB_NAME}</Text>
                </View>
                <View style={styles.infoBox}>
                    <Text style={[styles.infoText, { fontFamily: 'Sarabun-Regular' }]}>ผ่อนต่อเดือน</Text>
                    <Text style={styles.infoText}>{LOAN.LCONT_SAL}</Text>
                </View>
                <View style={styles.infoBox}>
                    <Text style={[styles.infoText, { fontFamily: 'Sarabun-Regular' }]}>วันที่หมดสัญญา</Text>
                    <Text style={styles.infoText}>{LOAN.DATE_END}</Text>
                </View>
                <View style={styles.infoBox}>
                    <Text style={[styles.infoText, { fontFamily: 'Sarabun-Regular' }]}>ยอดหนี้คงเหลือ</Text>
                    <Text style={styles.infoText}>{LOAN.LCONT_AMOUNT_SAL}</Text>
                </View>
                {
                    !LOAN.OVERDUE || getAmount(LOAN.OVERDUE) === 0 ? (
                        null
                    ) : (
                        <View style={styles.infoBox}>
                            <Text style={[styles.infoText, { fontFamily: 'Sarabun-Regular', color: '#ff4d4f' }]}>ยอดหนี้ค้าง</Text>
                            <Text style={[styles.infoText, { fontFamily: 'Sarabun-Regular', color: '#ff4d4f' }]}>{LOAN.OVERDUE}</Text>
                        </View>
                    )
                }
                {
                    !chart || chart === 0 ? (
                        null
                    ) : (
                        <View style={styles.infoBox}>
                            <Text style={[styles.infoText, { fontFamily: 'Sarabun-Regular', color: '#ff4d4f' }]}>ค่าติดตามและดำเนินคดี</Text>
                            <Text style={[styles.infoText, { fontFamily: 'Sarabun-Regular', color: '#ff4d4f' }]}>{prettyAmount(chart)}</Text>
                        </View>
                    )
                }

                <View style={styles.labelBox}>
                    <Text style={styles.labelText}>วันที่ทำรายการ</Text>
                    <Text style={styles.labelText}>จำนวนเงิน</Text>
                </View>

                <ScrollView style={{ width: '100%', height: '60%' }}>
                    {
                        STATEMENTS.map((statement, i) => (
                            <TouchableOpacity
                                key={i}
                                activeOpacity={0.8}
                                onPress={() => id !== i ? setId(i) : setId(null)}
                            >
                                <View style={statementStyles.statementBox}>
                                    <View style={statementStyles.detailsBox}>
                                        <Text style={statementStyles.statementText} numberOfLines={1}>{statement.DATE_TODAY}</Text>
                                        <Text style={statementStyles.secondaryText}>หนี้คงเหลือ {statement.LCONT_BAL_AMOUNT}</Text>
                                    </View>

                                    <View style={statementStyles.amountBox}>
                                        <Text style={[statementStyles.statementText, styles.amountText]} numberOfLines={1}>{statement.SUM_SAL} บาท</Text>
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
        paddingHorizontal: '14@msr',
        backgroundColor: '#ddd',
    },
    labelText: {
        fontFamily: 'Sarabun-Regular',
        fontSize: '15@s',
        color: '#333',
        paddingVertical: '1.5@vs'
    },
    infoText: {
        fontFamily: 'Sarabun-Light',
        fontSize: '14@s',
        color: '#333',
        paddingVertical: '1.5@vs',
    },
    infoBox: {
        width: '100%',
        height: '36@vs',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: '14@msr'
    },
    amountText: {
        color: '#52c41a',
        fontSize: 17
    },
})


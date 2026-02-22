/*
    หน้า Saving คือหน้าสำหรับแสดงจำนวนบัญชีเงินฝากที่ผู้ใช้มีทั้งหมด
*/

import React, { useEffect, useState, useReducer } from 'react'
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, BackHandler, Image, SafeAreaView, Platform } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ScaledSheet } from 'react-native-size-matters'
import AppAlert from '../../components/AppAlert'
import NetInfo from '@react-native-community/netinfo'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import { addScreenshotListener } from 'react-native-detector'
import { APP_KEY } from '../../environment'
import AppHeader2 from '../../components/AppHeader2'
import { savingListReducer, initialSavingListState } from '../../reducers/savingListReducer'
import { getAccountType, prettyAmount, removeDash, getAmount } from '../../util'

const SavingGroup = ({ savings, type }) => {
    const navigation = useNavigation()

    return (
        <View style={styles.groupContainer}>
            <View style={styles.lableBox}>
                <Text style={styles.labelTxt}>{type}</Text>
            </View>

            {
                savings?.length > 0 && (
                    savings.map((item, index) => (
                        <TouchableOpacity key={index} style={styles.statementBox} onPress={() => navigation.navigate('SavingStatement', { ACCOUNT_NO: item.ACCOUNT_NO })}>
                            <Image
                                source={
                                    getAccountType(removeDash(item.ACCOUNT_SHOW)) === '02' ? require('../../assets/card/saving2-crop.png') :
                                        getAccountType(removeDash(item.ACCOUNT_SHOW)) === '03' ? require('../../assets/card/saving3-crop.png') :
                                            getAccountType(removeDash(item.ACCOUNT_SHOW)) === '05' ? require('../../assets/card/saving4-crop.png') : require('../../assets/card/saving2.png')
                                }
                                style={styles.img}
                            />

                            <View style={{ flex: 1, marginLeft: 10 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text style={styles.statementText} numberOfLines={1}>{item.ACCOUNT_SHOW}</Text>
                                    <Text style={[styles.statementText, { color: '#1890ff' }]} numberOfLines={1}>{item.BALANCE} บาท</Text>
                                </View>

                                <Text style={styles.secondaryText} numberOfLines={1} ellipsizeMode='middle'>{item.ACCOUNT_NAME}</Text>
                            </View>

                            <FontAwesome5 name='chevron-right' size={16} color='#ccc' />

                        </TouchableOpacity>
                    ))
                )
            }
        </View>
    )
}

export default function Saving({ route, navigation }) {
    const [{ SAVING_LIST }, dispatch] = useReducer(savingListReducer, initialSavingListState)

    const [showAlert, setShowAlert] = useState(false)
    const [alertMessage, setAlertMessage] = useState('')
    const [totalBalance, setTotalBalance] = useState(0)
    const [wadiah, setWadiah] = useState([])
    const [mudarabah, setMudarabah] = useState([])
    const [hajj, setHajj] = useState([])
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

    const classifySaving = (savingsAccount) => {
        const wadiah = savingsAccount.filter(
            item => item.ACC_TYPE === '02'
        )

        const mudarabah = savingsAccount.filter(
            item => item.ACC_TYPE === '03'
        )

        const hajj = savingsAccount.filter(
            item => item.ACC_TYPE === '05'
        )

        setWadiah(wadiah)
        setMudarabah(mudarabah)
        setHajj(hajj)
    }

    useEffect(() => {
        const getToken = async () => {
            try {
                const StoreAPI_URL = await AsyncStorage.getItem('StoreAPI_URL')
                const token = await AsyncStorage.getItem('token')
                const apiKey = await AsyncStorage.getItem('confirmShareNumber')
                if (StoreAPI_URL !== null && token !== null && apiKey !== null) {
                    axios
                        .post(`${StoreAPI_URL}/Saving`, {
                            API_KEY: apiKey
                        }, {
                            headers: {
                                APP_KEY: APP_KEY,
                                Authorization: `Bearer ${token}`
                            }
                        })
                        .then(async (response) => {
                            // console.log(response.data.item)
                            if (response.data !== undefined) {
                                dispatch({ type: 'SET_SAVING_LIST', SAVING_LIST: response.data.item })

                                classifySaving(response.data.item)

                                const totalBalance = (response.data.item).reduce((accumulator, object) => {
                                    const balance = getAmount(object.BALANCE.split('.').join('')) / 100
                                    return accumulator + balance
                                }, 0)

                                setTotalBalance(totalBalance)

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

    if (SAVING_LIST === null) {
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
        if (SAVING_LIST.length > 0) {
            return (
                <View style={styles.container}>
                    <AppHeader2 onPress={handleBackNavigator} />

                    <View style={[styles.labelBox, { borderBottomColor: '#ccc', borderBottomWidth: 1 }]}>
                        <Text style={styles.labelText}>เงินฝาก</Text>
                    </View>

                    {
                        showBalance ? (
                            <TouchableOpacity
                                style={styles.toggleButton}
                                activeOpacity={0.7}
                                onPress={() => setShowBalance(!showBalance)}
                            >
                                <Text style={[styles.statementText, { color: '#1890ff' }]}>ซ่อนยอดเงินรวม</Text>
                                <FontAwesome5 name='chevron-up' size={16} color='#1890ff' style={{ marginLeft: 4 }} />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={styles.toggleButton}
                                activeOpacity={0.7}
                                onPress={() => setShowBalance(!showBalance)}
                            >
                                <Text style={[styles.statementText, { color: '#1890ff' }]}>แสดงยอดเงินรวม</Text>
                                <FontAwesome5 name='chevron-right' size={16} color='#1890ff' style={{ marginLeft: 4 }} />
                            </TouchableOpacity>
                        )
                    }

                    <SafeAreaView style={styles.showSavingsArea}>
                        <ScrollView>
                            {
                                showBalance && (
                                    <View style={styles.totalBalanceContainer}>
                                        <View style={styles.totalBalanceCard}>
                                            <Text style={[styles.secondaryText, { marginTop: 0 }]}>ยอดเงินรวมทุกบัญชี</Text>
                                            <Text style={styles.totalBalanceTxt}>{prettyAmount(totalBalance)} บาท</Text>
                                        </View>
                                    </View>
                                )
                            }

                            {
                                wadiah?.length > 0 && <SavingGroup savings={wadiah} type={'วาดีอะฮ์'} />
                            }
                            {
                                mudarabah?.length > 0 && <SavingGroup savings={mudarabah} type={'มูฎอรอบะฮ์'} />
                            }
                            {
                                hajj?.length > 0 && <SavingGroup savings={hajj} type={'กองทุนฮัจญ์และอุมเราะฮฺ'} />
                            }
                        </ScrollView>
                    </SafeAreaView>
                </View>
            )
        } else {
            return (
                <View style={{ flex: 1 }}>
                    <AppHeader />

                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}> ไม่พบข้อมูลบัญชีเงินฝาก</Text>
                    </View>
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
        paddingHorizontal: 6,
        paddingVertical: 20,
        alignItems: 'center',
        backgroundColor: '#fff',
        width: '100%',
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
    statementText: {
        fontFamily: 'Sarabun-Regular',
        fontSize: '14@s',
        color: '#333'
    },
    secondaryText: {
        fontFamily: 'Sarabun-Light',
        fontSize: '13@s',
        color: '#333',
        paddingVertical: '1.5@vs',
        marginTop: '2@vs'
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
    totalBalanceContainer: {
        paddingVertical: '10@vs',
        justifyContent: 'center',
        alignItems: 'center',
    },
    totalBalanceCard: {
        backgroundColor: '#fff',
        alignItems: 'center',
        width: '90%',
        paddingVertical: '12@vs',
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
    totalBalanceTxt: {
        fontFamily: 'Sarabun-Medium',
        fontSize: '18@s',
        color: '#1890ff',
    },
    img: {
        width: 35,
        height: 25,
        borderRadius: 5,
        marginRight: 8,
        marginLeft: 6,
        opacity: 0.6
    },
    groupContainer: {
        width: '95%',
        alignItems: 'center',
        marginVertical: 5,
        alignSelf: 'center'
    },
    lableBox: {
        backgroundColor: '#bae7ff',
        padding: 6,
        width: '100%',
        marginBottom: 5,
        borderRadius: 5
    },
    labelTxt: {
        fontFamily: 'Sarabun-Light',
        fontSize: 15,
        paddingVertical: '1.5@vs'
    },
    showSavingsArea: {
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

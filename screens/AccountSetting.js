import React, { useState, useEffect } from 'react'
import { Text, View, StatusBar, TouchableOpacity, ActivityIndicator, BackHandler, Platform, SafeAreaView } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import AntDesign from 'react-native-vector-icons/AntDesign'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import AppAlert from '../components/AppAlert'
import { APP_KEY, PRIMARY_COLOR } from '../environment'
import { accountNumberFormat } from '../util'
import { addScreenshotListener } from 'react-native-detector'

const AccountSetting = ({ navigation }) => {
    const [showAlert, setShowAlert] = useState(false)
    const [alertMessage, setAlertMessage] = useState('')
    const [message, setMessage] = useState('')
    const [mainAccount, setMainAccount] = useState(null)
    const [isLoading, setIsLoaing] = useState(true)

    const handleBackNavigator = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }]
        })
    }

    const edit = () => {
        navigation.navigate('CreateMainAccount', { accountNo: !mainAccount ? null : mainAccount.ACCOUNT_NO })
    }

    useEffect(() => {
        const getToken = async () => {
            try {
                const StoreAPI_URL = await AsyncStorage.getItem('StoreAPI_URL')
                const token = await AsyncStorage.getItem('token')
                const apiKey = await AsyncStorage.getItem('confirmShareNumber')

                if (StoreAPI_URL !== null && token !== null && apiKey !== null) {
                    axios
                        .post(`${StoreAPI_URL}/GetMainAccount`, {
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
                                setMainAccount(item)

                                try {
                                    await AsyncStorage.setItem('token', itemdetail)
                                } catch (err) {
                                    console.log(err)
                                }
                            } else if (code === 20) {
                                setMessage(message)

                                try {
                                    await AsyncStorage.setItem('token', item)
                                } catch (err) {
                                    console.log(err)
                                }
                            }

                            setIsLoaing(false)
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
                <Text style={styles.labelText}>บัญชีหลัก</Text>
                {
                    mainAccount && (
                        <TouchableOpacity onPress={edit}>
                            <Text style={styles.buttonText}>แก้ไข</Text>
                        </TouchableOpacity>
                    )
                }
            </View>

            {
                isLoading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator color='#0000ff' />
                    </View>
                ) : (
                    !mainAccount ? (
                        <View style={styles.emptyContainer}>
                            <Text style={[styles.text, styles.secondaryTextActive]}>{message}</Text>

                            <TouchableOpacity style={styles.addBtn} onPress={edit}>
                                <AntDesign name='pluscircle' size={20} color='#1890ff' />

                                <Text style={[styles.text, { fontSize: 15, color: '#1890ff', marginLeft: 6 }]}>เพิ่มบัญชีหลัก</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.itemBox}>
                            <FontAwesome name='circle' size={20} color={PRIMARY_COLOR} />
                            <View style={{ marginLeft: 20 }}>
                                <Text style={styles.textActive} numberOfLines={1}>{mainAccount.ACCOUNT_NAME}</Text>
                                <Text style={styles.secondaryTextActive}>{accountNumberFormat(mainAccount.ACCOUNT_NO)}</Text>
                                <Text style={styles.secondaryTextActive}>วาดีอะฮ์</Text>
                            </View>
                        </View>
                    )
                )
            }

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
        </View >
    )
}

export default AccountSetting

export const styles = ScaledSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fafafa'
    },
    emptyContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '70%'
    },
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: '16@vs'
    },
    headerText: {
        fontSize: '16@s',
        lineHeight: 52,
        paddingTop: -6,
        color: '#fff',
        fontFamily: 'Sarabun-Medium'
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
        paddingVertical: '1.5@s'
    },
    buttonText: {
        fontFamily: 'Sarabun-Medium',
        fontSize: '14@s',
        color: '#1890ff',
    },
    itemBox: {
        flexDirection: 'row',
        paddingHorizontal: '20@s',
        paddingVertical: '14@vs',
        borderBottomColor: '#ccc',
        borderBottomWidth: 1,
        alignItems: 'center'
    },
    text: {
        fontFamily: 'Sarabun-regular',
        fontSize: '14@s',
        color: '#999',
        paddingVertical: '1.5@vs',
    },
    textActive: {
        fontFamily: 'Sarabun-Regular',
        fontSize: '14@s',
        color: '#555',
        paddingVertical: '1.5@vs',
    },
    secondaryTextActive: {
        fontFamily: 'Sarabun-Regular',
        fontSize: '14@s',
        color: '#777',
        paddingVertical: '1.5@vs',
    },
    labelText: {
        fontFamily: 'Sarabun-Regular',
        fontSize: '15@s',
        color: '#555',
        paddingVertical: '1.5@s'
    },
    savingBox: {
        marginTop: '3@vs',
        backgroundColor: '#fff',
        fontFamily: 'Sarabun-Light',
        minHeight: '46@vs',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#d9d9d9',
        fontSize: '14@s',
        paddingHorizontal: '12@s',
        paddingVertical: '10@vs',
        marginTop: '12@s',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    buttonContainer: {
        marginTop: '20@vs',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
    },
    button: {
        width: '40%',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: '10@vs',
    },
    backBtn: {
        borderColor: '#1b7ecd',
        borderWidth: 0.5,
    },
    nextBtn: {
        backgroundColor: PRIMARY_COLOR,
    },
    backText: {
        fontFamily: 'Sarabun-Regular',
        color: '#1b7ecd',
        fontSize: '16@s'
    },
    nextText: {
        fontFamily: 'Sarabun-Regular',
        color: '#fff',
        fontSize: '16@s'
    },
    formContainer: {
        padding: 20,
    },
    modalHeaderContent: {
        alignSelf: 'flex-start',
        paddingLeft: '10@s'
    },
    savingText: {
        fontFamily: 'Sarabun-Regular',
        fontSize: '14@s',
        color: '#555',
        padding: '1.5@s',
    },
    modalBankList: {
        borderBottomColor: '#eee',
        borderBottomWidth: 1,
        paddingVertical: '8@vs',
        paddingHorizontal: '15@msr',
        flexDirection: 'row',
        alignItems: 'center',
    },
    savingDetail: {
        fontFamily: 'Sarabun-Light',
        fontSize: '13@s',
        color: '#555',
    },
    header: {
        padding: 16,
        backgroundColor: PRIMARY_COLOR
    },
})

import React, { useEffect, useState } from 'react'
import { StatusBar, Text, View, TouchableOpacity, ScrollView, Modal, SafeAreaView } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import Ionicons from 'react-native-vector-icons/Ionicons'
import AppAlert from '../../../components/AppAlert'
import publicIP from 'react-native-public-ip'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import { accountNumberFormat, getAccountTypeName, getThaiMonth, prettyAmount } from '../../../util'
import { APP_KEY, ERROR_COLOR, PRIMARY_COLOR, SUCCESS_COLOR } from '../../../environment'

const ConfirmSubmit = ({ route, navigation }) => {
    const { shareBalance, savingBalance, loanBalance, shareName } = route.params

    const [correctBalance, setCorrectBalance] = useState([])
    const [incorrectBalance, setIncorrectBalance] = useState([])
    const [showAlert, setShowAlert] = useState(false)
    const [alertMessage, setAlertMessage] = useState('')
    const [alertType, setAlertType] = useState('normal')
    const [modalVisible, setModalVisible] = useState(false)
    const [userPublicIP, setUserPublicIp] = useState('')
    const [apiKey, setApiKey] = useState(null)
    const [apiUrl, setApiUrl] = useState(null)
    const [token, setToken] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    const handleBackNavigator = () => {
        navigation.goBack()
    }

    const onConfirmPressed = () => {
        if (alertType === 'auth') {
            navigation.reset({
                index: 0,
                routes: [{ name: 'PinInput' }]
            })
        } else {
            navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }]
            })
        }
    }

    const getData = async () => {
        const thisApiKey = await AsyncStorage.getItem('confirmShareNumber')
        const thisApiUrl = await AsyncStorage.getItem('StoreAPI_URL')
        const thisToken = await AsyncStorage.getItem('token')

        if (thisApiKey && thisApiUrl && thisToken) {
            setApiKey(thisApiKey)
            setApiUrl(thisApiUrl)
            setToken(thisToken)
        }

        publicIP()
            .then(ip => {
                setUserPublicIp(ip)
            })
            .catch(error => {
                console.log(error)
            })
    }

    const summary = () => {
        let allAccounts = []
        let correctAccounts = []
        let incorrectAccounts = []

        if (shareBalance?.length > 0) {
            allAccounts.push(...shareBalance)
        }

        if (savingBalance?.length > 0) {
            allAccounts.push(...savingBalance)
        }

        if (loanBalance?.length > 0) {
            allAccounts.push(...loanBalance)
        }

        allAccounts.forEach(item => {
            if (item.VERIFIED) {
                correctAccounts.push(item)
            } else {
                incorrectAccounts.push(item)
            }
        })

        setCorrectBalance(correctAccounts)
        setIncorrectBalance(incorrectAccounts)
    }

    const onSubmit = () => {
        const result = { Confirm_ShrMem: shareBalance, Confirm_Saving: savingBalance, Confirm_Loan: loanBalance }

        setIsLoading(true)

        axios
            .post(`${apiUrl}/InsertConfirm`, {
                API_KEY: apiKey,
                IP_ADDRESS: userPublicIP,
                CONFIRM_STATUS: result
            }, {
                headers: {
                    APP_KEY: APP_KEY,
                    Authorization: `Bearer ${token}`
                }
            })
            .then(async (response) => {
                // console.log(response.data)
                const { code, item, itemdetail } = response.data

                if (code === 10) {
                    try {
                        const now = new Date()
                        const today = `${now.getDate()} ${getThaiMonth(now.getMonth() + 1, 'full')} ${now.getFullYear() + 543}`

                        await AsyncStorage.setItem('confirmDate', today)
                        await AsyncStorage.setItem('token', itemdetail)
                        await AsyncStorage.removeItem('SkipStatus')

                        setIsLoading(false)

                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'ConfirmStatus' }]
                        })
                    } catch (error) {
                        console.log(error)
                    }
                } else {
                    setModalVisible(false)
                    setShowAlert(true)
                    setAlertMessage('กรุณาดำเนินการใหม่ในภายหลัง')
                }
            })
            .catch(err => {
                console.log(err.message);
                if (err.message === 'Network Error') {
                    setModalVisible(false)
                    setShowAlert(true)
                    setAlertMessage('กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่อีกครั้ง')
                    setAlertType('auth')
                    return
                } else if (err.message === 'Request failed with status code 401') {
                    setModalVisible(false)
                    setShowAlert(true)
                    setAlertMessage('คุณไม่ได้ทำรายการในเวลาที่กำหนด กรุณา Login อีกครั้ง')
                    setAlertType('auth')
                    return
                }
            })
    }

    useEffect(() => {
        getData()
        summary()
    }, [route])

    const Account = ({ item }) => {
        if (item.TYPE === 'share') {
            return (
                <View style={styles.accItem}>
                    <Text style={[styles.text, styles.textAccType]}>หุ้นสมาชิก</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={styles.text}>เลขที่สมาชิก</Text>
                        <Text style={styles.text}>{`${item.BR_NO}-01-${item.MEM_ID}`}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={styles.text}>ชื่อบัญชี</Text>
                        <Text style={styles.text}>{shareName}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={styles.text}>หุ้นสะสม(บาท)</Text>
                        <Text style={styles.text}>{prettyAmount(item.SHR_BAL_GO)}</Text>
                    </View>
                    {
                        !item.VERIFIED ? (
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={styles.text}>คำชี้แจง</Text>
                                <Text style={[styles.text, { color: ERROR_COLOR }]}>{!item.REMARK || item.REMARK === '' ? 'ยอดเงินฝากไม่ถูก' : item.REMARK}</Text>
                            </View>
                        ) : null
                    }
                </View>
            )
        } else if (item.TYPE === 'saving') {
            return (
                <View style={styles.accItem}>
                    <Text style={[styles.text, styles.textAccType]}>บัญชีเงินฝาก</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={styles.text}>เลขที่บัญชี</Text>
                        <Text style={styles.text}>{accountNumberFormat(item.ACCOUNT_NO)}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={styles.text}>ชื่อบัญชี</Text>
                        <Text style={styles.text}>{item.ACCOUNT_NAME}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={styles.text}>ประเภทบัญชี</Text>
                        <Text style={styles.text}>{getAccountTypeName(item.ACCOUNT_NO)}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={styles.text}>ยอดคงเหลือ(บาท)</Text>
                        <Text style={styles.text}>{prettyAmount(item.SAV_BAL_GO)}</Text>
                    </View>
                    {
                        !item.VERIFIED ? (
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={styles.text}>คำชี้แจง</Text>
                                <Text style={[styles.text, { color: ERROR_COLOR }]}>{!item.REMARK || item.REMARK === '' ? 'ยอดเงินฝากไม่ถูก' : item.REMARK}</Text>
                            </View>
                        ) : null
                    }
                </View>
            )
        } else {
            return (
                <View style={styles.accItem}>
                    <Text style={[styles.text, styles.textAccType]}>สินเชื่อ</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={styles.text}>เลขที่สัญญา</Text>
                        <Text style={styles.text}>{item.LCONT_ID}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={styles.text}>วงเงินสินเชื่อ</Text>
                        <Text style={styles.text}>{prettyAmount(item.LCONT_APPROVE_SAL)}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={styles.text}>ชำระแล้ว</Text>
                        <Text style={styles.text}>{prettyAmount(item.LCONT_APPROVE_SAL - item.LOAN_BAL_GO)}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={styles.text}>ยอดคงเหลือ(บาท)</Text>
                        <Text style={styles.text}>{prettyAmount(item.LOAN_BAL_GO)}</Text>
                    </View>
                    {
                        !item.VERIFIED ? (
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={styles.text}>คำชี้แจง</Text>
                                <Text style={[styles.text, { color: ERROR_COLOR }]}>{!item.REMARK || item.REMARK === '' ? 'ยอดเงินฝากไม่ถูก' : item.REMARK}</Text>
                            </View>
                        ) : null
                    }
                </View>
            )
        }
    }

    return (
        <View style={{ flex: 1 }}>
            <StatusBar barStyle='light-content' />

            <View style={styles.header}>
                <SafeAreaView style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity style={{ paddingRight: 16, paddingLeft: 6 }} onPress={handleBackNavigator}>
                        <FontAwesome5 name='chevron-left' size={18} color='#fff' />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerText} numberOfLines={1}>ตรวจสอบข้อมูล</Text>
                    </View>
                </SafeAreaView>
            </View>

            <ScrollView style={{ flex: 1, backgroundColor: '#fcfcfc', paddingHorizontal: 14 }}>
                <View style={[{ flexDirection: 'row', justifyContent: 'flex-end', marginVertical: 16 }]}>
                    <View style={{ flexDirection: 'row' }}>
                        <FontAwesome name='circle' size={16} color={SUCCESS_COLOR} style={styles.bullet} />
                        <Text style={styles.text}> ถูกต้อง</Text>
                    </View>
                    <View style={{ marginLeft: 8 }}>
                        <Text style={styles.text}>{correctBalance.length} รายการ</Text>
                    </View>
                </View>

                <View style={[styles.card, { borderColor: SUCCESS_COLOR }]}>
                    {
                        correctBalance.map((item, i) => (
                            <Account item={item} key={i} />
                        ))
                    }
                </View>

                <View style={[{ flexDirection: 'row', justifyContent: 'flex-end', marginVertical: 16 }]}>
                    <View style={{ flexDirection: 'row' }}>
                        <FontAwesome name='circle' size={16} color={ERROR_COLOR} style={styles.bullet} />
                        <Text style={styles.text}> ไม่ถูกต้อง</Text>
                    </View>
                    <View style={{ marginLeft: 8 }}>
                        <Text style={styles.text}>{incorrectBalance.length} รายการ</Text>
                    </View>
                </View>

                {
                    incorrectBalance.length > 0 ? (
                        <View style={[styles.card, { borderColor: ERROR_COLOR }]}>
                            {
                                incorrectBalance.map((item, i) => (
                                    <Account item={item} key={i} />
                                ))
                            }
                        </View>
                    ) : null
                }

                <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
                    <Text style={styles.buttonText}>ยืนยันข้อมูล</Text>
                </TouchableOpacity>
            </ScrollView>

            <Modal
                animationType='slide'
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible)
                }}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Ionicons name='checkmark-circle' size={36} color={SUCCESS_COLOR} style={{ marginBottom: 5 }} />
                        <Text style={[styles.modalText, { fontSize: 18, marginBottom: 0, }]}>ยืนยันยอดเรียบร้อย</Text>
                        <View style={{ width: '85%', marginVertical: 20 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={styles.modalText}>ข้อมูลถูกต้อง</Text>
                                <Text style={styles.modalText}>{correctBalance.length} รายการ</Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={styles.modalText}>ข้อมูลไม่ถูกต้อง</Text>
                                <Text style={styles.modalText}>{incorrectBalance.length} รายการ</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            activeOpacity={isLoading ? 1 : 0.5}
                            style={[styles.modalButton, isLoading ? { backgroundColor: '#73d13d' } : styles.acceptButton]}
                            onPress={() => !isLoading ? onSubmit() : {}}
                        >
                            <Text style={styles.textStyle}>{isLoading ? 'Loading...' : 'เสร็จสิ้น'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            activeOpacity={isLoading ? 1 : 0.5}
                            style={[styles.modalButton, { backgroundColor: '#bbb', marginTop: 10 }]}
                            onPress={() => setModalVisible(!modalVisible)}
                        >
                            <Text style={styles.textStyle}>กลับ</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

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

export default ConfirmSubmit

const styles = ScaledSheet.create({
    header: {
        padding: 16,
        backgroundColor: PRIMARY_COLOR
    },
    headerText: {
        fontSize: '16@s',
        color: '#fff',
        fontFamily: 'Sarabun-Medium',
        paddingVertical: 3,
        lineHeight: 46,
    },
    border: {
        borderWidth: 1,
        borderColor: 'red'
    },
    button: {
        marginTop: 24,
        backgroundColor: '#40a9ff',
        alignItems: 'center',
        paddingVertical: 10,
        borderRadius: 50,
        marginBottom: 48
    },
    buttonText: {
        fontFamily: 'Sarabun-Medium',
        fontSize: '16@s',
        color: '#fff',
        paddingVertical: 2
    },
    text: {
        fontFamily: 'Sarabun-Regular',
        fontSize: '13@s',
        color: '#555',
        paddingVertical: '1.5@vs'
    },
    textAccType: {
        fontFamily: 'Sarabun-Bold',
        marginBottom: 4
    },
    bullet: {
        marginRight: 8,
        marginTop: 4
    },
    card: {
        borderWidth: 1,
        borderRadius: 8,
        backgroundColor: '#fff',
        padding: 16
    },
    accItem: {
        borderBottomColor: '#ccc',
        borderBottomWidth: 1,
        paddingBottom: 16,
        marginBottom: 16
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)'
    },
    modalView: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 7,
        paddingVertical: 26,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    modalButton: {
        borderRadius: 20,
        width: '85%',
        padding: 5,
    },
    acceptButton: {
        backgroundColor: SUCCESS_COLOR,
    },
    modalText: {
        fontFamily: 'Sarabun-Medium',
        color: '#555',
        marginBottom: 5,
        paddingVertical: 2
    },
    textStyle: {
        fontFamily: 'Sarabun-Medium',
        color: '#fff',
        fontSize: '14@s',
        textAlign: 'center',
        paddingVertical: 3
    },
})

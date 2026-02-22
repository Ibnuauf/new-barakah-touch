import React, { useEffect, useState } from 'react'
import { TouchableOpacity, Text, View, ActivityIndicator, BackHandler } from 'react-native'
import AppHeader2 from '../../../components/AppHeader2'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { ScaledSheet } from 'react-native-size-matters'
import { APP_KEY, APP_NAME, ERROR_COLOR, SUCCESS_COLOR } from '../../../environment'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import AppAlert from '../../../components/AppAlert'

const ConfirmStatus = ({ navigation }) => {
    const [confirmDate, setConfirmDate] = useState('')
    const [isVerified, setIsVerified] = useState(false)
    const [isLoaing, setIsLoaing] = useState(true)
    const [showAlert, setShowAlert] = useState(false)
    const [alertMessage, setAlertMessage] = useState('')

    const handleBackNavigator = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }]
        })
    }

    const getLastDay = () => {
        const now = new Date()
        const month = now.getMonth() + 1

        if (month < 6) {
            return `28 กุมภาพันธ์ ${now.getFullYear() + 543}`
        } else {
            return `31 สิงหาคม ${now.getFullYear() + 543}`
        }
    }

    const getAccountYear = (type) => {
        const now = new Date()
        const month = now.getMonth() + 1

        if (type === 'short') {
            if (month < 6) {
                return `${now.getFullYear() + 542}`
            } else {
                return `${now.getFullYear() + 543}`
            }
        } else if (type === 'long') {
            if (month < 6) {
                return `31 ธันวาคม ${now.getFullYear() + 542}`
            } else {
                return `30 มิถุนายน ${now.getFullYear() + 543}`
            }
        }
    }

    const getData = async () => {
        const apiKey = await AsyncStorage.getItem('confirmShareNumber')
        const StoreAPI_URL = await AsyncStorage.getItem('StoreAPI_URL')
        const token = await AsyncStorage.getItem('token')

        if (apiKey && StoreAPI_URL && token) {
            axios
                .post(`${StoreAPI_URL}/HomeMember`, {
                    API_KEY: apiKey
                }, {
                    headers: {
                        APP_KEY: APP_KEY,
                        Authorization: `Bearer ${token}`
                    }
                })
                .then(async (response) => {
                    // console.log(response.data.item)
                    const { code, item, itemdetail } = response.data
                    if (code === 10) {
                        try {
                            await AsyncStorage.setItem('token', itemdetail)

                            if (item.Confirm_Balance_Status === 'N') {
                                const confirmDate = await AsyncStorage.getItem('confirmDate')

                                if (confirmDate !== null) {
                                    setConfirmDate(confirmDate)
                                }

                                setIsVerified(true)
                            }
                            setIsLoaing(false)
                        } catch (error) {
                            console.log(error)
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
    }

    useEffect(() => {
        getData()
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
        <View style={{ flex: 1 }}>
            <AppHeader2 onPress={handleBackNavigator} />

            {
                isLoaing ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator color='#0000ff' />
                    </View>
                ) : (
                    <View style={{ flex: 1, backgroundColor: '#fcfcfc', paddingHorizontal: 14 }}>
                        {
                            !isVerified ? (
                                <View>
                                    <View style={[{ marginVertical: 20 }]}>
                                        <Text style={[styles.headerText, { color: isVerified ? SUCCESS_COLOR : '#1890ff' }]}>รายละเอียดการยืนยันยอด</Text>
                                    </View>
                                    <View style={[{ flexDirection: 'row', marginBottom: 6 }]}>
                                        <View style={styles.bullet}>
                                            <FontAwesome name='circle' size={8} color='#555' />
                                        </View>
                                        <View style={[{ flex: 1 }]}>
                                            <Text style={styles.text}>โปรดตรวจสอบความถูกต้องของรายการทางการเงินแต่ละรายการที่ท่านมีอยู่กับสหกรณ์</Text>
                                        </View>
                                    </View>
                                    <View style={[{ flexDirection: 'row', marginBottom: 6 }]}>
                                        <View style={styles.bullet}>
                                            <FontAwesome name='circle' size={8} color='#555' />
                                        </View>
                                        <View style={[{ flex: 1 }]}>
                                            <Text style={styles.text}>การยืนยันยอดเป็นวิธีการตรวจสอบที่สำคัญตามมาตรฐานการสอบบัญชีและเป็นข้อมูลหลักฐานสำคัญในการสอบบัญชีเพื่อยืนยันถึงความมีอยู่จริง</Text>
                                        </View>
                                    </View>
                                    <View style={[{ flexDirection: 'row', marginBottom: 6 }]}>
                                        <View style={styles.bullet}>
                                            <FontAwesome name='circle' size={8} color='#555' />
                                        </View>
                                        <View style={[{ flex: 1 }]}>
                                            <Text style={styles.text}>การยืนยันยอดคงเหลือ ณ สิ้นงวดบัญชี ({getAccountYear('long')})</Text>
                                        </View>
                                    </View>
                                    <View style={[{ flexDirection: 'row', marginBottom: 6 }]}>
                                        <View style={styles.bullet}>
                                            <FontAwesome name='circle' size={8} color='#555' />
                                        </View>
                                        <View style={[{ flex: 1 }]}>
                                            <Text style={styles.text}>ให้ทำเครื่องหมาย / ในช่อง เพื่อยืนยันรายการทางการเงินของท่านว่า 'ถูกต้อง' หรือ 'ไม่ถูกต้อง' หากปรากฏข้อมูล 'ไม่ถูกต้อง' ของแต่ละรายการ ให้ท่านยืนยันข้อมูลที่ถูกต้องโดยการกรอกลงใน 'คำชี้แจง'</Text>
                                        </View>
                                    </View>
                                    <View style={[{ flexDirection: 'row', marginBottom: 6 }]}>
                                        <View style={styles.bullet}>
                                            <FontAwesome name='circle' size={8} color='#555' />
                                        </View>
                                        <View style={[{ flex: 1 }]}>
                                            <Text style={styles.text}>ยืนยันข้อมูลผ่านแอป {APP_NAME} ของท่านโดยลงวันที่ เวลา และไอพีแอดเดรสให้เรียบร้อย หลังจากนั้นกดปุ่มเพื่อยืนยันนำส่งไปยังอีเมลของผู้สอบบัญชีสหกรณ์ฯ nskforconfirm@gmail.com</Text>
                                        </View>
                                    </View>
                                </View>
                            ) : null
                        }

                        <View style={[styles.status, { borderColor: isVerified ? SUCCESS_COLOR : ERROR_COLOR, marginTop: isVerified ? 120 : 20, }]}>
                            {
                                isVerified ? (
                                    <Ionicons name='checkmark-circle' size={36} color={SUCCESS_COLOR} style={{ marginBottom: 4 }} />
                                ) : (
                                    <Ionicons name='close-circle' size={36} color={ERROR_COLOR} style={{ marginBottom: 4 }} />
                                )
                            }
                            <Text style={[styles.text, styles.statusText, { color: isVerified ? SUCCESS_COLOR : ERROR_COLOR }]}>{isVerified ? 'ท่านได้ยืนยันยอดแล้ว' : `คุณยังไม่ได้ยืนยันยอด ปีบัญชี ${getAccountYear('short')}`}</Text>
                            <Text style={[styles.text, styles.statusText, { color: isVerified ? SUCCESS_COLOR : ERROR_COLOR }]}>{isVerified ? confirmDate !== '' ? `เมื่อวันที่ ${confirmDate}` : '' : `กรุณายืนยันยอดของท่าน`}</Text>
                        </View>

                        {
                            !isVerified ? (
                                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Confirm')}>
                                    <Text style={[styles.statusText, { color: '#fff', paddingVertical: 2 }]}>ตรวจสอบข้อมูล</Text>
                                </TouchableOpacity>
                            ) : null
                        }
                    </View>
                )
            }

            <AppAlert
                visible={showAlert}
                title={alertMessage === '' ? alertMessage : ' ไม่สำเร็จ'}
                message={alertMessage === '' ? 'Loading...' : alertMessage}
                showConfirm={alertMessage !== ''}
                showCancel={false}
                onConfirm={() => {
                    setShowAlert(false)
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

export default ConfirmStatus

const styles = ScaledSheet.create({
    border: {
        borderWidth: 1,
        borderColor: 'red'
    },
    bullet: {
        marginHorizontal: 10,
        marginTop: 8
    },
    text: {
        fontFamily: 'Sarabun-Regular',
        fontSize: 13,
        color: '#555',
        paddingVertical: '1.5@vs'
    },
    status: {
        borderWidth: 1,
        alignItems: 'center',
        borderRadius: 8,
        marginHorizontal: 10,
        paddingVertical: 12,
        backgroundColor: '#fff'
    },
    statusText: {
        fontFamily: 'Sarabun-Medium',
        fontSize: 16,
    },
    headerText: {
        fontFamily: 'Sarabun-Bold',
        fontSize: '16@s',
    },
    button: {
        marginTop: 40,
        backgroundColor: '#40a9ff',
        alignItems: 'center',
        paddingVertical: 10,
        borderRadius: 50
    }
})

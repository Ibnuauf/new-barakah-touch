import React, { useState, useEffect } from 'react'
import { Text, View, ImageBackground, TouchableOpacity, SafeAreaView } from 'react-native'
import OTPInput from '../../components/OTPInput'
import NumberKeyboard from '../../components/NumberKeyboard'
import AppAlert from '../../components/AppAlert'
import { prettyTime } from '../../util'
import { ScaledSheet } from 'react-native-size-matters'

const NewOtpScreen = () => {
    const [otp, setOtp] = useState('')
    const [showAlert, setShowAlert] = useState(false)
    const [showAlertSuccess, setShowAlertSuccess] = useState(false)
    const [alertMessage, setAlertMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [time, setTime] = useState(180)
    const [alertType, setAlertType] = useState('normal')
    const [editable, setEditable] = useState(true)

    const randomRef = 'hfiskv'

    const redo = () => {
        setEditable(true)
        setAlertType('normal')
        // navigation.reset({
        //     index: 0,
        //     routes: [{ name: 'Login' }]
        // })
    }

    const onConfirmPressed = () => {
        setShowAlert(false)
        setAlertMessage('')

        if (alertType === 'authen') {
            setAlertType('normal')
            // navigation.reset({
            //     index: 0,
            //     routes: [{ name: 'Login' }]
            // })
        } else if (alertType === 'block') {
            redo()
        }
    }

    const hidePhone = (phone) => {
        if (phone !== null)
            return '*** *** ' + phone.slice(6, 10)
        else
            return ''
    }

    const newOtp = () => {
        // setShowAlert(true)
        // axios
        //     .post(`${API_URL}/GetTelOTP`, {
        //         API_KEY: apiKey
        //     }, {
        //         headers: {
        //             APP_KEY: APP_KEY,
        //             Authorization: `Bearer ${token}`
        //         }
        //     })
        //     .then(response => {
        //         // console.log(response.data)
        //         if (response.data.code === 10) {
        //             setTime(180)
        //             setPhoneNumber(response.data.item.MOBILE_TEL)
        //             setRandomRef(response.data.item.RANDOM)
        //             setPinId(response.data.itemdOTP.pinId)
        //             setToken(response.data.itemdetail.Token)
        //             setTokenOtp(response.data.itemdetail.TokenOTP)

        //             setShowAlert(false)
        //         } else {
        //             setAlertMessage(response.data.message)
        //         }
        //     })
        //     .catch(err => {
        //         // console.error(err)
        //         if (err.message === 'Network Error') {
        //             setAlertType('authen')
        //             setAlertMessage('กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่อีกครั้ง')
        //         } else if (err.message === 'Request failed with status code 401') {
        //             setAlertType('authen')
        //             setAlertMessage('คุณไม่ได้ทำรายการในเวลาที่กำหนด กรุณา Login อีกครั้ง')
        //         }
        //     })
    }

    const verifyOTP = async (code) => {
        try {
            setLoading(true)

            // 🔥 เรียก API backend
            console.log('verify otp:', code)
            setShowAlertSuccess(true)
            setAlertMessage('verify otp:' + code)

            // await api.verifyOtp(code)

        } catch (e) {
            console.log('OTP invalid')
            setOtp('') // reset
        } finally {
            setLoading(false)
        }
    }

    const onKeyPress = (key) => {
        if (key === 'back') {
            setOtp(prev => prev.slice(0, -1))
            return
        }

        if (otp.length < 6) {
            setOtp(prev => prev + key)
        }
    }

    useEffect(() => {
        if (otp.length === 6) {
            verifyOTP(otp)
        }
    }, [otp])

    return (
        <ImageBackground source={require('../../assets/blue-wallpapers.jpg')} style={{ flex: 1 }} blurRadius={10}>
            <SafeAreaView style={styles.container}>
                <View style={styles.title}>
                    <Text style={[styles.largeTitle]}>ใส่รหัส OTP 6 หลัก</Text>
                    <Text style={styles.titleText}>SMS ส่งไปยังเบอร์โทรศัพท์ {hidePhone('0911697719')}</Text>
                </View>

                <OTPInput value={otp} length={6} />

                <View style={[styles.title, { marginTop: 20 }]}>
                    {
                        time > 0 ? (
                            <View>
                                <Text style={[styles.titleText, styles.refTitle]}>รหัสอ้างอิง: {randomRef} หมดอายุภายใน {prettyTime(time)} นาที</Text>

                                <TouchableOpacity onPress={() => newOtp()}>
                                    <Text style={[styles.titleText, styles.titleTextUnderline]}>ขอรหัส OTP ใหม่</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View>
                                <Text style={[styles.titleText, styles.refTitleTimeOut]}>รหัส OTP หมดอายุ กรุณาทำรายการใหม่อีกครั้ง</Text>

                                <TouchableOpacity onPress={async () => redo()}>
                                    <Text style={[styles.titleText, styles.titleTextUnderline]}>ทำรายการใหม่</Text>
                                </TouchableOpacity>
                            </View>
                        )
                    }
                </View>

                <NumberKeyboard onKeyPress={onKeyPress} />

                <AppAlert
                    visible={showAlert}
                    title={alertMessage === '' ? alertMessage : ' ไม่สำเร็จ'}
                    message={alertMessage === '' ? 'Loading...' : alertMessage}
                    showConfirm={alertMessage !== ''}
                    showCancel={false}
                    onConfirm={onConfirmPressed}
                    onCancel={() => setShowAlert(false)}
                />

                <AppAlert
                    visible={showAlertSuccess}
                    title={'สำเร็จ'}
                    message={alertMessage}
                    showConfirm={alertMessage !== ''}
                    confirmButtonColor='#5cb85c'
                    showCancel={false}
                    onConfirm={() => setShowAlertSuccess(false)}
                    onCancel={() => setShowAlertSuccess(false)}
                />
            </SafeAreaView>
        </ImageBackground>
    )
}

export default NewOtpScreen

const styles = ScaledSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        paddingVertical: 40,
    },
    title: {
        alignItems: 'center',
        marginTop: '90@vs',
        width: '100%',
    },
    title2: {
        alignItems: 'center',
        marginTop: '20@vs',
        width: '100%',
    },
    titleText: {
        fontFamily: 'Sarabun-Regular',
        fontSize: '14@s',
        color: '#0047AB',
        width: '100%',
        textAlign: 'center'
    },
    largeTitle: {
        fontFamily: 'Sarabun-SemiBold',
        fontSize: '16@s',
        color: '#0047AB',
        width: '100%',
        textAlign: 'center',
        marginBottom: 10
    },
    refTitle: {
        fontSize: '12@s',
    },
    refTitleTimeOut: {
        fontSize: '12@s',
        color: '#b90e0a'
    },
    titleTextUnderline: {
        color: '#333',
        textDecorationLine: 'underline'
    },
})

import React, { useState, useEffect } from 'react'
import { View, Text, Image, TouchableOpacity, BackHandler, Modal, ActivityIndicator, Platform } from 'react-native'
import { Header, Icon } from 'react-native-elements'
import { prettyAmount, searchBankIcon, searchBankName } from '../../util'
import AwesomeAlert from 'react-native-awesome-alerts'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { styles } from '../../styles/checkList'
import axios from 'axios'
import { APP_KEY, PRIMARY_COLOR } from '../../environment'
import AsyncStorage from '@react-native-async-storage/async-storage'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import DeviceInfo from 'react-native-device-info'
import { addScreenshotListener } from 'react-native-detector'

const numbers = [
    { id: 1 },
    { id: 2 },
    { id: 3 },
    { id: 4 },
    { id: 5 },
    { id: 6 },
    { id: 7 },
    { id: 8 },
    { id: 9 },
    { id: '' },
    { id: 0 },
]

const CheckListBank = ({ navigation, route }) => {
    const {
        PromptPayAccountNo,
        PromptPayAccountName,
        ToBankId,
        SenderName,
        SenderReference,
        Amount,
        memo,
        mgate_prev_inquiry_request
    } = route.params

    const [apiKey, setApiKey] = useState(null)
    const [token, setToken] = useState(null)
    const [showAlert, setShowAlert] = useState(false)
    const [showBankAlert, setShowBankAlert] = useState(false)
    const [alertMessage, setAlertMessage] = useState('')
    const [alertTitle, setAlertTitle] = useState(' ไม่สำเร็จ')
    const [bankAlertMessage, setBankAlertMessage] = useState('')
    const [API_URL, setAPI_URL] = useState(null)
    const [bankIcon, setBankIcon] = useState(null)
    const [modalVisible, setModalVisible] = useState(false)
    const [pin, setPin] = useState([])
    const [passCode, setPinCode] = useState(['', '', '', '', '', ''])
    const [keyAuthen, setKeyAuthen] = useState(null)
    const [uniqueId, setUniqueId] = useState(null)
    const [brand, setBrand] = useState(null)
    const [model, setModel] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [count, setCount] = useState(1)
    const [isBlock, setIsBlock] = useState(false)
    const [fee, setFee] = useState(0)

    const onPressNumber = (num) => {
        if (!isBlock) {
            if (num !== '') {
                setPin([...pin, num])
                let tempCode = passCode
                for (let i = 0; i < tempCode.length; i++) {
                    if (tempCode[i] === '') {
                        tempCode[i] = num
                        break
                    } else {
                        continue
                    }
                }
                setPinCode(tempCode)
            }
        }
    }

    const onPressBackspace = () => {
        let array = [...pin]
        let index = pin.length - 1
        if (index !== -1) {
            array.splice(index, 1)
            setPin(array)
        }

        let tempCode = passCode
        for (let i = tempCode.length - 1; i >= 0; i--) {
            if (tempCode[i] !== '') {
                tempCode[i] = ''
                break
            } else {
                continue
            }
        }
        setPinCode(tempCode)
    }

    const onSubmit = () => {
        axios
            .post(`${API_URL}/CIMB_Comfirm`, {
                API_KEY: apiKey,
                mgate_prev_inquiry_request: mgate_prev_inquiry_request
            }, {
                headers: {
                    APP_KEY: APP_KEY,
                    Authorization: `Bearer ${token}`,
                }
            })
            .then(async response => {
                console.log(response.data)

                const { code, item, message } = response.data

                if (code === 10) {
                    navigation.reset({
                        index: 0,
                        routes: [{
                            name: 'SlipBank',
                            params: {
                                PromptPayAccountNo,
                                PromptPayAccountName,
                                ToBankId,
                                SenderName,
                                SenderReference,
                                Amount,
                                memo,
                                bankIcon,
                                fee,
                                SLIP_NO: item.SLIP_NO,
                                CREATE_DATE: item.CREATE_DATE
                            }
                        }]
                    })
                } else if (code === 0) {
                    setModalVisible(false)
                    setShowBankAlert(true)
                    setAlertTitle('ระบบขัดข้อง')
                    setBankAlertMessage('กรุณาตรวจสอบการทำรายการ หากไม่สำเร็จกรุณาลองใหม่อีกครั้ง')
                } else {
                    setModalVisible(false)
                    setShowBankAlert(true)
                    setBankAlertMessage(message)
                }

                setIsLoading(false)
                setPin([])
                setPinCode(['', '', '', '', '', ''])
            })
            .catch(err => {
                console.log({ err })
                if (err.message === 'Network Error') {
                    setShowAlert(true)
                    setAlertMessage('ไม่สามารถทำรายการได้ กรุณาลองใหม่อีกครั้ง')
                } else if (err.message === 'Request failed with status code 401') {
                    setShowAlert(true)
                    setAlertMessage('คุณไม่ได้ทำรายการในเวลาที่กำหนด กรุณา Login อีกครั้ง')
                }
            })
    }

    const handleBackNavigator = () => {
        if (Platform.OS === 'ios') {
            navigation.goBack()
        } else {
            navigation.reset({
                index: 0,
                routes: [{
                    name: 'SendToBank',
                    params: {
                        previousScreen: route.name
                    }
                }]
            })
        }
    }

    useEffect(() => {
        if (pin.length === 6) {
            if (alertMessage !== '') {
                setAlertMessage('')
            }

            setIsLoading(true)

            axios
                .post(`${API_URL}/LoginPIN`, {
                    API_KEY: apiKey,
                    PIN_KEY: pin.join(''),
                    DEVICE_UNIQUEID: uniqueId,
                    DEVICE_BRAND: brand,
                    DEVICE_MODEL: model
                }, {
                    headers: {
                        APP_KEY: APP_KEY,
                        Authorization: `App ${keyAuthen}`
                    }
                })
                .then(async (response) => {
                    // console.log(response.data)

                    if (response.data.code === 10) {
                        setTimeout(() => {
                            onSubmit()
                        }, 1000)
                    } else {
                        if (response.data.code === 20) {
                            setCount(prev => prev + 1)

                            if (count >= 3) {
                                setIsBlock(true)
                                setAlertMessage('คุณใส่รหัสผิดเกิน 3 ครั้ง กรุณาทำรายการใหม่อีกครั้ง!')
                            } else {
                                setAlertMessage(response.data.message)
                            }

                            setIsLoading(false)
                            setPin([])
                            setPinCode(['', '', '', '', '', ''])
                        } else {
                            setAlertMessage(response.data.message)
                            setIsLoading(false)
                            setPin([])
                            setPinCode(['', '', '', '', '', ''])
                        }
                    }
                })
                .catch(error => {
                    if (error.message === 'Network Error') {
                        setAlertMessage('กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่อีกครั้ง')
                    } else if (error.message === 'Request failed with status code 404') {
                        setAlertMessage('เนื่องจากอยู่ระหว่างการปรับปรุงระบบชั่วคราว')
                    }

                    setPin([])
                    setPinCode(['', '', '', '', '', ''])
                })
        }
    }, [pin])

    useEffect(() => {
        const getDeviceInfo = () => {
            const brand = DeviceInfo.getBrand()
            const uniqueId = DeviceInfo.getUniqueId()
            const model = DeviceInfo.getModel()

            setUniqueId(uniqueId)
            setBrand(brand)
            setModel(model)
        }

        getDeviceInfo()
    }, [])

    useEffect(() => {
        const getToken = async () => {
            if (!ToBankId) {
                if (PromptPayAccountNo?.length === 10) {
                    setBankIcon(require('../../assets/bank/smartphone.png'))
                } else {
                    setBankIcon(require('../../assets/bank/idcard.png'))
                }
            } else {
                setBankIcon(searchBankIcon(ToBankId))
            }

            try {
                const fee = await AsyncStorage.getItem('Fee')
                const keyAuthen = await AsyncStorage.getItem('KEY_AUTHEN')
                const StoreAPI_URL = await AsyncStorage.getItem('StoreAPI_URL')
                const token = await AsyncStorage.getItem('token')
                const apiKey = await AsyncStorage.getItem('confirmShareNumber')

                if (fee !== null) {
                    setFee(+fee)
                }

                if (StoreAPI_URL !== null && token !== null && apiKey !== null && keyAuthen !== null) {
                    setAPI_URL(StoreAPI_URL)
                    setToken(token)
                    setApiKey(apiKey)
                    setKeyAuthen(keyAuthen)
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
        <View style={{ flex: 1 }}>
            <Header
                placement='left'
                backgroundColor={'#eee'}
                leftComponent={<Icon name='keyboard-arrow-left' color={PRIMARY_COLOR} size={38} iconStyle={{ paddingVertical: 8 }} onPress={() => handleBackNavigator()} />}
                centerComponent={<Text style={styles.headerText}>ตรวจสอบข้อมูล</Text>}
            />

            <View style={styles.body}>
                <View>
                    <View style={{ paddingVertical: 14 }}>
                        <View style={styles.subSection1}>
                            <Image style={styles.icon} source={require('../../assets/Ibnuauf-Logo-for-App.png')} />

                            <View>
                                <Text style={styles.primaryText}>{SenderName}</Text>
                                <Text style={styles.secondaryText} numberOfLines={1}>{SenderReference}</Text>
                                <Text style={styles.secondaryText} numberOfLines={1}>วาดีอะฮ์</Text>
                            </View>

                        </View>

                        <View style={{ paddingHorizontal: 20 }}>
                            <AntDesign name='arrowdown' size={32} color='#777' alignItems='center' />
                        </View>

                        <View style={styles.subSection1}>
                            <View style={[styles.icon, { justifyContent: 'center', alignItems: 'center' }]}>
                                {
                                    bankIcon && (
                                        <Image style={styles.bankIcon} source={bankIcon} />
                                    )
                                }
                            </View>

                            <View>
                                <Text style={styles.primaryText}>{PromptPayAccountName}</Text>
                                <Text style={styles.secondaryText} numberOfLines={1}>{PromptPayAccountNo}</Text>

                                {
                                    !ToBankId ? (
                                        <Text style={styles.secondaryText} numberOfLines={1}>พร้อมเพย์</Text>
                                    ) : (
                                        <Text style={styles.secondaryText} numberOfLines={1}>{searchBankName(ToBankId)}</Text>
                                    )
                                }
                            </View>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.leftItem}>
                            <Text style={styles.primaryText}>จำนวนเงิน</Text>
                        </View>

                        <View style={styles.rightItem}>
                            <Text style={styles.largeText}>{prettyAmount(Amount)}</Text>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.leftItem}>
                            <Text style={styles.primaryText}>ค่าธรรมเนียม</Text>
                        </View>

                        <View style={styles.rightItem}>
                            <Text style={styles.primaryText}>{prettyAmount(fee)}</Text>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.leftItem}>
                            <Text style={[styles.primaryText, { color: '#4096ff' }]}>ยอดรวม</Text>
                        </View>

                        <View style={styles.rightItem}>
                            <Text style={[styles.largeText, { color: '#4096ff' }]}>{prettyAmount(Amount + fee)}</Text>
                        </View>
                    </View>

                    {
                        memo !== '' && (
                            <View style={styles.section}>
                                <View style={styles.leftItem}>
                                    <Text style={styles.secondaryText}>บันทึกช่วยจำ</Text>
                                </View>

                                <View style={styles.rightItem}>
                                    <Text style={styles.secondaryText}>{memo}</Text>
                                </View>
                            </View>
                        )
                    }
                </View>

                <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.button}>
                    <Text style={styles.btnText}>ยืนยัน</Text>
                </TouchableOpacity>
            </View>

            <Modal
                animationType='slide'
                transparent={true}
                visible={modalVisible}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <View style={styles.container}>
                            <TouchableOpacity
                                style={styles.closeIcon}
                                onPress={() => isBlock ? navigation.reset({ index: 0, routes: [{ name: 'PinInput' }] }) : setModalVisible(false)}
                            >
                                <AntDesign name='close' size={24} color='#333' alignItems='center' />
                            </TouchableOpacity>

                            {
                                !alertMessage ? (
                                    isLoading ? (
                                        <ActivityIndicator color="#4096ff" />
                                    ) : (
                                        <Text style={styles.title}> ใส่รหัส PIN</Text>
                                    )
                                ) : (
                                    isLoading ? (
                                        <ActivityIndicator color="#4096ff" />
                                    ) : (
                                        <Text style={[styles.title, { color: '#ff4d4f', textAlign: 'center' }]}>{alertMessage}</Text>
                                    )
                                )
                            }

                            <View style={[styles.codeContainer]}>
                                {
                                    passCode.map((p, i) => {
                                        let style = p !== '' ? styles.codeSelected : styles.code
                                        return <View style={style} key={i}></View>
                                    })
                                }
                            </View>

                            <TouchableOpacity onPress={() => {
                                setModalVisible(false)
                                navigation.navigate('ForgetPin')
                            }}>
                                <Text style={styles.text}>ลืมรหัส PIN</Text>
                            </TouchableOpacity>

                            <View style={styles.numberContainer}>
                                {
                                    numbers.map((number, i) => {
                                        let forgetStyle = number.id === 'ลืม PIN' ? { fontSize: 14, fontFamily: 'Sarabun-Regular' } : {}
                                        return (
                                            <TouchableOpacity style={styles.number} key={i} onPress={() => onPressNumber(number.id)}>
                                                <Text style={[styles.numberText, forgetStyle]}>{number.id}</Text>
                                            </TouchableOpacity>
                                        )
                                    })
                                }
                                <TouchableOpacity style={styles.number} onPress={() => onPressBackspace()}>
                                    <MaterialCommunityIcons name='backspace-outline' size={24} color='#333' />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>

            <AwesomeAlert
                show={showAlert}
                showProgress={true}
                progressColor={'#0000ff'}
                title={alertMessage === '' ? alertMessage : ' ไม่สำเร็จ'}
                titleStyle={{ fontFamily: 'Sarabun-Medium', fontSize: 20 }}
                message={alertMessage === '' ? 'Loading...' : alertMessage}
                messageStyle={{ fontFamily: 'Sarabun-Light', fontSize: 16, textAlign: 'center' }}
                closeOnTouchOutside={false}
                closeOnHardwareBackPress={false}
                showCancelButton={false}
                showConfirmButton={alertMessage !== ''}
                confirmText='ตกลง'
                confirmButtonColor='#DD6B55'
                confirmButtonTextStyle={{ fontFamily: 'Sarabun-Regular', fontSize: 16 }}
                onCancelPressed={() => setShowAlert(false)}
                onConfirmPressed={() => onConfirmPressed()}
            />

            <AwesomeAlert
                show={showBankAlert}
                progressColor={'#0000ff'}
                title={bankAlertMessage === '' ? '' : alertTitle}
                titleStyle={{ fontFamily: 'Sarabun-Medium', fontSize: 20 }}
                message={bankAlertMessage === '' ? 'Loading...' : bankAlertMessage}
                messageStyle={{ fontFamily: 'Sarabun-Light', fontSize: 16, textAlign: 'center' }}
                closeOnTouchOutside={false}
                closeOnHardwareBackPress={false}
                showCancelButton={false}
                showConfirmButton={bankAlertMessage !== ''}
                confirmText='ตกลง'
                confirmButtonColor='#DD6B55'
                confirmButtonTextStyle={{ fontFamily: 'Sarabun-Regular', fontSize: 16 }}
                onConfirmPressed={() => {
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'Home' }]
                    })
                }}
            />
        </View>
    )
}

export default CheckListBank

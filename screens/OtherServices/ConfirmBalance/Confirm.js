import React, { useState, useEffect } from 'react'
import { StatusBar, Text, View, TouchableOpacity, ScrollView, Platform, ActivityIndicator, SafeAreaView } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import { TextInputMask } from 'react-native-masked-text'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import AppAlert from '../../../components/AppAlert'
import { accountNumberFormat, getAccountTypeName, getThaiMonth, prettyAmount } from '../../../util'
import { APP_KEY, ERROR_COLOR, PRIMARY_COLOR, SUCCESS_COLOR } from '../../../environment'

const Confirm = ({ navigation }) => {
    const [shareBalance, setShareBalance] = useState([])
    const [savingBalance, setSavingBalance] = useState([])
    const [loanBalance, setLoanBalance] = useState([])
    const [confirmDate, setConfirmDate] = useState('')
    const [isLoaing, setIsLoaing] = useState(true)
    const [shareName, setShareName] = useState('')
    const [showAlert, setShowAlert] = useState(false)
    const [alertMessage, setAlertMessage] = useState('')
    const [alertType, setAlertType] = useState('normal')

    const handleBackNavigator = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }]
        })
    }

    const onConfirmPressed = () => {
        if (alertType === 'auth') {
            navigation.reset({
                index: 0,
                routes: [{ name: 'PinInput' }]
            })
        } else {
            setShowAlert(false)
        }
    }

    const updateVerification = (type, index, value) => {
        if (type === 'share') {
            const updated = [...shareBalance]
            updated[index].VERIFIED = value

            if (value) {
                updated[index].REMARK = null
            }

            setShareBalance(updated)
        } else if (type === 'saving') {
            const updated = [...savingBalance]
            updated[index].VERIFIED = value

            if (value) {
                updated[index].REMARK = null
            }

            setSavingBalance(updated)
        } else {
            const updated = [...loanBalance]
            updated[index].VERIFIED = value

            if (value) {
                updated[index].REMARK = null
            }

            setLoanBalance(updated)
        }
    }

    const handleChangeRemark = (type, index, text) => {
        if (type === 'share') {
            const updated = [...shareBalance]
            updated[index].REMARK = text
            setShareBalance(updated)
        } else if (type === 'saving') {
            const updated = [...savingBalance]
            updated[index].REMARK = text
            setSavingBalance(updated)
        } else {
            const updated = [...loanBalance]
            updated[index].REMARK = text
            setLoanBalance(updated)
        }
    }

    const onSubmit = () => {
        let incorrectAccount = []
        let allRemark = []

        shareBalance.forEach((item) => {
            if (!item.VERIFIED) {
                incorrectAccount.push(item)
            }
        })
        savingBalance.forEach((item) => {
            if (!item.VERIFIED) {
                incorrectAccount.push(item)
            }
        })
        loanBalance.forEach((item) => {
            if (!item.VERIFIED) {
                incorrectAccount.push(item)
            }
        })

        incorrectAccount.forEach((item) => {
            allRemark.push(item.REMARK)
        })

        if (allRemark.includes(null)) {
            setShowAlert(true)
            setAlertMessage('กรุณาระบุคำชี้แจงสำหรับบัญชีที่ไม่ถูกต้อง')
        } else {
            navigation.navigate('ConfirmSubmit', { shareBalance, savingBalance, loanBalance, shareName: shareName })
        }
    }

    const getBalances = (apiUrl, apiKey, token) => {
        axios
            .post(`${apiUrl}/ConfirmBalance`, {
                API_KEY: apiKey
            }, {
                headers: {
                    APP_KEY: APP_KEY,
                    Authorization: `Bearer ${token}`
                }
            })
            .then(async (response) => {
                // console.log(response.data)
                const { code, item, itemdetail, message } = await response.data

                if (code === 10) {
                    try {
                        const { Confirm_Loan, Confirm_Saving, Confirm_ShrMem, Full_Name, Confirm_Date } = await item

                        const shareWithVerification = Confirm_ShrMem.map(item => ({
                            ...item,
                            VERIFIED: true,
                            TYPE: 'share'
                        }))
                        const savingWithVerification = Confirm_Saving.map(item => ({
                            ...item,
                            VERIFIED: true,
                            TYPE: 'saving'
                        }))
                        const loanWithVerification = Confirm_Loan.map(item => ({
                            ...item,
                            VERIFIED: true,
                            TYPE: 'loan'
                        }))

                        setShareBalance(shareWithVerification)
                        setSavingBalance(savingWithVerification)
                        setLoanBalance(loanWithVerification)

                        setShareName(Full_Name)

                        await AsyncStorage.setItem('token', itemdetail)

                        const dateArray = Confirm_Date.split('/').map(Number)
                        const dateTH = dateArray[0] + ' ' + getThaiMonth(dateArray[1]) + ' ' + (dateArray[2] + 543)
                        setConfirmDate(dateTH)

                        setIsLoaing(false)
                    } catch (error) {
                        console.log(error)
                    }
                } else {
                    console.log(message)
                }
            })
            .catch(err => {
                if (err.message === 'Network Error') {
                    setShowAlert(true)
                    setAlertMessage('กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่อีกครั้ง')
                    setAlertType('auth')
                    return
                } else if (err.message === 'Request failed with status code 401') {
                    setShowAlert(true)
                    setAlertMessage('คุณไม่ได้ทำรายการในเวลาที่กำหนด กรุณา Login อีกครั้ง')
                    setAlertType('auth')
                    return
                }
            })
    }

    const getData = async () => {
        const thisApiKey = await AsyncStorage.getItem('confirmShareNumber')
        const thisApiUrl = await AsyncStorage.getItem('StoreAPI_URL')
        const thisToken = await AsyncStorage.getItem('token')

        if (thisApiKey && thisApiUrl && thisToken) {
            getBalances(thisApiUrl, thisApiKey, thisToken)
        }
    }

    useEffect(() => {
        getData()
    }, [])

    return (
        <View style={{ flex: 1 }}>
            <StatusBar barStyle='light-content' />

            <View style={styles.header}>
                <SafeAreaView style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity style={{ paddingRight: 16 }} onPress={handleBackNavigator}>
                        <FontAwesome5 name='chevron-left' size={18} color='#fff' />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerText} numberOfLines={1}>ตรวจสอบข้อมูล</Text>
                    </View>
                </SafeAreaView>
            </View>

            {
                isLoaing ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator color='#0000ff' />
                    </View>
                ) : (
                    <ScrollView style={{ flex: 1, paddingHorizontal: 14 }}>
                        <View style={[{ flexDirection: 'row', justifyContent: 'flex-end', marginVertical: 16 }]}>
                            <Text style={styles.text}>ข้อมูล ณ <Text style={{ fontFamily: 'Sarabun-Bold' }}>วันที่ {confirmDate}</Text></Text>
                        </View>

                        {
                            shareBalance.length > 0 ? (
                                <View style={styles.card}>
                                    <View style={[styles.accItem, { borderBottomWidth: 0, paddingBottom: 0 }]}>
                                        <Text style={[styles.text, styles.textAccType]}>หุ้นสมาชิก</Text>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <Text style={styles.text}>เลขที่สมาชิก</Text>
                                            <Text style={styles.text}>{`${shareBalance[0].BR_NO}-01-${shareBalance[0].MEM_ID}`}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <Text style={styles.text}>ชื่อบัญชี</Text>
                                            <Text style={styles.text}>{shareName}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <Text style={styles.text}>หุ้นสะสม(บาท)</Text>
                                            <Text style={styles.text}>{prettyAmount(shareBalance[0].SHR_BAL_GO)}</Text>
                                        </View>

                                        <View style={{ flexDirection: 'row', marginTop: 10 }}>
                                            <TouchableOpacity
                                                style={{ flexDirection: 'row', flex: 1, justifyContent: 'center' }}
                                                onPress={() => updateVerification('share', 0, true)}
                                            >
                                                {
                                                    shareBalance[0].VERIFIED ? (
                                                        <FontAwesome name='circle' size={16} color={SUCCESS_COLOR} style={{ marginTop: 4, marginRight: 4 }} />
                                                    ) : (
                                                        <FontAwesome name='circle-o' size={16} color={'#777'} style={{ marginTop: 4, marginRight: 4 }} />
                                                    )
                                                }
                                                <Text style={styles.text}> ถูกต้อง</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={{ flexDirection: 'row', flex: 1, justifyContent: 'center' }}
                                                onPress={() => updateVerification('share', 0, false)}
                                            >
                                                {
                                                    shareBalance[0].VERIFIED ? (
                                                        <FontAwesome name='circle-o' size={16} color={'#777'} style={{ marginTop: 4, marginRight: 4 }} />
                                                    ) : (
                                                        <FontAwesome name='circle' size={16} color={ERROR_COLOR} style={{ marginTop: 4, marginRight: 4 }} />
                                                    )
                                                }
                                                <Text style={styles.text}> ไม่ถูกต้อง</Text>
                                            </TouchableOpacity>
                                        </View>

                                        {
                                            !shareBalance[0].VERIFIED ? (
                                                <TextInputMask
                                                    placeholder='คำชี้แจง'
                                                    type={'custom'}
                                                    options={{ mask: '******************************' }}
                                                    value={shareBalance[0].REMARK}
                                                    onChangeText={(text) => handleChangeRemark('share', 0, text)}
                                                    style={[styles.input, { marginBottom: 0 }]}
                                                />
                                            ) : null
                                        }
                                    </View>
                                </View>
                            ) : null
                        }

                        {
                            savingBalance.length > 0 ? (
                                <View style={styles.card}>
                                    {
                                        savingBalance.map((item, i) => (
                                            <View style={styles.accItem} key={i}>
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

                                                <View style={{ flexDirection: 'row', marginTop: 10 }}>
                                                    <TouchableOpacity
                                                        style={{ flexDirection: 'row', flex: 1, justifyContent: 'center' }}
                                                        onPress={() => updateVerification('saving', i, true)}
                                                    >
                                                        {
                                                            item.VERIFIED ? (
                                                                <FontAwesome name='circle' size={16} color={SUCCESS_COLOR} style={{ marginTop: 4, marginRight: 4 }} />
                                                            ) : (
                                                                <FontAwesome name='circle-o' size={16} color={'#777'} style={{ marginTop: 4, marginRight: 4 }} />
                                                            )
                                                        }
                                                        <Text style={styles.text}> ถูกต้อง</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        style={{ flexDirection: 'row', flex: 1, justifyContent: 'center' }}
                                                        onPress={() => updateVerification('saving', i, false)}
                                                    >
                                                        {
                                                            item.VERIFIED ? (
                                                                <FontAwesome name='circle-o' size={16} color={'#777'} style={{ marginTop: 4, marginRight: 4 }} />
                                                            ) : (
                                                                <FontAwesome name='circle' size={16} color={ERROR_COLOR} style={{ marginTop: 4, marginRight: 4 }} />
                                                            )
                                                        }
                                                        <Text style={styles.text}> ไม่ถูกต้อง</Text>
                                                    </TouchableOpacity>
                                                </View>

                                                {
                                                    !item.VERIFIED ? (
                                                        <TextInputMask
                                                            placeholder='คำชี้แจง'
                                                            type={'custom'}
                                                            options={{ mask: '******************************' }}
                                                            value={item.REMARK}
                                                            onChangeText={(text) => handleChangeRemark('saving', i, text)}
                                                            style={[styles.input, { marginBottom: 0 }]}
                                                        />
                                                    ) : null
                                                }
                                            </View>
                                        ))
                                    }
                                </View>
                            ) : null
                        }

                        {
                            loanBalance.length > 0 ? (
                                <View style={styles.card}>
                                    {
                                        loanBalance.map((item, i) => (
                                            <View style={styles.accItem} key={i}>
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

                                                <View style={{ flexDirection: 'row', marginTop: 10 }}>
                                                    <TouchableOpacity
                                                        style={{ flexDirection: 'row', flex: 1, justifyContent: 'center' }}
                                                        onPress={() => updateVerification('loan', i, true)}
                                                    >
                                                        {
                                                            item.VERIFIED ? (
                                                                <FontAwesome name='circle' size={16} color={SUCCESS_COLOR} style={{ marginTop: 4, marginRight: 4 }} />
                                                            ) : (
                                                                <FontAwesome name='circle-o' size={16} color={'#777'} style={{ marginTop: 4, marginRight: 4 }} />
                                                            )
                                                        }
                                                        <Text style={styles.text}> ถูกต้อง</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        style={{ flexDirection: 'row', flex: 1, justifyContent: 'center' }}
                                                        onPress={() => updateVerification('loan', i, false)}
                                                    >
                                                        {
                                                            item.VERIFIED ? (
                                                                <FontAwesome name='circle-o' size={16} color={'#777'} style={{ marginTop: 4, marginRight: 4 }} />
                                                            ) : (
                                                                <FontAwesome name='circle' size={16} color={ERROR_COLOR} style={{ marginTop: 4, marginRight: 4 }} />
                                                            )
                                                        }
                                                        <Text style={styles.text}> ไม่ถูกต้อง</Text>
                                                    </TouchableOpacity>
                                                </View>

                                                {
                                                    !item.VERIFIED ? (
                                                        <TextInputMask
                                                            placeholder='คำชี้แจง'
                                                            type={'custom'}
                                                            options={{ mask: '******************************' }}
                                                            value={item.REMARK}
                                                            onChangeText={(text) => handleChangeRemark('loan', i, text)}
                                                            style={[styles.input, { marginBottom: 0 }]}
                                                        />
                                                    ) : null
                                                }
                                            </View>
                                        ))
                                    }
                                </View>
                            ) : null
                        }

                        <View style={{ flexDirection: 'row', }}>
                            <Text style={styles.remarkText}>หมายเหตุ:</Text>
                            <View>
                                <Text style={styles.remarkText}>- ข้อมูลนี้เป็นยอดเงิน ณ <Text style={{ fontFamily: 'Sarabun-SemiBold', color: ERROR_COLOR }}>วันที่ {confirmDate}</Text></Text>
                                <Text style={styles.remarkText}>- ธุรกรรมที่เกิดหลังจากวันดังล่าวจะไม่นำมาแสดงตรงนี้</Text>
                                <Text style={styles.remarkText}>- ซึ่งอาจทำให้ไม่ตรงกับยอดเงินปัจจุบัน ถือว่า <Text style={{ fontFamily: 'Sarabun-SemiBold', color: SUCCESS_COLOR }}>ปกติ</Text></Text>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.button} onPress={onSubmit}>
                            <Text style={styles.buttonText}>ถัดไป</Text>
                        </TouchableOpacity>
                    </ScrollView>
                )
            }

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

export default Confirm

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
        lineHeight: 36,
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
        borderRadius: 8,
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 16,
        ...Platform.select({
            ios: {
                shadowColor: '#555',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
            },
            android: {
                elevation: 5,
            },
        }),
    },
    accItem: {
        borderBottomColor: '#ccc',
        borderBottomWidth: 1,
        paddingBottom: 16,
        marginBottom: 16
    },
    input: {
        marginTop: 8,
        backgroundColor: '#fff',
        fontFamily: 'Sarabun-Light',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        fontSize: '14@s',
        color: '#333',
        paddingHorizontal: '12@s',
        marginBottom: '10@s'
    },
    remark: {

    },
    remarkText: {
        fontFamily: 'Sarabun-Regular',
        fontSize: 13,
        color: '#555',
        paddingVertical: 2
    }
})

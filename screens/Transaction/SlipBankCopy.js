import React, { useEffect, useState, useRef } from 'react'
import {
    Text,
    View,
    ScrollView,
    ImageBackground,
    Image,
    TouchableOpacity,
    SafeAreaView,
    Alert,
    PermissionsAndroid,
    Platform
} from 'react-native'
import { styles } from '../../styles/slip'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { captureRef } from 'react-native-view-shot'
import { bankAccountNumberFormat, hideAccountNumber, prettyAmount, removeDash, searchBankIcon, searchBankName } from '../../util'
import { CameraRoll } from '@react-native-camera-roll/camera-roll'
import Share from 'react-native-share'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { APP_NAME, PRIMARY_COLOR } from '../../environment'
import QRCode from 'react-native-qrcode-svg'
import { ToastProvider, Toast } from '../../components/Toast'
import { addScreenshotListener } from 'react-native-detector'
import DeviceInfo from 'react-native-device-info'

const SlipBankCopy = ({ navigation, route }) => {
    const {
        PromptPayAccountNo,
        PromptPayAccountName,
        ToBankId,
        SenderName,
        SenderReference,
        Amount,
        memo,
        SLIP_NO,
        CREATE_DATE,
        promptPayType
    } = route.params

    const viewRef = useRef()

    const [isSaved, setIsSave] = useState(false)
    const [fee, setFee] = useState(7)

    const handleBackNavigator = () => {
        if (isSaved) {
            navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }]
            })
        }
    }

    const getPermissionAndroid = async () => {
        try {
            let deviceVersion = DeviceInfo.getSystemVersion()
            let granted = PermissionsAndroid.RESULTS.DENIED

            if (deviceVersion >= 12) {
                granted = PermissionsAndroid.RESULTS.GRANTED
            } else {
                granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    {
                        'title': `${APP_NAME} ต้องการเข้าถึงข้อมูลไฟล์ของคุณ`,
                        'message': `${APP_NAME} ต้องการเข้าถึงข้อมูลไฟล์ของคุณ เพื่อที่คุณจะสามารถบันทึกรูปภาพได้`
                    }
                )
            }

            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                return true
            } else {
                Alert.alert(
                    'ไม่สามารถบันทึกได้',
                    `คุณยังไม่ได้อนุญาตให้แอป ${APP_NAME} บันทึกรูปลงเครื่อง กรุณาตั้งค่าจัดการแอป`,
                    [{ text: 'OK' }],
                    { cancelable: false },
                )

                return false
            }
        } catch (error) {
            console.log(error)
        }
    }

    const downloadImage = async () => {
        try {
            if (Platform.OS === 'android') {
                const granted = await getPermissionAndroid()
                if (!granted) {
                    return
                }
            }

            const uri = await captureRef(viewRef, {
                format: 'png',
                quality: 0.8,
            })

            const image = CameraRoll.save(uri, { type: 'photo', album: 'Ibnuauf' })

            if (image) {
                showToast()
            }
        } catch (error) {
            console.log('error', error)
        }
    }

    const ShareImage = async () => {
        try {
            const uri = await captureRef(viewRef, {
                format: 'png',
                quality: 0.8,
            })

            await Share.open({ url: uri })
        } catch (error) {
            console.log('error', error)
        }

    }

    const showToast = () => {
        Toast.show('บันทึกรูปภาพสำเร็จ')

        setIsSave(true)
    }

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
        setTimeout(() => {
            downloadImage()
        }, 500)

        const getData = async () => {
            try {
                const fee = await AsyncStorage.getItem('Fee')

                if (fee !== null) {
                    setFee(+fee)
                }
            } catch (err) {
                console.log(err)
            }
        }

        getData()
    }, [])

    return (
        <ToastProvider>
            <SafeAreaView style={styles.container}>
                <ScrollView>
                    <View collapsable={false} ref={viewRef}>
                        <ImageBackground source={require('../../assets/qr-background.png')} style={styles.slip}>
                            <View style={styles.body}>
                                <View style={styles.logo}>
                                    <Image style={{ width: 349 / 1.5, height: 100 / 1.5 }} source={require('../../assets/logo-slip.png')} />
                                </View>

                                <View style={[styles.header, { top: 0, paddingVertical: 0, paddingBottom: 20 }]}>
                                    <AntDesign name='checkcircle' size={28} color='#00CC00' />
                                    <Text style={styles.successText}> โอนเงินสำเร็จ</Text>
                                    <Text style={styles.refText}>{CREATE_DATE}</Text>
                                    <Text style={styles.refText}>รหัสอ้างอิง: {SLIP_NO}</Text>
                                </View>

                                <View style={styles.subSection1}>
                                    <Image style={styles.icon} source={require('../../assets/Ibnuauf-Logo-for-App.png')} />

                                    <View>
                                        <Text style={styles.largeText} numberOfLines={1}>{SenderName}</Text>
                                        <Text style={styles.secondaryText}>{hideAccountNumber(removeDash(SenderReference))}</Text>
                                        <Text style={styles.secondaryText}>วาดีอะห์</Text>
                                    </View>
                                </View>

                                <View style={{ paddingHorizontal: 20 }}>
                                    <AntDesign name='arrowdown' size={32} color='#999' alignItems='center' />
                                </View>

                                <View style={styles.subSection1}>
                                    <View style={[styles.icon, { justifyContent: 'center', alignItems: 'center' }]}>
                                        {
                                            promptPayType !== 'ACCNO' ? (
                                                promptPayType !== 'NATID' ? (
                                                    <Image style={styles.bankIcon} source={require('../../assets/bank/smartphone.png')} />
                                                ) : (
                                                    <Image style={styles.bankIcon} source={require('../../assets/bank/idcard.png')} />
                                                )
                                            ) : (
                                                <Image style={styles.bankIcon} source={searchBankIcon(ToBankId)} />
                                            )
                                        }
                                    </View>

                                    <View>
                                        <Text style={styles.largeText} numberOfLines={1}>{PromptPayAccountName}</Text>

                                        {
                                            promptPayType === 'ACCNO' ? (
                                                <View>
                                                    <Text style={styles.secondaryText}>{bankAccountNumberFormat(PromptPayAccountNo)}</Text>
                                                    <Text style={styles.secondaryText}>{searchBankName(ToBankId)}</Text>
                                                </View>
                                            ) : (
                                                <View>
                                                    {
                                                        PromptPayAccountNo.length === 10 ? (
                                                            <Text style={styles.secondaryText}>xxx xxx {PromptPayAccountNo.slice(6, 11)}</Text>
                                                        ) : (
                                                            <Text style={styles.secondaryText}>{bankAccountNumberFormat(PromptPayAccountNo)}</Text>
                                                        )
                                                    }

                                                    <Text style={styles.secondaryText}>พร้อมเพย์</Text>
                                                </View>
                                            )
                                        }

                                    </View>
                                </View>

                                <View style={styles.amountContainer}>
                                    <View style={{ flex: 1 }}>
                                        <View style={styles.subSection}>
                                            <Text style={styles.primaryText}>จำนวนเงิน</Text>
                                            <Text style={styles.largeText}>{prettyAmount(Amount)} บาท</Text>
                                        </View>

                                        <View style={styles.subSection}>
                                            <Text style={styles.secondaryText}>ค่าธรรมเนียม</Text>
                                            <Text style={[styles.secondaryText]}>{prettyAmount(fee)} บาท</Text>
                                        </View>

                                        <View style={styles.subSection}>
                                            <Text style={[styles.primaryText, { color: '#4096ff' }]}>ยอดรวม</Text>
                                            <Text style={[styles.largeText, { color: '#4096ff' }]}><Text style={{ fontSize: 18 }}>{prettyAmount(Amount + fee)}</Text> บาท</Text>
                                        </View>

                                        {
                                            memo && memo !== '' && (
                                                <View style={styles.subSection}>
                                                    <Text style={styles.secondaryText}>บันทึกช่วยจำ</Text>
                                                    <Text style={styles.secondaryText}>{memo}</Text>
                                                </View>
                                            )
                                        }
                                    </View>

                                    {/* <View style={{ marginLeft: 12 }}>
                                        <QRCode
                                            value={`12345678958542125522156156489782112154487996512345678958542125522156156489782`}
                                            size={70}
                                        />
                                    </View> */}
                                </View>
                            </View>
                        </ImageBackground>
                    </View>

                    <View style={styles.menuContainer}>
                        <TouchableOpacity style={styles.menuItem} onPress={() => handleBackNavigator()}>
                            <View style={styles.menuIcon}>
                                <AntDesign name='home' size={24} color={PRIMARY_COLOR} />
                            </View>
                            <Text style={styles.menuText}>กลับหน้าหลัก</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem} onPress={ShareImage}>
                            <View style={styles.menuIcon}>
                                <AntDesign name='sharealt' size={24} color={PRIMARY_COLOR} />
                            </View>
                            <Text style={styles.menuText}>แชร์</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </ToastProvider>
    )
}

export default SlipBankCopy

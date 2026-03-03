import React, { useEffect, useRef, useState } from 'react'
import {
    Text,
    ScrollView,
    SafeAreaView,
    Alert,
    View,
    Image,
    TouchableOpacity,
    ImageBackground,
    PermissionsAndroid,
    Platform,
    BackHandler
} from 'react-native'
import { captureRef } from 'react-native-view-shot'
import { scale } from 'react-native-size-matters'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { prettyAmount } from '../../util'
import { CameraRoll } from '@react-native-camera-roll/camera-roll'
import Share from 'react-native-share'
import { APP_NAME, PRIMARY_COLOR } from '../../environment'
import { ToastProvider, Toast } from '../../components/Toast'
import DeviceInfo from 'react-native-device-info'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { addScreenshotListener } from 'react-native-detector'
import { styles } from '../../styles/slip'

const SlipCopy = ({ route, navigation }) => {
    const {
        createDate,
        sourceAccountName,
        sourceAccountNumber,
        sourceAccountType,
        amount,
        destinationAccountName,
        destinationAccountNumber,
        destinationAccountType,
        slipNo,
        memo
    } = route.params

    const viewRef = useRef()

    const [slipImage, setSlipImage] = useState(null)

    const handleBackNavigator = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }]
        })
    }

    const getPermissionAndroid = async () => {
        try {
            let deviceVersion = DeviceInfo.getSystemVersion()
            let granted = PermissionsAndroid.RESULTS.DENIED

            if (deviceVersion >= 13) {
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

    const showToast = () => {
        Toast.show('บันทึกรูปภาพสำเร็จ')
    }

    const downloadImage = async () => {
        try {
            // อนุญาตการเข้าถึง
            if (Platform.OS === 'android') {
                const granted = await getPermissionAndroid()
                if (!granted) {
                    return
                }
            }

            // แคปหน้าจอ
            const uri = await captureRef(viewRef, {
                format: 'png',
                quality: 0.8,
            })

            // บันทึกรูปลงเครื่อง
            const image = CameraRoll.save(uri, { type: 'photo', album: 'BinaConnect' })

            if (image) {
                showToast()
            }
        } catch (error) {
            console.log('error', error)
        }
    }

    useEffect(() => {
        setTimeout(() => {
            downloadImage()
        }, 500)

        const getData = async () => {
            try {
                const slipImg = await AsyncStorage.getItem('Slip')

                if (slipImg !== null) {
                    setSlipImage(slipImg)
                }
            } catch (err) {
                console.log(err)
            }
        }

        getData()
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
            navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }]
            })
            return true
        }

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        )

        return () => backHandler.remove()
    })

    const ShareImage = async () => {
        try {
            // capture component 
            const uri = await captureRef(viewRef, {
                format: 'png',
                quality: 0.8,
            })

            // share
            await Share.open({ url: uri })
        } catch (error) {
            console.log('error', error)
        }
    }

    return (
        <ToastProvider>
            <SafeAreaView style={styles.container}>
                <ScrollView>
                    <View collapsable={false} ref={viewRef}>
                        <ImageBackground source={!slipImage ? require('../../assets/background-Slip.png') : { uri: slipImage }} style={styles.slip}>
                            <View style={styles.body}>
                                <View style={styles.header}>
                                    <AntDesign name='checkcircle' size={40} color='#00CC00' />

                                    <Text style={styles.successText}>โอนเงินสำเร็จ</Text>
                                    <Text style={styles.refText}>{createDate}</Text>
                                    <Text style={styles.refText}>รหัสอ้างอิง: {slipNo}</Text>
                                </View>

                                <View style={[styles.subSection1, { marginTop: 20 }]}>
                                    <Image style={styles.icon} source={require('../../assets/new-logo-barakah3.png')} />

                                    <View>
                                        <Text style={styles.primaryText} numberOfLines={1}>{sourceAccountName}</Text>
                                        <Text style={styles.secondaryText}>{sourceAccountNumber}</Text>
                                        <Text style={styles.secondaryText}>({sourceAccountType})</Text>
                                    </View>
                                </View>

                                <View style={{ paddingHorizontal: 22 }}>
                                    <AntDesign name='arrowdown' size={28} color='#aaa' alignItems='center' />
                                </View>

                                <View style={styles.subSection1}>
                                    <Image style={styles.icon} source={require('../../assets/new-logo-barakah3.png')} />

                                    <View>
                                        <Text style={styles.primaryText} numberOfLines={1}>
                                            {destinationAccountName}
                                        </Text>
                                        <Text style={styles.secondaryText}>{destinationAccountNumber}</Text>
                                        <Text style={styles.secondaryText}>({destinationAccountType ? destinationAccountType : 'สมาชิกทั่วไป'})</Text>
                                    </View>
                                </View>

                                <View style={{ paddingVertical: 15 }}>
                                    <View style={styles.subSection}>
                                        <Text style={styles.primaryText}>จำนวนเงิน</Text>
                                        <Text style={styles.primaryText}><Text style={{ fontFamily: 'Sarabun-Medium', fontSize: scale(18) }}>{prettyAmount(amount)}</Text> บาท</Text>
                                    </View>

                                    <View style={styles.subSection}>
                                        <Text style={styles.primaryText}>ค่าธรรมเนียม</Text>
                                        <Text style={styles.primaryText}>0.00 บาท</Text>
                                    </View>

                                    {
                                        memo && memo !== '' && (
                                            <View style={styles.subSection}>
                                                <Text style={styles.primaryText}>บันทึกช่วยจำ</Text>
                                                <Text style={styles.secondaryText}>{memo}</Text>
                                            </View>
                                        )
                                    }
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

export default SlipCopy
/*
    หน้า HomeScreen.js เป็นหน้าที่แสดงเมนูต่าง ๆ ของแอพ
*/
import React, { useState, useEffect, useRef } from 'react'
import {
    View,
    Text,
    ImageBackground,
    Image,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    AppState,
    SafeAreaView,
    Platform,
    ScrollView,
    BackHandler
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import { scale } from 'react-native-size-matters'
import AppAlert from '../components/AppAlert'
import { launchImageLibrary } from 'react-native-image-picker'
import Ionicons from 'react-native-vector-icons/Ionicons'
import NetInfo from '@react-native-community/netinfo'
import Card from '../components/Card'
import { styles } from '../styles/home'
import { APP_KEY, API_URL_TEST_DIRECT, COOP_NAME } from '../environment'
import { addScreenshotListener } from 'react-native-detector'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Drawer from '../components/Drawer'

const HomeScreen = ({ route, navigation }) => {
    const [showAlert, setShowAlert] = useState(false)
    const [showConfirmAlert, setShowConfirmAlert] = useState(false)
    const [showExitAlert, setShowExitAlert] = useState(false)
    const [alertMessage, setAlertMessage] = useState('')
    const [alertType, setAlertType] = useState('normal')
    const [apiKey, setApiKey] = useState(null)
    const [photo, setPhoto] = useState(null)
    const [userName, setUserName] = useState('')
    const [shareNo, setShareNo] = useState('')
    const [isConnect, setIsConnect] = useState(false)
    const [bannerImage, setBannerImage] = useState(null)
    const [openDrawer, setOpenDrawer] = useState(false)

    const appState = useRef(AppState.currentState)

    const menu = [
        {
            id: 1,
            name: 'บัญชีหุ้น',
            icon: require('../assets/icon/iconShare_B.png')
        },
        {
            id: 2,
            name: 'เงินฝาก',
            icon: require('../assets/icon/iconDeposit_B.png')
        },
        {
            id: 3,
            name: 'สินเชื่อ',
            icon: require('../assets/icon/iconCredit_B.png')
        },
        {
            id: 4,
            name: 'สวัสดิการ',
            icon: require('../assets/icon/icon1_B.png')
        },
        {
            id: 5,
            name: 'โอน-ผ่อนชำระ',
            icon: require('../assets/icon/iconTransfer_B.png')
        },
        {
            id: 6,
            name: 'บริการอื่นๆ',
            icon: require('../assets/icon/iconWelfare_B.png')
        },
    ]

    const screenHandler = (id) => {
        switch (id) {
            case 1: return navigation.navigate('ShareAccount', { previousScreen: route.name })
            case 2: return navigation.navigate('Saving', { previousScreen: route.name })
            case 3: return navigation.navigate('Loan', { previousScreen: route.name })
            case 4: return navigation.navigate('Test', { previousScreen: route.name })
            case 5: return navigation.navigate('TransactionMenu', { previousScreen: route.name })
            case 6: return navigation.navigate('ServiceList', { previousScreen: route.name })
            default: return navigation.navigate('home')
        }
    }

    const onSkip = async () => {
        try {
            await AsyncStorage.setItem('SkipStatus', 'Y')
        } catch (error) {
            console.log(error)
        }
        setShowConfirmAlert(false)
    }

    const signOut = async () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'PinInput' }]
        })

        BackHandler.exitApp()
    }

    const handleChoosePhoto = () => {
        const option = {}

        launchImageLibrary(option, async (response) => {
            if (!response.didCancel) {
                setPhoto(response.assets[0].uri)

                try {
                    await AsyncStorage.setItem('imageUri', response.assets[0].uri)
                }
                catch (err) {
                    console.log(err)
                }
            }
        })
    }

    useEffect(() => {
        const getImage = async () => {
            try {
                const imageUri = await AsyncStorage.getItem('imageUri')
                if (imageUri !== null) {
                    setPhoto(imageUri)
                }
            } catch (error) {
                console.log(error)
            }
        }

        getImage()
    }, [photo])

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state) => {
            setIsConnect(state.isInternetReachable)
        })

        return () => {
            unsubscribe()
        }
    }, [isConnect])

    const getConfirmStatus = async (apiKey) => {
        const StoreAPI_URL = await AsyncStorage.getItem('StoreAPI_URL')
        const Storagetoken = await AsyncStorage.getItem('token')

        if (StoreAPI_URL && Storagetoken) {
            axios
                .post(`${StoreAPI_URL}/HomeMember`, {
                    API_KEY: apiKey
                }, {
                    headers: {
                        APP_KEY: APP_KEY,
                        Authorization: `Bearer ${Storagetoken}`
                    }
                })
                .then(async (response) => {
                    // console.log(response.data.item)
                    const { code, item, itemdetail } = response.data
                    if (code === 10) {
                        try {
                            await AsyncStorage.setItem('token', itemdetail)

                            const SkipStatus = await AsyncStorage.getItem('SkipStatus')

                            if (item.Confirm_Balance_Status === 'Y' && SkipStatus !== 'Y') {
                                setShowConfirmAlert(true)
                                return
                            }
                        } catch (error) {
                            console.log(error);
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

    const getBannerInfo = async () => {
        try {
            const UserName = await AsyncStorage.getItem('UserName')
            const shareNo = await AsyncStorage.getItem('shareNo')
            const apiKey = await AsyncStorage.getItem('confirmShareNumber')
            const bannerImg = await AsyncStorage.getItem('Banner')

            if (bannerImg !== null) {
                setBannerImage(bannerImg)
            }

            if (UserName !== null) {
                setUserName(UserName)
            }

            if (shareNo !== null) {
                setShareNo(shareNo)

                if (shareNo === '002-01-99999') {
                    console.log('user test')
                    await AsyncStorage.setItem('StoreAPI_URL', API_URL_TEST_DIRECT)
                }
            }

            if (apiKey !== null) {
                setApiKey(apiKey)
                getConfirmStatus(apiKey)
            }

        } catch (error) {

        }
    }

    useEffect(() => {
        getBannerInfo()
    }, [route])

    useEffect(() => {
        const subscription = AppState.addEventListener('change', _handleAppStateChange)

        subscription.remove()
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
            setShowExitAlert(true)
            return true
        }

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction)

        return () => backHandler.remove()
    })

    const _handleAppStateChange = (nextAppState) => {
        if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
            // console.log('App has come to the foreground!')
        }

        appState.current = nextAppState

        if (appState.current === 'active') {
            getInfo()
        }
    }

    const getInfo = async () => {
        NetInfo.addEventListener(async (state) => {
            if (state.isInternetReachable) {
                const StoreAPI_URL = await AsyncStorage.getItem('StoreAPI_URL')
                const Storagetoken = await AsyncStorage.getItem('token')
                axios
                    .post(`${StoreAPI_URL}/HomeMember`, {
                        API_KEY: apiKey
                    }, {
                        headers: {
                            APP_KEY: APP_KEY,
                            Authorization: `Bearer ${Storagetoken}`
                        }
                    })
                    .then((response) => {
                        // console.log(response.data)
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
            } else {
                setShowAlert(true)
                setAlertMessage('กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตและลองใหม่อีกครั้ง')
                setAlertType('net')
            }
        })
    }

    const AppHeader = ({ onPress }) => {
        return (
            <View style={[styles.header]}>
                <SafeAreaView style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity style={{ marginRight: 16 }} onPress={onPress}>
                        <FontAwesome name='bars' size={20} color='#fff' />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerText} numberOfLines={1}>{COOP_NAME}</Text>
                    </View>
                </SafeAreaView>
            </View>
        )
    }

    return (
        <ImageBackground source={require('../assets/white-wallpapers.jpg')} blurRadius={10} style={styles.image}>
            <View style={styles.container}>
                {
                    userName !== null && shareNo !== null ? (
                        <View style={styles.body}>
                            <View style={styles.banner}>
                                <AppHeader onPress={() => setOpenDrawer(true)} />

                                <ImageBackground source={!bannerImage ? require('../assets/banner.png') : { uri: bannerImage }} style={styles.bannerImage}>
                                    <View style={styles.welcomeContainer}>
                                        <TouchableOpacity style={styles.avatar} onPress={() => handleChoosePhoto()}>
                                            {
                                                photo ? (
                                                    <Image source={{ uri: photo }} style={{ width: scale(70), height: scale(70), borderRadius: scale(70) / 2, marginRight: scale(-8) }} />
                                                ) : (
                                                    <Image source={require('../assets/avatar.png')} style={{ width: scale(75), height: scale(75), marginRight: scale(-15) }} />
                                                )
                                            }
                                        </TouchableOpacity>

                                        <View style={styles.userInfo}>
                                            <Text style={styles.bannerText} numberOfLines={1}>{userName}</Text>
                                            <Text style={styles.bannerText}>{shareNo}</Text>
                                        </View>
                                    </View>
                                </ImageBackground>

                                <View style={styles.totalContainer}>
                                    <TouchableOpacity style={[styles.totalBox, { borderRightWidth: 1, borderRightColor: '#e7e7e7' }]} onPress={() => navigation.navigate('QrCodeScanner')} >
                                        <Image source={require('../assets/scan.png')} style={{ width: 26, height: 26 }} />
                                        <Text style={styles.totalText}>สแกน</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={[styles.totalBox, { borderLeftWidth: 1, borderLeftColor: '#e7e7e7' }]} onPress={() => navigation.navigate('QrReceve')} >
                                        <Ionicons name='qr-code-outline' size={26} color='#004068' />
                                        <Text style={styles.totalText}>QR รับเงิน</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <SafeAreaView style={styles.menuContainer}>
                                <ScrollView>
                                    <FlatList
                                        numColumns={2}
                                        keyExtractor={(item) => item.id}
                                        data={menu}
                                        scrollEnabled={false}
                                        renderItem={({ item }) => (
                                            <Card>
                                                <TouchableOpacity style={styles.menuCard} onPress={() => screenHandler(item.id)}>
                                                    <Image source={item.icon} style={styles.iconImage} />
                                                    <Text style={styles.primaryText} numberOfLines={1}>{item.name}</Text>
                                                </TouchableOpacity>
                                            </Card>
                                        )}
                                    />
                                </ScrollView>
                            </SafeAreaView>
                        </View>
                    ) : (
                        <View style={{ height: '92%', justifyContent: 'center', alignItems: 'center' }}>
                            <ActivityIndicator color='#0000ff' />
                        </View>
                    )
                }
            </View>

            <Drawer
                visible={openDrawer}
                onClose={() => setOpenDrawer(false)}
                onExit={() => {
                    setOpenDrawer(false)
                    setShowExitAlert(true)
                }}
            />

            <AppAlert
                visible={showAlert}
                title={alertMessage === '' ? alertMessage : ' ไม่สำเร็จ'}
                message={alertMessage === '' ? 'Loading...' : alertMessage}
                showConfirm={alertMessage !== ''}
                showCancel={false}
                onConfirm={() => {
                    setShowAlert(false)
                    if (alertType !== 'net') {
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'PinInput' }]
                        })
                    }
                    setAlertType('normal')
                }}
                onCancel={() => setShowAlert(false)}
            />

            <AppAlert
                visible={showConfirmAlert}
                title={'ยืนยันข้อมูล'}
                message={'ก่อนดำเนินการต่อ กรุณายืนยันยอดหุ้น เงินฝาก และสินเชื่อของคุณกับสหกรณ์'}
                showCancel={true}
                cancelText={'ไว้ทีหลัง'}
                onConfirm={() => {
                    setShowConfirmAlert(false)
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'Confirm' }]
                    })
                }}
                onCancel={onSkip}
            />

            <AppAlert
                visible={showExitAlert}
                title={'ยืนยันการออกจากระบบ?'}
                message={'แอปจะถูกปิดอัตโนมัติเมื่อออกจากระบบ'}
                showCancel={true}
                onConfirm={signOut}
                onCancel={() => setShowExitAlert(false)}
            />
        </ImageBackground>
    )
}

export default HomeScreen
import React, { useEffect, useState, useRef } from 'react'
import {
    Text,
    ScrollView,
    SafeAreaView,
    Alert,
    View,
    Image,
    Modal,
    TouchableOpacity,
    ImageBackground,
    PermissionsAndroid,
    Platform,
    BackHandler,
    Pressable,
    TextInput,
    ActivityIndicator
} from 'react-native'
import { captureRef } from 'react-native-view-shot'
import { scale } from 'react-native-size-matters'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { prettyAmount, removeDash } from '../../util'
import { CameraRoll } from '@react-native-camera-roll/camera-roll'
import Share from 'react-native-share'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import { APP_KEY, APP_NAME, PRIMARY_COLOR } from '../../environment'
import { ToastProvider, Toast } from '../../components/Toast'
import { styles } from '../../styles/slip'
import { addScreenshotListener } from 'react-native-detector'
import DeviceInfo from 'react-native-device-info'

const Slip = ({ route, navigation }) => {
    const { ref3, sourceAccount, destinationAccount, memo, SLIP, CREATE_DATE, other, favoritesArray, transactionType } = route.params

    const favoriteType = '01'

    const viewRef = useRef()

    const [token, setToken] = useState(null)
    const [apiKey, setApiKey] = useState(null)
    const [modalVisible, setModalVisible] = useState(false)
    const [favorites, setFavorites] = useState(null)
    const [isFavorite, setIsFavorite] = useState(false)
    const [API_URL, setAPI_URL] = useState(null)
    const [isDone, setIsDone] = useState(false)
    const [slipImage, setSlipImage] = useState(null)

    const handleBackNavigator = () => {
        if (isDone) {
            navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }]
            })
        }
    }

    const onSave = () => {
        if (transactionType === 'ผ่อนชำระ') {
            axios
                .post(`${API_URL}/InsertFavorite`, {
                    API_KEY: apiKey,
                    TYPE: '01',
                    ACC_TYPE: destinationAccount.LCONT_ID,
                    FAVORITE_NAME: favorites,
                    MEM_ID_REC: other.slice(7, 12),
                    BR_NO_REC: other.slice(0, 3),
                    AMOUNT: ref3
                }, {
                    headers: {
                        APP_KEY: APP_KEY,
                        Authorization: `Bearer ${token}`
                    }
                })
                .then(async (response) => {
                    // console.log(response.data)
                    if (response.data.code === 10) {
                        try {
                            await AsyncStorage.setItem('token', response.data.item)
                        } catch (err) {
                            console.log(err)
                        }

                        setIsFavorite(true)
                    } else {
                        console.log(response.data.message)
                    }
                })
                .catch(err => {
                    console.log(err.message)
                })
        } else {
            axios
                .post(`${API_URL}/InsertFavorite`, {
                    API_KEY: apiKey,
                    TYPE: '01',
                    ACC_TYPE: removeDash(destinationAccount.ACCOUNT_NO) || removeDash(destinationAccount.SHR_),
                    FAVORITE_NAME: favorites,
                    AMOUNT: ref3
                }, {
                    headers: {
                        APP_KEY: APP_KEY,
                        Authorization: `Bearer ${token}`
                    }
                })
                .then(async (response) => {
                    // console.log(response.data)
                    if (response.data.code === 10) {
                        try {
                            await AsyncStorage.setItem('token', response.data.item)
                        } catch (err) {
                            console.log(err)
                        }

                        setIsFavorite(true)
                    } else {
                        console.log(response.data.message)
                    }
                })
                .catch(err => {
                    console.log(err.message)
                })
        }

        setModalVisible(!modalVisible)
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
                setIsDone(true)
            }
        } catch (error) {
            console.log('error', error)
        }
    }

    const showToast = () => {
        Toast.show('บันทึกรูปภาพสำเร็จ')
    }

    const getFavorites = async (apiKey, token, API_URL) => {
        await axios
            .post(`${API_URL}/Favorite`, {
                API_KEY: apiKey,
                TYPE: favoriteType,
            }, {
                headers: {
                    APP_KEY: APP_KEY,
                    Authorization: `Bearer ${token}`
                }
            })
            .then(async (response) => {
                // console.log(await response.data)
                if (await response.data.code === 10) {
                    const favorites = response.data.item.FAVORITE.filter(
                        favorite => favorite.TYPE === '01'
                    )

                    try {
                        await AsyncStorage.setItem('token', response.data.item.Token)
                    } catch (err) {
                        console.log(err)
                    }

                    const favorite = item => removeDash(item.ACC_TYPE) === removeDash(destinationAccount.SHR_) || removeDash(item.ACC_TYPE) === removeDash(destinationAccount.ACCOUNT_NO) || removeDash(item.ACC_TYPE) === removeDash(destinationAccount.LCONT_ID)
                    const isFavorite = favorites.some(favorite)

                    setIsFavorite(isFavorite)

                    setFavorites(favorites)
                } else {
                    setFavorites([])
                }
            })
            .catch(err => {
                console.log(err.message)
            })
    }

    useEffect(() => {
        setTimeout(() => {
            downloadImage()
        }, 500)

        const getData = async () => {
            try {
                const StoreAPI_URL = await AsyncStorage.getItem('StoreAPI_URL')
                const token = await AsyncStorage.getItem('token')
                const apiKey = await AsyncStorage.getItem('confirmShareNumber')
                const slipImg = await AsyncStorage.getItem('Slip')

                if (slipImg !== null) {
                    setSlipImage(slipImg)
                }

                if (StoreAPI_URL !== null && token !== null && apiKey !== null) {
                    setApiKey(apiKey)
                    setToken(token)
                    setAPI_URL(StoreAPI_URL)

                    if (!favoritesArray) {
                        setTimeout(() => {
                            getFavorites(apiKey, token, StoreAPI_URL)
                        }, 1000)
                    } else {
                        const favorite = item => removeDash(item.ACC_TYPE) === removeDash(destinationAccount.SHR_) || removeDash(item.ACC_TYPE) === removeDash(destinationAccount.ACCOUNT_NO) || removeDash(item.ACC_TYPE) === removeDash(destinationAccount.LCONT_ID)
                        const isFavorite = favoritesArray.some(favorite)

                        setIsFavorite(isFavorite)

                        setFavorites(favoritesArray)
                    }

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
            handleBackNavigator()
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
            const uri = await captureRef(viewRef, {
                format: 'png',
                quality: 0.8,
            })

            await Share.open({ url: uri })
        } catch (error) {
            console.log('error', error)
        }

    }

    return (
        favorites !== null ? (
            <ToastProvider>
                <SafeAreaView style={styles.container}>
                    <ScrollView>
                        <View collapsable={false} ref={viewRef}>
                            <ImageBackground source={!slipImage ? require('../../assets/background-Slip.png') : { uri: slipImage }} style={styles.slip}>
                                <View style={styles.body}>
                                    <View style={styles.header}>
                                        <AntDesign name='checkcircle' size={40} color='#00CC00' />
                                        <Text style={styles.successText}> โอนเงินสำเร็จ</Text>
                                        <Text style={[styles.secondaryText, styles.refText]}>{CREATE_DATE}</Text>
                                        <Text style={[styles.secondaryText, styles.refText]}>รหัสอ้างอิง: {SLIP}</Text>
                                    </View>

                                    <View style={[styles.subSection1, { marginTop: 20 }]}>
                                        <Image style={styles.icon} source={require('../../assets/Ibnuauf-Logo-for-App.png')} />

                                        <View>
                                            <Text style={styles.largeText} numberOfLines={1}>{sourceAccount.ACCOUNT_NAME}</Text>
                                            <Text style={styles.secondaryText}>{sourceAccount.ACCOUNT_SHOW}</Text>
                                            <Text style={styles.secondaryText}>({sourceAccount.ACC_DESC})</Text>
                                        </View>
                                    </View>

                                    <View style={{ paddingHorizontal: 17 }}>
                                        <AntDesign name='arrowdown' size={32} color='#777' alignItems='center' />
                                    </View>

                                    <View style={styles.subSection1}>
                                        <Image style={styles.icon} source={require('../../assets/Ibnuauf-Logo-for-App.png')} />

                                        <View >
                                            <Text style={styles.largeText} numberOfLines={1}>{destinationAccount.ACCOUNT_NAME || destinationAccount.NAME || other}</Text>
                                            <Text style={styles.secondaryText}>{destinationAccount.ACCOUNT_SHOW || destinationAccount.ACCOUNT_NO || destinationAccount.SHR_ || destinationAccount.LCONT_ID}</Text>
                                            <Text style={styles.secondaryText}>({destinationAccount.ACC_DESC || destinationAccount.SHR_TYPE || destinationAccount.LSUB_NAME})</Text>
                                        </View>
                                    </View>

                                    <View style={{ paddingVertical: 15 }}>
                                        <View style={styles.subSection}>
                                            <Text style={styles.primaryText}>จำนวนเงิน</Text>
                                            <Text style={styles.largeText}><Text style={{ fontSize: scale(18) }}>{prettyAmount(ref3)}</Text> บาท</Text>
                                        </View>

                                        <View style={styles.subSection}>
                                            <Text style={styles.primaryText}>ค่าธรรมเนียม</Text>
                                            <Text style={[styles.largeText, { fontFamily: 'Sarabun-Regular' }]}>0.00 บาท</Text>
                                        </View>

                                        {
                                            memo !== '' && (
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
                            <TouchableOpacity style={styles.menuItem} onPress={() => isDone && handleBackNavigator()} >
                                <View style={styles.menuIcon}>
                                    <AntDesign name='home' size={24} color={PRIMARY_COLOR} />
                                </View>

                                <Text style={styles.menuText}>กลับหน้าหลัก</Text>
                            </TouchableOpacity>
                            {
                                isFavorite ? (
                                    <View style={styles.menuItem} >
                                        <View style={styles.menuIcon}>
                                            <AntDesign name='heart' size={24} color={PRIMARY_COLOR} />
                                        </View>

                                        <Text style={styles.menuText}>บันทึกแล้ว</Text>
                                    </View>
                                ) : (
                                    <TouchableOpacity style={styles.menuItem} onPress={() => setModalVisible(true)} >
                                        <View style={styles.menuIcon}>
                                            <AntDesign name='hearto' size={24} color={PRIMARY_COLOR} />
                                        </View>

                                        <Text style={styles.menuText}>บันทึกรายการโปรด</Text>
                                    </TouchableOpacity>
                                )
                            }
                            <TouchableOpacity style={styles.menuItem} onPress={ShareImage} >
                                <View style={styles.menuIcon}>
                                    <AntDesign name='sharealt' size={24} color={PRIMARY_COLOR} />
                                </View>

                                <Text style={styles.menuText}>แชร์</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </SafeAreaView>

                <Modal
                    animationType='fade'
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(!modalVisible)}
                >
                    <View style={styles.favoriteModalCenteredView}>
                        <View style={styles.favoriteModalView}>
                            <Text style={styles.favoriteModalText}>ชื่อรายการโปรด</Text>

                            <TextInput style={styles.input} onChangeText={text => setFavorites(text)} />

                            <View style={styles.buttonContainer}>
                                <Pressable style={[styles.favoriteModalButton, styles.buttonCancel]} onPress={() => setModalVisible(!modalVisible)} >
                                    <Text style={styles.favoriteModalTextStyle}>ยกเลิก</Text>
                                </Pressable>

                                <Pressable style={[styles.favoriteModalButton, styles.buttonOk]} onPress={() => onSave()} >
                                    <Text style={styles.favoriteModalCloseTextStyle}>เสร็จ</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </Modal>
            </ToastProvider>
        ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator color='#0000ff' />
            </View>
        )
    )
}

export default Slip

import React, { useState, useEffect } from 'react'
import { Text, View, TouchableOpacity, Image, StatusBar, BackHandler, Platform, SafeAreaView } from 'react-native'
import { scale, ScaledSheet } from 'react-native-size-matters'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import { launchImageLibrary } from 'react-native-image-picker'
import AsyncStorage from '@react-native-async-storage/async-storage'
import AntDesign from 'react-native-vector-icons/AntDesign'
import AppAlert from '../../components/AppAlert'
import { addScreenshotListener } from 'react-native-detector'
import { PRIMARY_COLOR } from '../../environment'

const Setting = ({ navigation }) => {
    const [photo, setPhoto] = useState(null)
    const [userName, setUserName] = useState(null)
    const [shareNo, setShareNo] = useState(null)
    const [modalVisible, setModalVisible] = useState(false)

    const handleBackNavigator = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }]
        })
    }

    const onConfirm = async () => {
        try {
            const keys = await AsyncStorage.getAllKeys();

            keys.forEach(async key => {
                if (key !== 'StoreAPI_URL' && key !== 'KEY_AUTHEN' && key !== 'Fee' && key !== 'Maximum_Limit' && key !== 'BankAccountCode') {
                    await AsyncStorage.removeItem(key)

                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'DeleteAccountSuccess' }]
                    })
                }
            })
        } catch (error) {
            console.error(error)
        }
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
        const getInfo = async () => {
            try {
                const userName = await AsyncStorage.getItem('UserName')
                const imageUri = await AsyncStorage.getItem('imageUri')
                const shareNo = await AsyncStorage.getItem('shareNo')

                if ({ userName, shareNo } !== null || imageUri !== null) {
                    setUserName(userName)
                    setPhoto(imageUri)
                    setShareNo(shareNo)
                }
            } catch (error) {
                console.log(error)
            }
        }

        getInfo()
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
                    <TouchableOpacity style={{ paddingRight: 16 }} onPress={handleBackNavigator}>
                        <FontAwesome5 name='chevron-left' size={18} color='#fff' />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerText} numberOfLines={1}>การตั้งค่า</Text>
                    </View>
                </SafeAreaView>
            </View>

            <View style={styles.body}>
                <View style={styles.userInfo}>
                    <TouchableOpacity onPress={handleChoosePhoto}>
                        {
                            photo ? (
                                <Image source={{ uri: photo }} style={styles.userImage} />
                            ) : (
                                <Image source={require('../../assets/avatar.png')} style={styles.avatarImage} />
                            )
                        }
                    </TouchableOpacity>

                    <View style={{}}>
                        <Text style={styles.infoText}>{userName}</Text>
                        <Text style={[styles.infoText, { fontSize: scale(13), fontFamily: 'Sarabun-Light' }]}>{shareNo}</Text>
                    </View>
                </View>

                <View style={styles.menuType}>
                    <Text style={[styles.menuText, { fontSize: scale(13) }]}>การตั้งค่าบัญชี</Text>
                </View>

                <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('AccountSetting')}>
                    <Text style={styles.menuText}>จัดการบัญชี</Text>
                    <AntDesign name='right' size={20} color='#bfbfbf' />
                </TouchableOpacity>

                <View style={styles.menuType}>
                    <Text style={[styles.menuText, { fontSize: scale(13) }]}>การตั้งค่าแอป</Text>
                </View>

                <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('ChangePassword')}>
                    <Text style={styles.menuText}>เปลี่ยนรหัสผ่าน</Text>
                    <AntDesign name='right' size={20} color='#bfbfbf' />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('ChangePin')}>
                    <Text style={styles.menuText}>เปลี่ยนรหัส PIN</Text>
                    <AntDesign name='right' size={20} color='#bfbfbf' />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => setModalVisible(true)}>
                    <Text style={styles.menuText}>ลบบัญชีผู้ใช้</Text>
                    <AntDesign name='right' size={20} color='#bfbfbf' />
                </TouchableOpacity>
            </View>

            <AppAlert
                visible={modalVisible}
                title='ลบบัญชีผู้ใช้'
                message='การลบบัญชีผู้ใช้ ข้อมูลของคุณจะถูกลบทั้งหมด คุณต้องการยืนยันการลบบัญชีผู้ใช้หรือไม่'
                showCancel={true}
                onConfirm={onConfirm}
                onCancel={() => setModalVisible(false)}
            />
        </View>
    )
}

export default Setting

const styles = ScaledSheet.create({
    container: {
        flex: 1,
    },
    headerText: {
        fontSize: '16@s',
        lineHeight: 46,
        paddingVertical: 3,
        color: '#fff',
        fontFamily: 'Sarabun-Medium'
    },
    body: {
        backgroundColor: '#fafafa',
        flex: 1,
    },
    userImage: {
        width: '60@s',
        height: '60@s',
        borderRadius: '30@s',
        marginRight: '14@s'
    },
    avatarImage: {
        width: '60@s',
        height: '60@s',
        marginRight: '14@s'
    },
    userInfo: {
        flexDirection: 'row',
        padding: '20@s',
        borderBottomColor: '#d9d9d9',
        borderBottomWidth: 0.5,
    },
    infoText: {
        fontFamily: 'Sarabun-Regular',
        color: '#595959',
        fontSize: '15@s',
        paddingVertical: '2@s',
    },
    menuType: {
        height: '50@vs',
        padding: '10@s',
        backgroundColor: '#d9d9d9',
        justifyContent: 'center',
    },
    menuItem: {
        height: '60@vs',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10@s',
        borderBottomColor: '#d9d9d9',
        borderBottomWidth: 0.5,
    },
    menuText: {
        fontFamily: 'Sarabun-Regular',
        color: '#595959',
        fontSize: '14@s',
        padding: '3@s',
    },
    header: {
        padding: 16,
        backgroundColor: PRIMARY_COLOR
    },
})

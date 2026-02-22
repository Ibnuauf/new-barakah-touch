import React, { useState, useEffect } from 'react'
import { Text, View, ScrollView, TouchableOpacity, ActivityIndicator, BackHandler, SafeAreaView, Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import AppAlert from '../../components/AppAlert'
import FavoriteGroup from '../../components/Favorites/FavoriteGroup'
import AppHeader2 from '../../components/AppHeader2'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { styles } from '../../styles/favorite'
import { APP_KEY } from '../../environment'
import { getFavoriteAccounts, getFavoriteLoans, getFavoriteShares, getFavoriteBank } from '../../util'
import ActionSheet from '../../components/ActionSheet'
import { addScreenshotListener } from 'react-native-detector'

const typeItem = [
    {
        id: 1,
        name: 'บัญชีเงินฝาก'
    },
    {
        id: 2,
        name: 'ฝากหุ้น'
    },
    {
        id: 3,
        name: 'ผ่อนชำระ'
    },
    {
        id: 4,
        name: 'บัญชีธนาคาร/พร้อมเพย์'
    },
]

const FavoriteDashboard = ({ route, navigation }) => {
    const { previousScreen } = route.params

    const [favorites, setFavorite] = useState(null)
    const [favoriteShares, setFavoriteShares] = useState(null)
    const [favoriteAccounts, setFavoriteAccount] = useState(null)
    const [favoriteLoans, setFavoriteLoans] = useState(null)
    const [favoriteBankAccounts, setFavoriteBankAccounts] = useState(null)
    const [modalVisible, setModalVisible] = useState(false)
    const [showAlert, setShowAlert] = useState(false)
    const [alertMessage, setAlertMessage] = useState('')

    const handleBackNavigator = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: previousScreen }]
        })
    }

    //  แยกประเภทรายการโปรด
    const classifyFavirite = (favorites) => {
        setFavoriteShares(getFavoriteShares(favorites))
        setFavoriteAccount(getFavoriteAccounts(favorites))
        setFavoriteLoans(getFavoriteLoans(favorites))
        setFavoriteBankAccounts(getFavoriteBank(favorites))
    }

    const onSelect = id => {
        if (id === 'บัญชีธนาคาร/พร้อมเพย์') {
            navigation.navigate('CreateBankFavorite', { previousScreen })
        } else {
            navigation.navigate('CreateFavorite', { id, previousScreen })
        }

        setModalVisible(false)
    }

    const Alert = () => {
        return (
            <AppAlert
                visible={showAlert}
                title={alertMessage === '' ? alertMessage : ' ไม่สำเร็จ'}
                message={alertMessage === '' ? 'Loading...' : alertMessage}
                showConfirm={alertMessage !== ''}
                showCancel={false}
                onConfirm={() => {
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'PinInput' }]
                    })
                }}
                onCancel={() => setShowAlert(false)}
            />
        )
    }

    useEffect(() => {
        const getData = async () => {
            try {
                const StoreAPI_URL = await AsyncStorage.getItem('StoreAPI_URL')
                const token = await AsyncStorage.getItem('token')
                const apiKey = await AsyncStorage.getItem('confirmShareNumber')
                if (StoreAPI_URL !== null && token !== null && apiKey !== null) {
                    axios
                        .post(`${StoreAPI_URL}/Favorite`, {
                            API_KEY: apiKey,
                            TYPE: previousScreen === 'TransactionMenu' ? '01' : '02'
                        }, {
                            headers: {
                                APP_KEY: APP_KEY,
                                Authorization: `Bearer ${token}`
                            }
                        })
                        .then(async (response) => {
                            if (response.data.code === 10) {
                                const favorites = response.data.item.FAVORITE.filter(
                                    favorite => favorite.TYPE === previousScreen === 'TransactionMenu' ? '01' : '02'
                                )

                                try {
                                    await AsyncStorage.setItem('token', response.data.item.Token)
                                } catch (err) {
                                    console.log(err)
                                }

                                setFavorite(favorites)

                                classifyFavirite(favorites)
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

    if (favorites === null) {
        return (
            <View style={{ flex: 1 }}>
                <AppHeader2 onPress={handleBackNavigator} />

                <View style={styles.emptyContainer}>
                    <ActivityIndicator color='#0000ff' />
                </View>

                <Alert />
            </View>
        )
    } else {
        return (
            <View style={styles.container}>
                <AppHeader2 onPress={handleBackNavigator} />

                <View style={styles.labelBox}>
                    <Text style={styles.labelText}>รายการโปรด</Text>
                    <TouchableOpacity onPress={() => setModalVisible(true)}>
                        <Ionicons name='person-add-outline' size={24} color='#595959' style={{ paddingRight: 6 }} />
                    </TouchableOpacity>
                </View>

                <SafeAreaView style={{ flex: 1 }}>
                    <ScrollView>
                        {
                            favoriteAccounts?.length > 0 && <FavoriteGroup favorites={favoriteAccounts} type={'บัญชีเงินฝาก'} previousScreen={previousScreen} />
                        }
                        {
                            favoriteShares?.length > 0 && <FavoriteGroup favorites={favoriteShares} type={'ฝากหุ้น'} previousScreen={previousScreen} />
                        }
                        {
                            favoriteLoans?.length > 0 && <FavoriteGroup favorites={favoriteLoans} type={'ผ่อนชำระ'} previousScreen={previousScreen} />
                        }
                        {
                            favoriteBankAccounts?.length > 0 && <FavoriteGroup favorites={favoriteBankAccounts} type={'บัญชีธนาคาร/พร้อมเพย์'} previousScreen={previousScreen} />
                        }
                    </ScrollView>
                </SafeAreaView>

                <ActionSheet
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    title='ประเภท'
                >
                    <View style={{ width: '100%' }}>
                        {
                            typeItem.map((item) => (
                                <TouchableOpacity style={styles.modalItemBox} key={item.id} onPress={() => onSelect(item.name)}>
                                    <Text style={styles.modalItemText}>{item.name}</Text>
                                </TouchableOpacity>
                            ))
                        }
                    </View>
                </ActionSheet>

                <Alert />
            </View>
        )
    }
}

export default FavoriteDashboard

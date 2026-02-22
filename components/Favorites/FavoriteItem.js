import React, { useState, useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'
import { TouchableOpacity, Text, View, Image, Modal, TextInput } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Ionicons from 'react-native-vector-icons/Ionicons'
import axios from 'axios'
import AppAlert from '../AppAlert'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { accountNumberFormat, shareNumberFormat } from '../../util'
import { APP_KEY } from '../../environment'

const FavoriteItem = ({ type, item, previousScreen }) => {
    const navigation = useNavigation()

    const { BR_NO_REC, MEM_ID_REC, ACC_TYPE, FAVORITE_NAME, ACC_TYPE_NAME, AMOUNT } = item

    const [editModalVisible, setEditModalVisible] = useState(false)
    const [deleteModalVisible, setDeleteModalVisible] = useState(false)
    const [newFavoriteName, setNewFavoriteName] = useState(FAVORITE_NAME)
    const [showAlert, setShowAlert] = useState(false)
    const [alertMessage, setAlertMessage] = useState('')
    const [alertType, setAlertType] = useState('normal')
    const [token, setToken] = useState(null)
    const [apiKey, setApiKey] = useState(null)
    const [API_URL, setAPI_URL] = useState(null)

    const onSelectItem = () => {
        if (previousScreen === 'TransactionMenu') {
            switch (type) {
                case 'บัญชีเงินฝาก': return navigation.navigate('TransferMoney', { favoriteNumber: ACC_TYPE, previousScreen, favAmount: AMOUNT })
                case 'ฝากหุ้น': return navigation.navigate('SharePayment', { favoriteNumber: ACC_TYPE, previousScreen, favAmount: AMOUNT })
                case 'ผ่อนชำระ': return navigation.navigate('LoanPayment', { favoriteNumber: ACC_TYPE, favoriteShare: BR_NO_REC + '-01-' + MEM_ID_REC, previousScreen, favAmount: AMOUNT })
                default: return
            }
        } else if (previousScreen === 'PromptPayList') {
            switch (type) {
                case 'บัญชีเงินฝาก': return navigation.navigate('Deposit', { favoriteNumber: ACC_TYPE, previousScreen })
                case 'ฝากหุ้น': return navigation.navigate('ShareDeposit', { favoriteNumber: ACC_TYPE, previousScreen })
                case 'ผ่อนชำระ': return navigation.navigate('PayOffLoan', { favoriteNumber: ACC_TYPE, favoriteShare: BR_NO_REC + '-01-' + MEM_ID_REC, previousScreen })
                default: return
            }
        }
    }

    const onConfirmPressed = () => {
        setShowAlert(false)
        setAlertMessage('')
        setAlertType('normal')

        if (alertType === 'Authen') {
            navigation.reset({
                index: 0,
                routes: [{ name: 'PinInput' }]
            })
        }
    }

    const showNumber = (number) => {
        if (number?.length === 10) {
            return shareNumberFormat(number)
        } else if (number?.length === 11) {
            return accountNumberFormat(number)
        } else {
            return number
        }
    }

    const onEditConfirm = () => {
        axios
            .post(`${API_URL}/UpdateFavorite`, {
                API_KEY: apiKey,
                TYPE: previousScreen === 'TransactionMenu' ? '01' : '02',
                ACC_TYPE: ACC_TYPE,
                FAVORITE_NAME: newFavoriteName
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

                        navigation.navigate('FavoriteSuccess', { type, newFavoriteName, previousScreen })
                        setEditModalVisible(false)

                    } catch (err) {
                        console.log(err)
                    }
                } else {
                    setShowAlert(true)
                    setAlertMessage(response.data.message)
                }
            })
            .catch(err => {
                if (err.message === 'Network Error') {
                    setShowAlert(true)
                    setAlertMessage('กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่อีกครั้ง')
                    setAlertType('Authen')
                } else if (err.message === 'Request failed with status code 401') {
                    setShowAlert(true)
                    setAlertMessage('คุณไม่ได้ทำรายการในเวลาที่กำหนด กรุณา Login อีกครั้ง')
                    setAlertType('Authen')
                }
            })
    }

    const onDeleteConfirm = () => {
        axios
            .post(`${API_URL}/DeleteFavorite`, {
                API_KEY: apiKey,
                TYPE: previousScreen === 'TransactionMenu' ? '01' : '02',
                ACC_TYPE: ACC_TYPE,
            }, {
                headers: {
                    APP_KEY: APP_KEY,
                    Authorization: `Bearer ${token}`
                }
            })
            .then(async (response) => {
                if (response.data.code === 10) {
                    try {
                        await AsyncStorage.setItem('token', response.data.item)

                        navigation.navigate('FavoriteDeleted', { type, favoriteName: FAVORITE_NAME, previousScreen })
                        setDeleteModalVisible(false)

                    } catch (err) {
                        console.log(err)
                    }
                } else {
                    setShowAlert(true)
                    setAlertMessage(response.data.message)
                }
            })
            .catch(err => {
                if (err.message === 'Network Error') {
                    setShowAlert(true)
                    setAlertMessage('กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่อีกครั้ง')
                    setAlertType('Authen')
                } else if (err.message === 'Request failed with status code 401') {
                    setShowAlert(true)
                    setAlertMessage('คุณไม่ได้ทำรายการในเวลาที่กำหนด กรุณา Login อีกครั้ง')
                    setAlertType('Authen')
                }
            })
    }

    useEffect(() => {
        const getData = async () => {
            try {
                const StoreAPI_URL = await AsyncStorage.getItem('StoreAPI_URL')
                const token = await AsyncStorage.getItem('token')
                const apiKey = await AsyncStorage.getItem('confirmShareNumber')

                if (token !== null) {
                    setToken(token)
                }

                if (apiKey !== null) {
                    setApiKey(apiKey)
                }

                if (StoreAPI_URL !== null) {
                    setAPI_URL(StoreAPI_URL)
                }

            } catch (error) {
                console.log(error)
            }
        }

        getData()
    }, [])

    return (
        <TouchableOpacity style={styles.container} onPress={onSelectItem}>
            <View style={styles.iconBox}>
                <Image
                    style={styles.accountIcon}
                    source={require('../../assets/Ibnuauf-Logo-for-App.png')}
                />
            </View>
            <View style={styles.detailBox}>
                <Text style={styles.favoriteTitle} numberOfLines={1}>{FAVORITE_NAME}</Text>
                <Text style={styles.detailTxt} numberOfLines={1}>{ACC_TYPE_NAME}</Text>
                <Text style={styles.detailTxt} numberOfLines={1}>{showNumber(ACC_TYPE)}</Text>
            </View>
            <View style={styles.editBox}>
                <TouchableOpacity style={{ padding: 8 }} onPress={() => setEditModalVisible(true)}>
                    <MaterialIcons name='mode-edit' size={20} color='#95de64' />
                </TouchableOpacity>

                <TouchableOpacity style={{ padding: 8 }} onPress={() => setDeleteModalVisible(true)}>
                    <Ionicons name='trash-sharp' size={20} color='#ff7875' />
                </TouchableOpacity>
            </View>

            <Modal
                animationType='slide'
                transparent={true}
                visible={editModalVisible}
                onRequestClose={() => {
                    setEditModalVisible(!editModalVisible)
                }}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>แก้ไขรายการโปรด</Text>
                        <View style={styles.inputBox}>
                            <TextInput
                                autoFocus={true}
                                style={styles.input}
                                onChangeText={text => setNewFavoriteName(text)}
                                value={newFavoriteName}
                            />
                            <Ionicons name='pricetag-outline' size={22} color='#8c8c8c' />
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10 }}>
                            <TouchableOpacity style={[styles.button, styles.cancelBtn]} onPress={() => setEditModalVisible(false)}>
                                <Text style={[styles.buttonText, styles.cancelBtnText]}>ยกเลิก</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.button, styles.okBtn]} onPress={onEditConfirm}>
                                <Text style={[styles.buttonText, styles.okBtnText]}>ตกลง</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal
                animationType='slide'
                transparent={true}
                visible={deleteModalVisible}
                onRequestClose={() => {
                    setDeleteModalVisible(!deleteModalVisible)
                }}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>ยืนยันการลบรายการโปรด</Text>
                        <Text style={[styles.modalText, { fontFamily: 'Sarabun-Light', textAlign: 'center' }]}>รายการนี้จะถูกลบออกจากรายการโปรดของคุณ</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10 }}>
                            <TouchableOpacity style={[styles.button, styles.cancelBtn]} onPress={() => setDeleteModalVisible(false)}>
                                <Text style={[styles.buttonText, styles.cancelBtnText]}>ยกเลิก</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.button, styles.confirmDeleteBtn]} onPress={onDeleteConfirm}>
                                <Text style={[styles.buttonText, styles.okBtnText]}>ตกลง</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <AppAlert
                visible={showAlert}
                title={alertMessage === '' ? alertMessage : ' ไม่สำเร็จ'}
                message={alertMessage === '' ? 'Loading...' : alertMessage}
                showConfirm={alertMessage !== ''}
                showCancel={false}
                onConfirm={onConfirmPressed}
                onCancel={() => setShowAlert(false)}
            />
        </TouchableOpacity>
    )
}

export default FavoriteItem

const styles = ScaledSheet.create({
    container: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        width: '100%',
        marginBottom: 10,
        paddingVertical: '10@vs',
        borderRadius: 10,
        borderColor: '#ccc',
        borderWidth: 0.5,
        shadowColor: '#555',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 3,
    },
    iconBox: {
        flex: 0.2,
        justifyContent: 'center',
        alignItems: 'center'
    },
    detailBox: {
        flex: 0.5,
    },
    accountIcon: {
        width: '45@s',
        height: '45@s',
    },
    favoriteTitle: {
        fontFamily: 'Sarabun-Regular',
        fontSize: '14@s',
        color: '#333',
        paddingVertical: '1.5@vs',
    },
    detailTxt: {
        fontFamily: 'Sarabun-Light',
        fontSize: '12@s',
        color: '#333',
        paddingVertical: '1.5@vs',
    },
    editBox: {
        flex: 0.3,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center'
    },
    // ----- Modal ----- //
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)'
    },
    modalView: {
        margin: 20,
        backgroundColor: '#fff',
        width: '70%',
        borderRadius: 10,
        padding: 35,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    button: {
        marginHorizontal: '10@s',
        paddingHorizontal: '25@s',
        paddingVertical: '6@vs',
        borderRadius: '5@s'
    },
    cancelBtn: {
        borderColor: '#8c8c8c',
        borderWidth: 1
    },
    okBtn: {
        backgroundColor: '#52c41a',
    },
    confirmDeleteBtn: {
        backgroundColor: '#ff7875',
    },
    buttonText: {
        fontFamily: 'Sarabun-Medium',
        fontSize: '14@s'
    },
    cancelBtnText: {
        color: '#8c8c8c',
    },
    okBtnText: {
        color: '#fff',
    },
    modalText: {
        marginBottom: 15,
        fontFamily: 'Sarabun-Medium',
        fontSize: '14@s',
        color: '#434343',
        padding: '3@s'
    },
    // ----------------------- //
    inputBox: {
        marginTop: '5@vs',
        backgroundColor: '#fff',
        height: '45@vs',
        borderBottomWidth: 0.5,
        borderBottomColor: '#bfbfbf',
        paddingHorizontal: '12@s',
        marginBottom: '10@s',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    input: {
        width: '80%',
        height: '100%',
        fontFamily: 'Sarabun-Light',
        fontSize: '14@s',
        color: '#434343',
    },
})

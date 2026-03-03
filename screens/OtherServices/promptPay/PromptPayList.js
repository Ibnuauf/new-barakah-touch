/*
    หน้า PromptPayList.js คือหน้าที่โชว์เมนูบริการต่าง ๆ ที่เกี่ยวกับ 'พร้อมเพย์ (QR Code)'
*/

import React, { useEffect } from 'react'
import { View, Text, TouchableOpacity, BackHandler, Image, ScrollView, Platform } from 'react-native'
import { menuListStyles } from '../../../styles/menuList'
import AppHeader2 from '../../../components/AppHeader2'
import { addScreenshotListener } from 'react-native-detector'

export default function PromptPayList({ route, navigation }) {
    const handleBackNavigator = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'ServiceList' }]
        })
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
        <View style={menuListStyles.container}>
            <AppHeader2 onPress={handleBackNavigator} />

            <View style={[menuListStyles.labelBox, { borderBottomColor: '#ccc', borderBottomWidth: 1 }]}>
                <Text style={menuListStyles.labelText}>พร้อมเพย์ (QR Code)</Text>
            </View>

            <ScrollView>
                <View style={{ alignItems: 'center' }}>
                    <TouchableOpacity style={menuListStyles.statementBox} onPress={() => { navigation.navigate('Deposit', { previousScreen: route.name }) }}>
                        <Image source={require('../../../assets/transaction-icon/transfer-money.png')} style={menuListStyles.icon} />

                        <View>
                            <Text style={menuListStyles.titleText}>ฝากเข้าบัญชีเงินฝาก</Text>
                            <Text style={menuListStyles.secondaryText}>(วาดีอะฮ์, มูฎอรอบะฮ์, ฮัจญ์และอุมเราะห์)</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={menuListStyles.statementBox} onPress={() => { navigation.navigate('ShareDeposit', { previousScreen: route.name }) }}>
                        <Image source={require('../../../assets/transaction-icon/share-bag.png')} style={menuListStyles.icon} />

                        <View>
                            <Text style={menuListStyles.titleText}>ฝากเข้าบัญชีหุ้น</Text>
                            <Text style={menuListStyles.secondaryText}>(ชารีกะฮ์)</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={menuListStyles.statementBox} onPress={() => { navigation.navigate('PayOffLoan', { previousScreen: route.name }) }}>
                        <Image source={require('../../../assets/transaction-icon/installment.png')} style={menuListStyles.icon} />

                        <Text style={menuListStyles.titleText}>ชำระสินเชื่อ</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={menuListStyles.statementBox} onPress={() => { navigation.navigate('FavoriteDashboard', { previousScreen: route.name }) }}>
                        <Image source={require('../../../assets/transaction-icon/favorite-icon.png')} style={menuListStyles.icon} />

                        <Text style={menuListStyles.titleText}>รายการโปรด</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    )
}

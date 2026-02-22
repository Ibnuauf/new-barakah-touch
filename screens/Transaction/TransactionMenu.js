import React, { useEffect } from 'react'
import { View, Text, TouchableOpacity, BackHandler, Image, ScrollView, Platform } from 'react-native'
import { menuListStyles } from '../../styles/menuList'
import AppHeader2 from '../../components/AppHeader2'
import { addScreenshotListener } from 'react-native-detector'

export default function TransactionMenu({ route, navigation }) {
  const handleBackNavigator = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }]
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

      <View style={[menuListStyles.labelBox, menuListStyles.headerBox]}>
        <Text style={menuListStyles.labelText}>ธุรกรรมภายใน</Text>
      </View>

      <ScrollView>
        <View style={menuListStyles.listContainer}>
          <TouchableOpacity style={menuListStyles.statementBox} onPress={() => { navigation.navigate('TransferMoney', { previousScreen: route.name }) }}>
            <Image source={require('../../assets/transfer-money.png')} style={menuListStyles.icon} />

            <View>
              <Text style={menuListStyles.titleText}> โอนเข้าบัญชีเงินฝาก</Text>
              <Text style={menuListStyles.secondaryText}> (วาดีอะฮ์, มูฎอรอบะฮ์, ฮัจญ์และอุมเราะห์)</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={menuListStyles.statementBox} onPress={() => { navigation.navigate('SharePayment', { previousScreen: route.name }) }}>
            <Image source={require('../../assets/share-bag.png')} style={menuListStyles.icon} />

            <View>
              <Text style={menuListStyles.titleText}> โอนเข้าบัญชีหุ้น</Text>
              <Text style={menuListStyles.secondaryText}> (ชารีกะฮ์)</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={menuListStyles.statementBox} onPress={() => { navigation.navigate('LoanPayment', { previousScreen: route.name }) }}>
            <Image source={require('../../assets/installment.png')} style={menuListStyles.icon} />

            <Text style={menuListStyles.titleText}> ชำระสินเชื่อ</Text>
          </TouchableOpacity>

          <TouchableOpacity style={menuListStyles.statementBox} onPress={() => { navigation.navigate('SendToBank', { previousScreen: route.name }) }}>
            <Image source={require('../../assets/transfer-money-to-bank.png')} style={menuListStyles.icon} />

            <View>
              <Text style={menuListStyles.titleText}> โอนเงินไปยังธนาคาร</Text>
              <Text style={menuListStyles.secondaryText}> (บัญชีธนาคาร, พร้อมเพย์)</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={menuListStyles.statementBox} onPress={() => { navigation.navigate('FavoriteDashboard', { previousScreen: route.name }) }}>
            <Image source={require('../../assets/favorite-6.png')} style={menuListStyles.icon} />

            <Text style={menuListStyles.titleText}> รายการโปรด</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

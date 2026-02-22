import React, { useEffect, useState, useRef } from 'react'
import { View, Text, ImageBackground, Platform, Linking, BackHandler } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import AppAlert from './components/AppAlert'
import NetInfo from '@react-native-community/netinfo'

import { API_URL, APP_KEY, APP_VERSION, APP_NAME, API_URL_DIRECT } from './environment'
import PinScreen from './screens/PinScreen'
import HomeScreen from './screens/HomeScreen'
import LoginScreen from './screens/LoginScreen'
import RegisterScreen from './screens/RegisterScreen'
import CreatePasswordScreen from './screens/CreatePasswordScreen'
import RegisterOtp from './screens/otp/RegisterOtp'
import LoginOtp from './screens/otp/LoginOtp'
import ForgetPasswordOtp from './screens/otp/ForgetPasswordOtp'
import ForgetPinOtp from './screens/otp/ForgetPinOtp'
import TransferOtp from './screens/otp/TransferOtp'
import CreatePinScreen from './screens/CreatePinScreen'
import ForgetPassword from './screens/ForgetPassword'
import ForgetPin from './screens/ForgetPin'
import RequestOtp from './screens/RequestOtp'
import ShareAccount from './screens/ShareAccount/ShareAccount'
import Saving from './screens/Saving/Saving'
import SavingStatement from './screens/Saving/SavingStatement'
import Loan from './screens/Loan/Loan'
import LoanDetail from './screens/Loan/LoanDetail'
import MembershipCard from './screens/MembershipCard/MembershipCard'
import TransactionMenu from './screens/Transaction/TransactionMenu'
import ServiceList from './screens/OtherServices/ServiceList'
import PromptPayList from './screens/OtherServices/promptPay/PromptPayList'
import ShareDeposit from './screens/OtherServices/promptPay/ShareDeposit'
import Deposit from './screens/OtherServices/promptPay/Deposit'
import PayOffLoan from './screens/OtherServices/promptPay/PayOffLoan'
import QrCodeGenerate from './screens/OtherServices/promptPay/QrCodeGenerate'
import ConfirmStatus from './screens/OtherServices/ConfirmBalance/ConfirmStatus'
import Confirm from './screens/OtherServices/ConfirmBalance/Confirm'
import ConfirmSubmit from './screens/OtherServices/ConfirmBalance/ConfirmSubmit'
import FavoriteDashboard from './screens/Favories/FavoriteDashboard'
import CreateFavorite from './screens/Favories/CreateFavorite'
import CreateBankFavorite from './screens/Favories/CreateBankFavorite'
import FavoriteSuccess from './screens/Favories/FavoriteSuccess'
import FavoriteDeleted from './screens/Favories/FavoriteDeleted'
import QrReceve from './screens/QrReceve'
import Contact from './screens/Contact/Contact'
import Profile from './screens/drawer/Profile'
import Setting from './screens/drawer/Setting'
import AccountSetting from './screens/AccountSetting'
import CreateMainAccount from './screens/CreateMainAccount'
import ChangePassword from './screens/ChangePassword'
import ChangePin from './screens/ChangePin'
import DeleteAccountSuccess from './screens/drawer/DeleteAccountSuccess'
import ScreenshotWarning from './screens/ScreenshotWarning'
import NewsScreen from './screens/drawer/NewsScreen'
import PromotionScreen from './screens/drawer/PromotionScreen'
import FriedMarket from './screens/drawer/FriedMarket'
import OfficeScreen from './screens/drawer/OfficeScreen'
import TransferMoney from './screens/Transaction/TransferMoney'
import SharePayment from './screens/Transaction/SharePayment'
import LoanPayment from './screens/Transaction/LoanPayment'
import SendToBank from './screens/Transaction/SendToBank'
import CheckListBankOtp from './screens/Transaction/CheckListBankOtp'
import CheckList from './screens/Transaction/CheckList'
import Slip from './screens/Transaction/Slip'
import SlipBank from './screens/Transaction/SlipBank'
import SlipCopy from './screens/Transaction/SlipCopy'
import SlipBankCopy from './screens/Transaction/SlipBankCopy'
import EditPinScreen from './screens/EditPinScreen'
import EditPassword from './screens/EditPassword'
import QrCodeScanner from './screens/QrCodeScanner'
import Test from './screens/Test'

const Stack = createNativeStackNavigator()

const NotVerifiedStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // ซ่อน header ทั้งหมด
        animation: 'none'
      }}
    >
      <Stack.Screen name='Login' component={LoginScreen} />
      <Stack.Screen name='PinInput' component={PinScreen} />
      <Stack.Screen name='Home' component={HomeScreen} />
      <Stack.Screen name='Register' component={RegisterScreen} />
      <Stack.Screen name='CreatePassword' component={CreatePasswordScreen} />
      <Stack.Screen name='RegisterOtp' component={RegisterOtp} />
      <Stack.Screen name='LoginOtp' component={LoginOtp} />
      <Stack.Screen name='ForgetPasswordOtp' component={ForgetPasswordOtp} />
      <Stack.Screen name='ForgetPinOtp' component={ForgetPinOtp} />
      <Stack.Screen name='TransferOtp' component={TransferOtp} />
      <Stack.Screen name='CreatePin' component={CreatePinScreen} />
      <Stack.Screen name='ForgetPassword' component={ForgetPassword} />
      <Stack.Screen name='ForgetPin' component={ForgetPin} />
      <Stack.Screen name='RequestOtp' component={RequestOtp} />
      <Stack.Screen name='ShareAccount' component={ShareAccount} />
      <Stack.Screen name='Saving' component={Saving} />
      <Stack.Screen name='SavingStatement' component={SavingStatement} />
      <Stack.Screen name='Loan' component={Loan} />
      <Stack.Screen name='LoanDetail' component={LoanDetail} />
      <Stack.Screen name='MembershipCard' component={MembershipCard} />
      <Stack.Screen name='TransactionMenu' component={TransactionMenu} />
      <Stack.Screen name='ServiceList' component={ServiceList} />
      <Stack.Screen name='PromptPayList' component={PromptPayList} />
      <Stack.Screen name='ShareDeposit' component={ShareDeposit} />
      <Stack.Screen name='PayOffLoan' component={PayOffLoan} />
      <Stack.Screen name='Deposit' component={Deposit} />
      <Stack.Screen name='QrCodeGenerate' component={QrCodeGenerate} />
      <Stack.Screen name='ConfirmStatus' component={ConfirmStatus} />
      <Stack.Screen name='Confirm' component={Confirm} />
      <Stack.Screen name='ConfirmSubmit' component={ConfirmSubmit} />
      <Stack.Screen name='FavoriteDashboard' component={FavoriteDashboard} />
      <Stack.Screen name='CreateFavorite' component={CreateFavorite} />
      <Stack.Screen name='CreateBankFavorite' component={CreateBankFavorite} />
      <Stack.Screen name='FavoriteSuccess' component={FavoriteSuccess} />
      <Stack.Screen name='FavoriteDeleted' component={FavoriteDeleted} />
      <Stack.Screen name='QrReceve' component={QrReceve} />
      <Stack.Screen name='Contact' component={Contact} />
      <Stack.Screen name='Profile' component={Profile} />
      <Stack.Screen name='Setting' component={Setting} />
      <Stack.Screen name='AccountSetting' component={AccountSetting} />
      <Stack.Screen name='CreateMainAccount' component={CreateMainAccount} />
      <Stack.Screen name='ChangePassword' component={ChangePassword} />
      <Stack.Screen name='ChangePin' component={ChangePin} />
      <Stack.Screen name='DeleteAccountSuccess' component={DeleteAccountSuccess} />
      <Stack.Screen name='ScreenshotWarning' component={ScreenshotWarning} />
      <Stack.Screen name='NewsScreen' component={NewsScreen} />
      <Stack.Screen name='PromotionScreen' component={PromotionScreen} />
      <Stack.Screen name='FriedMarket' component={FriedMarket} />
      <Stack.Screen name='OfficeScreen' component={OfficeScreen} />
      <Stack.Screen name='TransferMoney' component={TransferMoney} />
      <Stack.Screen name='SharePayment' component={SharePayment} />
      <Stack.Screen name='LoanPayment' component={LoanPayment} />
      <Stack.Screen name='SendToBank' component={SendToBank} />
      <Stack.Screen name='CheckListBankOtp' component={CheckListBankOtp} />
      <Stack.Screen name='CheckList' component={CheckList} />
      <Stack.Screen name='Slip' component={Slip} />
      <Stack.Screen name='SlipBank' component={SlipBank} />
      <Stack.Screen name='SlipCopy' component={SlipCopy} />
      <Stack.Screen name='SlipBankCopy' component={SlipBankCopy} />
      <Stack.Screen name='EditPin' component={EditPinScreen} />
      <Stack.Screen name='EditPassword' component={EditPassword} />
      <Stack.Screen name='QrCodeScanner' component={QrCodeScanner} />
      <Stack.Screen name='Test' component={Test} />
    </Stack.Navigator>
  )
}

const VerifiedStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // ซ่อน header ทั้งหมด
        animation: 'none'
      }}
    >
      <Stack.Screen name='PinInput' component={PinScreen} />
      <Stack.Screen name='Login' component={LoginScreen} />
      <Stack.Screen name='Home' component={HomeScreen} />
      <Stack.Screen name='Register' component={RegisterScreen} />
      <Stack.Screen name='CreatePassword' component={CreatePasswordScreen} />
      <Stack.Screen name='RegisterOtp' component={RegisterOtp} />
      <Stack.Screen name='LoginOtp' component={LoginOtp} />
      <Stack.Screen name='ForgetPasswordOtp' component={ForgetPasswordOtp} />
      <Stack.Screen name='ForgetPinOtp' component={ForgetPinOtp} />
      <Stack.Screen name='TransferOtp' component={TransferOtp} />
      <Stack.Screen name='CreatePin' component={CreatePinScreen} />
      <Stack.Screen name='ForgetPassword' component={ForgetPassword} />
      <Stack.Screen name='ForgetPin' component={ForgetPin} />
      <Stack.Screen name='RequestOtp' component={RequestOtp} />
      <Stack.Screen name='ShareAccount' component={ShareAccount} />
      <Stack.Screen name='Saving' component={Saving} />
      <Stack.Screen name='SavingStatement' component={SavingStatement} />
      <Stack.Screen name='Loan' component={Loan} />
      <Stack.Screen name='LoanDetail' component={LoanDetail} />
      <Stack.Screen name='MembershipCard' component={MembershipCard} />
      <Stack.Screen name='TransactionMenu' component={TransactionMenu} />
      <Stack.Screen name='ServiceList' component={ServiceList} />
      <Stack.Screen name='PromptPayList' component={PromptPayList} />
      <Stack.Screen name='ShareDeposit' component={ShareDeposit} />
      <Stack.Screen name='PayOffLoan' component={PayOffLoan} />
      <Stack.Screen name='Deposit' component={Deposit} />
      <Stack.Screen name='QrCodeGenerate' component={QrCodeGenerate} />
      <Stack.Screen name='ConfirmStatus' component={ConfirmStatus} />
      <Stack.Screen name='Confirm' component={Confirm} />
      <Stack.Screen name='ConfirmSubmit' component={ConfirmSubmit} />
      <Stack.Screen name='FavoriteDashboard' component={FavoriteDashboard} />
      <Stack.Screen name='CreateFavorite' component={CreateFavorite} />
      <Stack.Screen name='CreateBankFavorite' component={CreateBankFavorite} />
      <Stack.Screen name='FavoriteSuccess' component={FavoriteSuccess} />
      <Stack.Screen name='FavoriteDeleted' component={FavoriteDeleted} />
      <Stack.Screen name='QrReceve' component={QrReceve} />
      <Stack.Screen name='Contact' component={Contact} />
      <Stack.Screen name='Profile' component={Profile} />
      <Stack.Screen name='Setting' component={Setting} />
      <Stack.Screen name='AccountSetting' component={AccountSetting} />
      <Stack.Screen name='CreateMainAccount' component={CreateMainAccount} />
      <Stack.Screen name='ChangePassword' component={ChangePassword} />
      <Stack.Screen name='ChangePin' component={ChangePin} />
      <Stack.Screen name='DeleteAccountSuccess' component={DeleteAccountSuccess} />
      <Stack.Screen name='ScreenshotWarning' component={ScreenshotWarning} />
      <Stack.Screen name='NewsScreen' component={NewsScreen} />
      <Stack.Screen name='PromotionScreen' component={PromotionScreen} />
      <Stack.Screen name='FriedMarket' component={FriedMarket} />
      <Stack.Screen name='OfficeScreen' component={OfficeScreen} />
      <Stack.Screen name='TransferMoney' component={TransferMoney} />
      <Stack.Screen name='SharePayment' component={SharePayment} />
      <Stack.Screen name='LoanPayment' component={LoanPayment} />
      <Stack.Screen name='SendToBank' component={SendToBank} />
      <Stack.Screen name='CheckListBankOtp' component={CheckListBankOtp} />
      <Stack.Screen name='CheckList' component={CheckList} />
      <Stack.Screen name='Slip' component={Slip} />
      <Stack.Screen name='SlipBank' component={SlipBank} />
      <Stack.Screen name='SlipCopy' component={SlipCopy} />
      <Stack.Screen name='SlipBankCopy' component={SlipBankCopy} />
      <Stack.Screen name='EditPin' component={EditPinScreen} />
      <Stack.Screen name='EditPassword' component={EditPassword} />
      <Stack.Screen name='QrCodeScanner' component={QrCodeScanner} />
      <Stack.Screen name='Test' component={Test} />
    </Stack.Navigator>
  )
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [apiKey, setApiKey] = useState(null)
  const [showExitMoal, setShowExitMoal] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [showAlertUpdate, setShowAlertUpdate] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [showAlert404, setShowAlert404] = useState(false)
  const [alert404Message, setAlert404Message] = useState('')
  const [updateUrlAndroid, setUpdateUrlAndroid] = useState('')
  const [updateUrlIOS, setUpdateUrlIOS] = useState('')

  const timerRef = useRef(null)

  const onConfirmPressed = async () => {
    setShowAlertUpdate(false)
    if (Platform.OS === 'ios') {
      await Linking.openURL(updateUrlIOS)
    } else {
      await Linking.openURL(updateUrlAndroid)
    }
  }

  const signOut = async () => {
    if (Platform.OS === 'ios') {
      navigation.reset({
        index: 0,
        routes: [{ name: 'PinInput' }]
      })
    } else {
      BackHandler.exitApp()
    }
  }

  useEffect(() => {
    const backAction = () => {
      setShowExitMoal(true)
      return true
    }

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    )

    return () => backHandler.remove()
  }, [])

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (!state.isConnected) {
        setShowAlert404(true)
        setAlert404Message('กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตและลองใหม่อีกครั้ง')
        return
      }
    })

    unsubscribe()

    const getApiKey = async () => {
      try {
        const apiKey = await AsyncStorage.getItem('confirmShareNumber')
        if (apiKey !== null) {
          setApiKey(apiKey)
        }
      } catch (err) {
        console.log(err)
      }
    }

    const fetchData = () => {
      axios.post(`${API_URL_DIRECT}/CheckVersion`, {
        VERSION_ID: APP_VERSION
      }, {
        headers: {
          APP_KEY: APP_KEY
        }
      })
        .then(async response => {
          setUpdateUrlAndroid(data.item.VERSION_URL_ANDROID)
          setUpdateUrlIOS(data.item.VERSION_URL_IOS)

          if (data.item.VERSION_ID === 'False') {
            setShowAlertUpdate(true)
            setAlertMessage(`แอปพลิเคชัน ${APP_NAME} ได้มีการอัปเดตเวอร์ชันใหม่!`)
          } else {
            setIsLoading(false)
          }

          try {
            await AsyncStorage.setItem('StoreAPI_URL', API_URL_DIRECT)
            await AsyncStorage.setItem('KEY_AUTHEN', data.item.KEY_AUTHEN)
            await AsyncStorage.setItem('BankAccountCode', data.item.BankAccountCode)
            await AsyncStorage.setItem('Maximum_Limit', data.item.Maximum_Limit)
            await AsyncStorage.setItem('Fee', data.item.Fee)
            await AsyncStorage.setItem('Banner', response.data.item.Image_Banner)
            await AsyncStorage.setItem('Slip', response.data.item.Image_Slip)
          } catch (err) {
            console.log(err)
          }
        })
        .catch(error => {
          console.log(error)
          if (
            error.message === 'Network Error' ||
            error.message === 'Request failed with status code 404' ||
            error.message === 'Request failed with status code 500'
          ) {
            setShowAlert404(true)
            setAlert404Message('ขออภัยในความไม่สะดวก ระบบไม่สามารถใช้งานได้ชั่วคราว กรุณาทำรายการอีกครั้งภายหลัง')
          }
        })
    }

    timerRef.current = setTimeout(() => {
      fetchData()
    }, 4000)

    const onApiSuccess = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }

    const checkVersion = () => {
      axios.post(`${API_URL}/CheckVersion`, {
        VERSION_ID: APP_VERSION
      }, {
        headers: {
          APP_KEY: APP_KEY
        }
      })
        .then(async response => {
          onApiSuccess()
          setUpdateUrlAndroid(response.data.item.VERSION_URL_ANDROID)
          setUpdateUrlIOS(response.data.item.VERSION_URL_IOS)

          if (response.data.item.VERSION_ID === 'False') {
            setShowAlertUpdate(true)
            setAlertMessage(`แอปพลิเคชัน ${APP_NAME} ได้มีการอัปเดตเวอร์ชันใหม่!`)
          } else {
            setIsLoading(false)
          }

          try {
            await AsyncStorage.setItem('StoreAPI_URL', API_URL)
            await AsyncStorage.setItem('KEY_AUTHEN', response.data.item.KEY_AUTHEN)
            await AsyncStorage.setItem('BankAccountCode', response.data.item.BankAccountCode)
            await AsyncStorage.setItem('Maximum_Limit', response.data.item.Maximum_Limit)
            await AsyncStorage.setItem('Fee', response.data.item.Fee)
            await AsyncStorage.setItem('Banner', response.data.item.Image_Banner)
            await AsyncStorage.setItem('Slip', response.data.item.Image_Slip)
          } catch (err) {
            console.log(err)
          }
        })
        .catch(error => {
          console.log(error)
          if (
            error.message === 'Request failed with status code 404' ||
            error.message === 'Request failed with status code 500'
          ) {
            setShowAlert404(true)
            setAlert404Message('ขออภัยในความไม่สะดวก ระบบไม่สามารถใช้งานได้ชั่วคราว กรุณาทำรายการอีกครั้งภายหลัง')
          }
        })
    }

    getApiKey()
    checkVersion()
  }, [])

  if (isLoading) {
    return (
      <ImageBackground source={require('./assets/Screen.png')} style={{ flex: 1, resizeMode: 'cover', justifyContent: 'center' }}>
        <View style={{ alignItems: 'center' }}>

          {
            APP_VERSION !== null && (
              <Text style={{ color: '#c39639', marginTop: 480 }}>Version {APP_VERSION}</Text>
            )
          }

        </View>

        <AppAlert
          visible={showAlert}
          title={alertMessage === '' ? alertMessage : ' ไม่สำเร็จ'}
          message={alertMessage === '' ? 'Loading...' : alertMessage}
          showConfirm={alertMessage !== ''}
          showCancel={false}
          onConfirm={() => {
            setShowAlert(false)
            if (Platform.OS === 'android') {
              BackHandler.exitApp()
            }
          }}
          onCancel={() => setShowAlert(false)}
        />

        <AppAlert
          visible={showAlertUpdate}
          title={`อัปเดต ${APP_NAME}`}
          message={alertMessage === '' ? 'Loading...' : alertMessage}
          showConfirm={alertMessage !== ''}
          showCancel={false}
          confirmText='อัปเดตตอนนี้'
          onConfirm={onConfirmPressed}
          onCancel={() => setShowAlertUpdate(false)}
        />

        <AppAlert
          visible={showAlert404}
          title={'ไม่สำเร็จ'}
          message={alert404Message === '' ? 'Loading...' : alert404Message}
          showConfirm={alertMessage !== ''}
          showCancel={false}
          onConfirm={() => {
            setShowAlert404(false)
            if (Platform.OS === 'android') {
              BackHandler.exitApp()
            }
          }}
          onCancel={() => setShowAlert404(false)}
        />

        <AppAlert
          visible={showExitMoal}
          title='ยืนยันการออกจากระบบ?'
          message='แอปจะถูกปิดอัตโนมัติเมื่อออกจากระบบ'
          showCancel={true}
          onConfirm={() => {
            signOut()
            setShowExitMoal(false)
          }}
          onCancel={() => setShowExitMoal(false)}
        />
      </ImageBackground>
    )
  } else {
    if (apiKey) {
      return (
        <NavigationContainer>
          <VerifiedStack />

          <AppAlert
            visible={showExitMoal}
            title='ยืนยันการออกจากระบบ?'
            message='แอปจะถูกปิดอัตโนมัติเมื่อออกจากระบบ'
            showCancel={true}
            onConfirm={() => {
              signOut()
              setShowExitMoal(false)
            }}
            onCancel={() => setShowExitMoal(false)}
          />
        </NavigationContainer>
      )
    } else {
      return (
        <NavigationContainer>
          <NotVerifiedStack />

          <AppAlert
            visible={showExitMoal}
            title='ยืนยันการออกจากระบบ?'
            message='แอปจะถูกปิดอัตโนมัติเมื่อออกจากระบบ'
            showCancel={true}
            onConfirm={() => {
              signOut()
              setShowExitMoal(false)
            }}
            onCancel={() => setShowExitMoal(false)}
          />
        </NavigationContainer>
      )
    }
  }
}
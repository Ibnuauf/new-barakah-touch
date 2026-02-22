/*
    หน้า QrCodeGenerate.js เป็นหน้าสำหรับสร้าง QRCode 
    เพื่อให้ผู้ใช้ scan ทำธุรกรรมต่างๆ เช่น โอนเงินเข้าบัญชีเงินฝาก, โอนเงินเข้าบัญชีหุ้น, ผ่อนชำระสินเชื่อ
*/

import React, { useEffect, useState, useRef } from 'react'
import {
  View,
  Text,
  Image,
  Modal,
  TouchableOpacity,
  PermissionsAndroid,
  Alert,
  Platform,
  StatusBar,
  BackHandler,
  ScrollView,
  SafeAreaView
} from 'react-native'
import { captureRef } from 'react-native-view-shot'
import QRCode from 'react-native-qrcode-svg'
import AsyncStorage from '@react-native-async-storage/async-storage'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { ScaledSheet } from 'react-native-size-matters'
import { prettyAmount } from '../../../util'
import { CameraRoll } from '@react-native-camera-roll/camera-roll'
import { Toast, ToastProvider } from '../../../components/Toast'
import { COOP_NAME, APP_NAME, PRIMARY_COLOR } from '../../../environment'
import { addScreenshotListener } from 'react-native-detector'
import DeviceInfo from 'react-native-device-info'

export default function QrCodeGenerate({ route, navigation }) {
  const {
    ref1,
    ref2,
    amount,
    accountName,
    accountNumber,
    accountDescription,
    transactionType,
    name,
    loanDescription
  } = route.params
  const [bankCode, setBankCode] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)

  const viewRef = useRef()

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
            'message': `${APP_NAME} ต้องการเข้าถึงข้อมูลไฟล์ของคุณ เพื่อที่คุณจะสามารถบันทึกรูปภาพ QR Code ได้`
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

  const showToast = () => {
    Toast.show('บันทึกรูปภาพสำเร็จ')
  }

  const refText = () => {
    switch (transactionType) {
      case 'Deposit': return 'โอนเงินเข้าบัญชีเงินฝาก'
      case 'Share': return 'โอนเงินเข้าบัญชีหุ้น'
      case 'Loan': return 'ผ่อนชำระสินเชื่อ'
    }
  }

  const handleBackNavigator = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }]
    })
  }

  useEffect(() => {
    const getBankCode = async () => {
      try {
        const bankCode = await AsyncStorage.getItem('BankAccountCode')
        if (bankCode !== null) {
          setBankCode(bankCode)
        }
      }
      catch (err) {
        console.log(err)
      }
    }

    getBankCode()
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
    <ToastProvider>
      <StatusBar barStyle='light-content' />

      <View style={styles.header}>
        <SafeAreaView style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <View>
            <Text style={[styles.headerText, {}]} numberOfLines={1}>QR Code</Text>
          </View>
          <TouchableOpacity style={{ position: 'absolute', right: 16 }} onPress={handleBackNavigator}>
            <AntDesign name='close' size={30} color='#fff' />
          </TouchableOpacity>
        </SafeAreaView>
      </View>

      <ScrollView style={{ flex: 1 }}>
        <View style={{ width: '100%', alignItems: 'center', paddingBottom: 30 }}>
          <View ref={viewRef} collapsable={false} style={styles.cardContainer}>
            <Image
              style={{ width: 696 / 7, height: 234 / 7, alignSelf: 'center' }}
              source={require('../../../assets/prompt-pay-header.png')}
            />

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={styles.iconBox}>
                <Image
                  style={{ width: 951 / 28, height: 703 / 28, margin: 8 }}
                  source={require('../../../assets/money-icon.png')}
                />
              </View>

              <Text style={styles.primaryText}> โอนไปยัง</Text>
            </View>

            <View style={styles.iconBox}>
              <AntDesign name='arrowdown' size={26} color='#999' />
            </View>

            <View style={{ flexDirection: 'row' }}>
              <View style={styles.iconBox}>
                <Image
                  style={{ width: 1500 / 28, height: 1500 / 28 }}
                  source={require('../../../assets/Ibnuauf-Logo-for-App.png')}
                />
              </View>

              <View style={{ justifyContent: 'center' }}>
                <Text style={styles.primaryText}>{COOP_NAME}</Text>
                <Text style={styles.secondaryText}>{refText()}</Text>
              </View>
            </View>

            <View style={{ alignSelf: 'center', marginVertical: 20 }}>
              <QRCode
                value={`${bankCode}\n${ref1}\n${ref2}\n${amount * 100}`}
                size={160}
              />
            </View>

            {
              transactionType === 'Loan' ? (
                <View style={styles.detailBox}>
                  <View style={styles.accountDetail}>
                    <Text style={styles.primaryText}>เลขสัญญา :</Text>
                    <Text numberOfLines={1} style={styles.primaryText}>{accountNumber}</Text>
                  </View>

                  <View style={styles.accountDetail}>
                    <Text style={styles.secondaryText}>เลขสมาชิก :</Text>
                    <Text numberOfLines={1} style={styles.secondaryText}>{accountName}</Text>
                  </View>

                  {
                    name && name !== '' && (
                      <View style={styles.accountDetail}>
                        <Text style={styles.secondaryText}>ชื่อ :</Text>
                        <Text numberOfLines={1} style={styles.secondaryText}>{name}</Text>
                      </View>
                    )
                  }

                  <View style={styles.accountDetail}>
                    <Text style={styles.secondaryText}>ประเภท :</Text>
                    <Text numberOfLines={1} style={styles.secondaryText}>{loanDescription}</Text>
                  </View>

                  <View style={styles.accountDetail}>
                    <Text style={styles.secondaryText}>จำนวนเงิน :</Text>
                    <Text
                      numberOfLines={1}
                      style={[styles.primaryText, styles.largeText]}
                    >
                      {prettyAmount(amount)}
                      <Text style={styles.primaryText}> บาท</Text>
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={{ width: '100%' }}>
                  <View style={styles.accountDetail}>
                    <Text style={styles.primaryText}>ชื่อบัญชี :</Text>
                    <Text numberOfLines={1} style={styles.primaryText}>{accountName}</Text>
                  </View>

                  <View style={styles.accountDetail}>
                    <Text style={styles.secondaryText}>เลขที่บัญชี :</Text>
                    <Text numberOfLines={1} style={styles.secondaryText}>{accountNumber}</Text>
                  </View>

                  <View style={styles.accountDetail}>
                    <Text style={styles.secondaryText}>ประเภท :</Text>
                    <Text style={styles.secondaryText}>{accountDescription}</Text>
                  </View>

                  <View style={styles.accountDetail}>
                    <Text style={styles.secondaryText}>จำนวนเงิน :</Text>
                    <Text
                      numberOfLines={1}
                      style={[styles.primaryText, styles.largeText]}
                    >
                      {prettyAmount(amount)}
                      <Text style={styles.primaryText}> บาท</Text>
                    </Text>
                  </View>
                </View>
              )
            }

            <View style={{ alignItems: 'center', marginTop: 20, marginBottom: 10 }}>
              <Text style={[styles.secondaryText, { fontSize: 14 }]}>เพื่อใช้ในการ{refText()}ในสหกรณ์</Text>
              <Text style={[styles.secondaryText, { fontSize: 14 }]}>สแกน QR Code นี้ผ่านแอปพลิเคชัน Mobile Banking</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.infoButton} onPress={() => setModalVisible(true)} >
            <AntDesign name='infocirlceo' size={18} color={PRIMARY_COLOR} />
            <Text style={[styles.secondaryText, styles.infoText]}>วิธีการโอนเงิน</Text>
          </TouchableOpacity>

          <View style={{ width: '90%', alignItems: 'center' }}>
            <TouchableOpacity style={styles.button} onPress={downloadImage} >
              <Text style={styles.loginText}>บันทึก QR Code ลงเครื่องนี้</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal
        animationType='slide'
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>

            <TouchableOpacity style={styles.closeIcon} onPress={() => setModalVisible(false)}>
              <AntDesign name='close' size={30} color={PRIMARY_COLOR} />
            </TouchableOpacity>

            <View style={[styles.rowcol, { marginTop: 20 }]}>
              <Text style={styles.modalText}>1.</Text>
              <Text style={styles.modalText}>   </Text>
              <Text style={styles.modalText} >กด 'บันทึก QR Code' ลงในโทรศัพท์มือถือของคุณ</Text>
            </View>
            <View style={styles.rowcol}>
              <Text style={styles.modalText}>2.</Text>
              <Text style={styles.modalText}>   </Text>
              <Text style={styles.modalText}>เปิดแอปพลิเคชันธนาคารที่คุณมี เพื่อโอนเงิน</Text>
            </View>
            <View style={styles.rowcol}>
              <Text style={styles.modalText}>3.</Text>
              <Text style={styles.modalText}>   </Text>
              <Text style={styles.modalText}> ไปยังเมนู  'สแกน'  หรือ  'สแกนจ่าย'  จากนั้นกดไปที่  'รูปภาพ'  ในหน้าสแกนเพื่อเลือกรูป QR Code ในมือถือของคุณ</Text>
            </View>
            <View style={styles.rowcol}>
              <Text style={styles.modalText}>4.</Text>
              <Text style={styles.modalText}>   </Text>
              <Text style={styles.modalText}>หลังจากทำรายการสำเร็จ กรุณาตรวจสอบยอดรายการ {refText()}ใหม่ด้วย</Text>
            </View>
          </View>
        </View>
      </Modal>
    </ToastProvider>
  )
}

const styles = ScaledSheet.create({
  primaryText: {
    fontFamily: 'Sarabun-Regular',
    fontSize: '14@s',
    color: '#333',
    padding: 3
  },
  secondaryText: {
    fontFamily: 'Sarabun-Light',
    fontSize: '14@s',
    color: '#333',
    padding: 3
  },
  button: {
    width: '100%',
    alignItems: 'center',
    marginVertical: '15@s',
    borderRadius: '10@s',
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: '8@vs'
  },
  loginText: {
    fontFamily: 'Sarabun-Regular',
    color: '#fff',
    fontSize: '16@s',
    paddingVertical: '1.5@vs'
  },

  // modal
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)'
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    opacity: 1,
    borderRadius: 10,
    padding: 30,
    shadowColor: '#333',
    shadowOffset: {
      width: 1,
      height: 1
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3
  },
  modalText: {
    fontFamily: 'Sarabun-Light',
    marginBottom: 10,
    paddingVertical: 3
  },
  rowcol: {
    flexDirection: 'row',
    alignContent: 'space-between',
  },
  cardContainer: {
    backgroundColor: '#fff',
    width: '100%',
    padding: 18,
    borderBottomColor: '#ccc',
    borderBottomWidth: 0.5
  },
  detailBox: {
    width: '100%',
    marginBottom: 10,
    paddingHorizontal: 8
  },
  accountDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%'
  },
  largeText: {
    fontFamily: 'Sarabun-Medium',
    fontSize: 20
  },
  iconBox: {
    width: 60,
    alignItems: 'center'
  },
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  infoText: {
    color: PRIMARY_COLOR,
    textDecorationLine: 'underline',
    marginLeft: 6
  },
  closeIcon: {
    alignItems: 'flex-end',
    position: 'absolute',
    right: 0,
    top: 0,
    padding: 10
  },
  header: {
    padding: 16,
    backgroundColor: PRIMARY_COLOR
  },
  headerText: {
    fontSize: '16@s',
    color: '#fff',
    fontFamily: 'Sarabun-Medium',
    paddingVertical: 3,
    lineHeight: 36,
  }
})

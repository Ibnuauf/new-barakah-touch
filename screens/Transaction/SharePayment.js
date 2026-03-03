import React, { useRef, useState, useEffect, useReducer } from 'react'
import {
  Text,
  View,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Pressable,
  ActivityIndicator,
  BackHandler,
  SafeAreaView,
  Platform
} from 'react-native'
import { styles } from '../../styles/transaction'
import AppHeader2 from '../../components/AppHeader2'
import Carousel, { Pagination } from 'react-native-snap-carousel'
import { verticalScale, scale } from 'react-native-size-matters'
import { TextInputMask } from 'react-native-masked-text'
import { prettyAmount, shareNumberFormat, getAmount, removeDash, getAccountType } from '../../util'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import { APP_KEY, PRIMARY_COLOR } from '../../environment'
import { savingListReducer, initialSavingListState } from '../../reducers/savingListReducer'
import AppAlert from '../../components/AppAlert'
import NetInfo from '@react-native-community/netinfo'
import { addScreenshotListener } from 'react-native-detector'

const { width: windowWidth } = Dimensions.get('window')

const SharePayment = ({ route, navigation }) => {
  const { favoriteNumber, qrAccount, qrAmount, mainAccount, previousScreen, favAmount } = route.params

  const [{ SAVING_LIST }, dispatch] = useReducer(savingListReducer, initialSavingListState)

  const carouselRef = useRef(null)

  const [destinationMem, setDestinationMem] = useState('')
  const [myShareNumber, setMyShareNumber] = useState('')
  const [number, setNumber] = useState(null)
  const [favNumber, setFavNumber] = useState(null)
  const [sourceAccount, setSourceAccount] = useState(null)
  const [sourceAccountList, setSourceAccountList] = useState(null)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [accountType, setAccountType] = useState('ownAccount')
  const [alertType, setAlertType] = useState('normal')
  const [apiKey, setApiKey] = useState(null)
  const [token, setToken] = useState(null)
  const [memo, setMemo] = useState('')
  const [index1, setIndex] = useState(0)
  const [API_URL, setAPI_URL] = useState(null)

  const selectAccount = saving => {
    setSourceAccount(sourceAccountList[saving])
  }

  const onConfirmPressed = () => {
    setShowAlert(false)
    setAlertMessage('')

    if (alertType === 'Authen') {
      setAccountType('ownAccount')
      setAlertType('normal')

      navigation.reset({
        index: 0,
        routes: [{ name: 'PinInput' }]
      })
    }
  }

  const checkMemId = (shareMem, amount) => {
    const formatShareMem = shareMem.length === 10 ? shareNumberFormat(shareMem) : shareMem

    axios
      .post(
        `${API_URL}/CheckMemID`,
        {
          API_KEY: apiKey,
          MEM: formatShareMem,
        },
        {
          headers: {
            APP_KEY: APP_KEY,
            Authorization: `Bearer ${token}`,
          },
        },
      )
      .then(async response => {
        // console.log(response.data)
        if (response.data.code === 10) {
          navigation.navigate('CheckList', {
            MEM: formatShareMem,
            ref2: sourceAccount.ACCOUNT_SHOW,
            ref3: amount,
            sourceAccount: sourceAccount,
            destinationAccount: response.data.item,
            memo: memo,
            previousScreen: 'SharePayment'
          })
        } else {
          setShowAlert(true)
          setAlertMessage(response.data.message)
          setDestinationMem('')
        }
      })
      .catch(err => {
        console.log(err.message)
        if (err.message === 'Network Error') {
          setShowAlert(true)
          setAlertType('Authen')
          setAlertMessage('กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่อีกครั้ง')
        } else if (err.message === 'Request failed with status code 401') {
          setShowAlert(true)
          setAlertType('Authen')
          setAlertMessage('คุณไม่ได้ทำรายการในเวลาที่กำหนด กรุณา Login อีกครั้ง')
        }
      })
  }

  const getNumber = () => {
    let amount = 0

    if (!number) {
      if (!favAmount) {
        amount = qrAmount
      } else {
        amount = getAmount(favNumber)
      }
    } else {
      amount = getAmount(number)
    }

    return amount
  }

  const onSubmit = () => {
    if (!number && !qrAmount && !favAmount) {
      setShowAlert(true)
      setAlertMessage('กรุณากรอกจำนวนเงิน')
      return
    }

    let available = getAmount(sourceAccount.AVAILABLE)
    let amount = getNumber()
    let NumberType = sourceAccount.ACCOUNT_SHOW.substring(4, 6)

    if (amount < 0) {
      setShowAlert(true)
      setAlertMessage('จำนวนเงินไม่ถูกต้อง')
      return
    }

    if (available - 100 < amount) {
      setShowAlert(true)
      setAlertMessage('ต้องมียอดเงินคงเหลือในบัญชีอย่างน้อย 100 บาท')
      return
    }

    if (NumberType === '03') {
      if (amount % 100 !== 0) {
        setShowAlert(true)
        setAlertMessage('กรุณาระบุจำนวนเงินครั้งละ 100 บาท')
        return
      }
    }

    if (amount % 100 !== 0) {
      setShowAlert(true)
      setAlertMessage('กรุณาระบุจำนวนเงินหลักร้อย')
      return
    }

    if (accountType === 'ownAccount') {
      // บัญชีตัวเอง
      axios
        .post(
          `${API_URL}/CheckMemID`,
          {
            API_KEY: apiKey,
            MEM: myShareNumber,
          },
          {
            headers: {
              APP_KEY: APP_KEY,
              Authorization: `Bearer ${token}`,
            },
          },
        )
        .then(async response => {
          // console.log(response.data)
          if (response.data.code === 10) {
            navigation.navigate('CheckList', {
              MEM: response.data.item.SHR_,
              ref2: sourceAccount.ACCOUNT_SHOW,
              ref3: amount,
              sourceAccount: sourceAccount,
              destinationAccount: response.data.item,
              memo: memo,
              previousScreen: 'SharePayment'
            })
          } else {
            setShowAlert(true)
            setAlertMessage(response.data.message)
            setDestinationMem('')
          }
        })
        .catch(err => {
          console.log(err.message)
          if (err.message === 'Network Error') {
            setShowAlert(true)
            setAlertType('Authen')
            setAlertMessage('กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่อีกครั้ง')
          } else if (err.message === 'Request failed with status code 401') {
            setShowAlert(true)
            setAlertType('Authen')
            setAlertMessage('คุณไม่ได้ทำรายการในเวลาที่กำหนด กรุณา Login อีกครั้ง')
          }
        })
    } else {
      // บัญชีอื่น
      if (favoriteNumber === undefined) {
        if (!qrAccount) {
          const accountNumber = removeDash(destinationMem)
          const accountType = getAccountType(accountNumber)

          if (accountType !== '01') {
            setShowAlert(true)
            setAlertMessage('เลขบัญชีหุ้นไม่ถูกต้อง!')
          } else {
            checkMemId(destinationMem, amount)
          }
        } else {
          const accountNumber = removeDash(qrAccount)
          const accountType = getAccountType(accountNumber)

          if (accountType !== '01') {
            setShowAlert(true)
            setAlertMessage('เลขบัญชีหุ้นไม่ถูกต้อง!')
          } else {
            checkMemId(qrAccount, qrAmount)
          }
        }
      } else {
        checkMemId(shareNumberFormat(favoriteNumber), amount)
      }
    }
  }

  const renderItem = ({ item, index }) => {
    const { ACCOUNT_SHOW, ACCOUNT_NAME, ACC_DESC, AVAILABLE } = item

    return (
      <Pressable activeOpacity={1} style={[styles.item]}>
        <View style={{ paddingHorizontal: 10 }}>
          <Text numberOfLines={1} style={[styles.cardText, { fontFamily: 'Sarabun-Regular', }]}>{ACCOUNT_NAME}</Text>
          <Text numberOfLines={1} style={[styles.cardText, { fontSize: scale(13) }]}>{ACCOUNT_SHOW} ({ACC_DESC})</Text>

          <View style={styles.balance}>
            <Text style={styles.cardText}>ยอดเงินที่ใช้ได้</Text>
            <Text style={styles.cardBoldText}>{AVAILABLE}<Text style={styles.cardText}> บาท</Text></Text>
          </View>
        </View>
      </Pressable>
    )
  }

  const onBlur = () => {
    if (number !== null && number !== '') {
      const prettyNumber = prettyAmount(number)

      if (prettyNumber[0] === '0.00') {
        setNumber(null)
      } else {
        setNumber(...prettyNumber)
      }
    } else if (favNumber !== null && favNumber !== '') {
      const prettyNumber = prettyAmount(favNumber)

      if (prettyNumber[0] === '0.00') {
        setFavNumber(null)
      } else {
        setFavNumber(...prettyNumber)
      }
    }
  }

  const handleBackNavigator = () => {
    if (favoriteNumber !== undefined) {
      navigation.reset({
        index: 0,
        routes: [{
          name: 'FavoriteDashboard',
          params: {
            previousScreen: previousScreen
          }
        }]
      })
    } else if (qrAccount !== undefined) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'QrCodeScanner' }]
      })
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: 'TransactionMenu' }]
      })
    }
  }

  useEffect(() => {
    const getToken = async () => {
      setFavNumber(prettyAmount(+favAmount).toString())

      try {
        const MEM = await AsyncStorage.getItem('MEM')
        const StoreAPI_URL = await AsyncStorage.getItem('StoreAPI_URL')
        const token = await AsyncStorage.getItem('token')
        const apiKey = await AsyncStorage.getItem('confirmShareNumber')

        if (StoreAPI_URL !== null && token !== null && apiKey !== null && MEM !== null) {
          setAPI_URL(StoreAPI_URL)
          setToken(token)
          setApiKey(apiKey)
          setIndex(0)
          setMyShareNumber(MEM)

          axios
            .post(
              `${StoreAPI_URL}/SavingItem`,
              {
                API_KEY: apiKey
              },
              {
                headers: {
                  APP_KEY: APP_KEY,
                  Authorization: `Bearer ${token}`,
                },
              },
            )
            .then(async (response) => {
              // console.log(response.data)
              if (response.data !== undefined) {
                const wadiah = response.data.item.SavingItem.filter(
                  accounts => accounts.ACC_TYPE === '02' || accounts.ACC_TYPE === '03' || accounts.ACC_TYPE === '05',
                )

                if (!mainAccount) {
                  dispatch({ type: 'SET_SAVING_LIST', SAVING_LIST: wadiah })
                  setSourceAccount(wadiah[0])
                  setSourceAccountList(wadiah)
                } else {
                  let newSavings = []
                  const main = (response.data.item.Saving).find(account => account.ACCOUNT_NO === mainAccount.ACCOUNT_NO)

                  newSavings.push(main)

                  dispatch({ type: 'SET_SAVING_LIST', SAVING_LIST: newSavings })

                  setSourceAccount(main)
                  setSourceAccountList(newSavings)
                }

                if (favoriteNumber !== undefined || qrAccount !== undefined) {
                  setAccountType('otherAccount')
                }

                try {
                  await AsyncStorage.setItem('token', response.data.itemdetail)
                } catch (err) {
                  console.log(err)
                }
              }
            })
            .catch(err => {
              if (err.message === 'Network Error') {
                setShowAlert(true)
                setAlertType('Authen')
                setAlertMessage('ไม่สามารถทำรายการได้ กรุณาลองใหม่อีกครั้ง')
              } else if (err.message === 'Request failed with status code 401') {
                setShowAlert(true)
                setAlertType('Authen')
                setAlertMessage('คุณไม่ได้ทำรายการในเวลาที่กำหนด กรุณา Login อีกครั้ง')
              }
            })
        }
      } catch (err) {
        console.log(err)
      }
    }

    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isInternetReachable) {
        getToken()
      } else {
        setShowAlert(true)
        setAlertType('Authen')
        setAlertMessage('กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตและลองใหม่อีกครั้ง')
      }
    })

    return () => {
      unsubscribe()
    }
  }, [route])

  useEffect(() => {
    setDestinationMem('')
    setNumber(null)
    setMemo('')
  }, [accountType])

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

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction)

    return () => backHandler.remove()
  })

  if (SAVING_LIST === null) {
    return (
      <View style={{ flex: 1 }}>
        <AppHeader2 onPress={handleBackNavigator} />

        <View style={styles.emptyContainer}>
          <ActivityIndicator color='#0000ff' />
        </View>

        <AppAlert
          visible={showAlert}
          title={' ไม่สำเร็จ'}
          message={alertMessage}
          showConfirm={alertMessage !== ''}
          showCancel={false}
          onConfirm={onConfirmPressed}
          onCancel={() => setShowAlert(false)}
        />
      </View>
    )
  } else {
    return (
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <AppHeader2 onPress={handleBackNavigator} />

          <SafeAreaView style={{ flex: 1 }}>
            <View style={[styles.labelBox, styles.headerLabelBox]}>
              <Text style={styles.labelText}> โอนเข้าบัญชีหุ้น</Text>
            </View>

            <ScrollView>
              <TouchableOpacity activeOpacity={1} >
                <View style={[{ height: verticalScale(160) }]}>
                  <Text style={[styles.titleText, { padding: 10 }]}>จากบัญชี</Text>

                  <View style={{ marginTop: -6 }}>
                    <Carousel
                      sliderWidth={windowWidth}
                      sliderHeight={windowWidth}
                      itemWidth={windowWidth - 90}
                      data={SAVING_LIST}
                      renderItem={renderItem}
                      onBeforeSnapToItem={(index1) => setIndex(index1)}
                      onSnapToItem={(index1) => selectAccount(index1)}
                    />
                  </View>

                  {
                    SAVING_LIST.length > 1 && (
                      <View style={{ marginTop: -15 }}>
                        <Pagination
                          dotsLength={SAVING_LIST.length}
                          activeDotIndex={index1}
                          carouselRef={carouselRef}
                          dotStyle={{
                            width: 7,
                            height: 7,
                            borderRadius: 5,
                            marginHorizontal: -5,
                            backgroundColor: PRIMARY_COLOR
                          }}
                        />
                      </View>
                    )
                  }
                </View>

                <View style={{ padding: 10 }}>
                  <Text style={[styles.titleText]}> ไปยัง</Text>

                  <View style={styles.formContainer}>
                    <View style={styles.tapContainer}>
                      <Pressable style={accountType === 'ownAccount' ? styles.tapBtnActive : styles.tapBtn} onPress={() => favoriteNumber === undefined && qrAccount === undefined && setAccountType('ownAccount')}>
                        <Text style={accountType === 'ownAccount' ? styles.tapTextActive : styles.tapText}>บัญชีตัวเอง</Text>
                      </Pressable>

                      <Pressable style={accountType === 'otherAccount' ? styles.tapBtnActive : styles.tapBtn} onPress={() => setAccountType('otherAccount')}>
                        <Text style={accountType === 'otherAccount' ? styles.tapTextActive : styles.tapText}>บัญชีผู้อื่น</Text>
                      </Pressable>
                    </View>

                    <Text style={styles.titleText}>เลขที่บัญชีหุ้นผู้รับ</Text>

                    {
                      accountType === 'ownAccount' ? (
                        <TextInput
                          editable={false}
                          style={styles.input}
                          value={myShareNumber}
                        />
                      ) : (
                        favoriteNumber === undefined ? (
                          !qrAccount ? (
                            <TextInputMask
                              autoFocus={true}
                              type={'custom'}
                              keyboardType='numeric'
                              options={{ mask: '999-99-99999' }}
                              value={destinationMem}
                              onChangeText={text => setDestinationMem(text)}
                              style={styles.input}
                            />
                          ) : (
                            <TextInputMask
                              editable={false}
                              type={'custom'}
                              keyboardType='numeric'
                              options={{ mask: '999-99-99999' }}
                              value={qrAccount}
                              style={styles.input}
                            />
                          )
                        ) : (
                          <TextInputMask
                            editable={false}
                            type={'custom'}
                            keyboardType='numeric'
                            options={{ mask: '999-99-99999' }}
                            value={favoriteNumber}
                            style={styles.input}
                          />
                        )
                      )
                    }

                    <Text style={styles.titleText}>จำนวนเงิน</Text>

                    {
                      favAmount !== null && favAmount > 0 ? (
                        <TextInput
                          style={[styles.input, styles.amountInput]}
                          onChangeText={text => setFavNumber(text)}
                          value={favNumber}
                          onBlur={() => onBlur()}
                          keyboardType='numeric'
                          placeholder='0.00'
                        />
                      ) : (
                        !qrAmount ? (
                          <TextInput
                            style={[styles.input, styles.amountInput]}
                            onChangeText={text => setNumber(text)}
                            value={number}
                            onBlur={() => onBlur()}
                            keyboardType='numeric'
                            placeholder='0.00'
                          />
                        ) : (
                          <TextInput
                            editable={false}
                            style={[styles.input, styles.amountInput]}
                            value={prettyAmount(+qrAmount).toString()}
                            keyboardType='numeric'
                            placeholder='0.00'
                          />
                        )
                      )
                    }

                    <Text style={styles.guideText}>ตัวอย่าง: 100 700 1000 5200</Text>

                    <View style={{ marginTop: 10 }}>
                      <View style={styles.memoContainer}>
                        <Text style={styles.titleText}>บันทึกช่วยจำ</Text>
                        <Text style={styles.mamoLen}>{memo.length}/30</Text>
                      </View>

                      <TextInputMask
                        type={'custom'}
                        options={{ mask: '******************************' }}
                        value={memo}
                        onChangeText={text => setMemo(text)}
                        style={[styles.input, { marginBottom: verticalScale(15) }]}
                      />
                    </View>
                  </View>
                </View>

                <View style={{ width: '90%', alignSelf: 'center' }}>
                  <TouchableOpacity style={styles.button} onPress={() => onSubmit()}>
                    <Text style={styles.btnText}>ตรวจสอบข้อมูล</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>

          <AppAlert
            visible={showAlert}
            title={' ไม่สำเร็จ'}
            message={alertMessage}
            showConfirm={alertMessage !== ''}
            showCancel={false}
            onConfirm={onConfirmPressed}
            onCancel={() => setShowAlert(false)}
          />
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    )
  }
}

export default SharePayment

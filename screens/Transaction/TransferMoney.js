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
import ActionSheet from '../../components/ActionSheet'
import { styles } from '../../styles/transaction'
import AppHeader2 from '../../components/AppHeader2'
import Carousel, { Pagination } from 'react-native-snap-carousel'
import { verticalScale, scale } from 'react-native-size-matters'
import { TextInputMask } from 'react-native-masked-text'
import { prettyAmount, removeDash, getAmount, isInteger, getAccountType } from '../../util'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import { APP_KEY, PRIMARY_COLOR } from '../../environment'
import { savingListReducer, initialSavingListState } from '../../reducers/savingListReducer'
import AppAlert from '../../components/AppAlert'
import AntDesign from 'react-native-vector-icons/AntDesign'
import NetInfo from '@react-native-community/netinfo'
import { addScreenshotListener } from 'react-native-detector'

const { width: windowWidth } = Dimensions.get('window')

const TransferMoney = ({ route, navigation }) => {
  const { favoriteNumber, qrAccount, qrAmount, previousScreen, mainAccount, favAmount } = route.params

  const [{ SAVING_LIST }, dispatch] = useReducer(savingListReducer, initialSavingListState)

  const carouselRef = useRef(null)

  const [favoriteAccountNumber, setFavoriteAccountNumber] = useState(removeDash(favoriteNumber))
  const [destinationAccountNumber, setDestinationAccountNumber] = useState('')
  const [destinationAccountOther, setDestinationAccountOther] = useState(null)
  const [number, setNumber] = useState(null)
  const [favNumber, setFavNumber] = useState(null)
  const [sourceAccount, setSourceAccount] = useState(null)
  const [sourceAccountList, setSourceAccountList] = useState(null)
  const [destinationAccount, setDestinationAccount] = useState(null)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertType, setAlertType] = useState('normal')
  const [accountType, setAccountType] = useState('ownAccount')
  const [isSavingEmpty, setIsSavingEmpty] = useState(false)
  const [accountNumber, setAccountNumber] = useState(null)
  const [accountName, setAccountName] = useState(null)
  const [accountDescription, setAccountDescription] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [apiKey, setApiKey] = useState(null)
  const [token, setToken] = useState(null)
  const [memo, setMemo] = useState('')
  const [index1, setIndex] = useState(0)
  const [API_URL, setAPI_URL] = useState(null)

  const selectSaving = saving => {
    setDestinationAccount(saving)
    setAccountName(saving.ACCOUNT_NAME)
    setAccountDescription(saving.ACC_DESC)
    setAccountNumber(saving.ACCOUNT_SHOW)
    setModalVisible(false)
  }

  const selectAccount = saving => {
    setSourceAccount(sourceAccountList[saving])
  }

  const onSubmit = () => {
    if (accountType === 'ownAccount') {
      //บัญชีตนเอง
      if (!number) {
        setShowAlert(true)
        setAlertMessage('กรุณากรอกจำนวนเงิน')
      } else {
        let amount = getAmount(number)
        let available = getAmount(sourceAccount.AVAILABLE)

        if (isInteger(amount)) {
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

          if (sourceAccount.ACCOUNT_NO === destinationAccount.ACCOUNT_NO) {
            setShowAlert(true)
            setAlertMessage('บัญชีต้นทางกับบัญชีปลายทางเป็นบัญชีเดียวกัน')
          } else if (available < amount) {
            setShowAlert(true)
            setAlertMessage('จำนวนเงินในบัญชีไม่เพียงพอ กรุณาเลือกบัญชีอื่น')
          } else {
            if (sourceAccount.ACC_TYPE === '03' || destinationAccount.ACC_TYPE === '03') {
              if (amount % 100 !== 0) {
                setShowAlert(true)
                setAlertMessage('กรณีบัญชีมูฏอรอบะฮ์ กรุณาระบุจำนวนเงินคราวละ 100 บาท')
              } else {
                navigation.navigate('CheckList', {
                  ref1: sourceAccount.ACCOUNT_SHOW, //เลขบัญชีต้นทาง
                  ref2: destinationAccount.ACCOUNT_SHOW, //เลขบัญชีปลายทาง
                  ref3: amount, //จำนวนเงิน
                  sourceAccount: sourceAccount,
                  destinationAccount: destinationAccount,
                  memo: memo,
                  previousScreen: 'TransferMoney'
                })
              }
            } else {
              navigation.navigate('CheckList', {
                ref1: sourceAccount.ACCOUNT_SHOW,
                ref2: destinationAccount.ACCOUNT_SHOW,
                ref3: amount,
                sourceAccount: sourceAccount,
                destinationAccount: destinationAccount,
                memo: memo,
                previousScreen: 'TransferMoney'
              })
            }
          }
        } else {
          setShowAlert(true)
          setAlertMessage('กรุณาระบุจำนวนเงินเป็นจำนวนเต็ม')
        }
      }
    } else {
      //บัญชีอื่น

      if (qrAccount !== undefined && qrAmount !== undefined) {
        let amount = +qrAmount < 1 ? getAmount(number) : +qrAmount
        let available = getAmount(sourceAccount.AVAILABLE)

        if (available - 100 < amount) {
          setShowAlert(true)
          setAlertMessage('ต้องมียอดเงินคงเหลือในบัญชีอย่างน้อย 100 บาท')
          return
        }

        if (removeDash(sourceAccount.ACCOUNT_SHOW) === qrAccount) {
          setShowAlert(true)
          setAlertMessage('บัญชีต้นทางกับบัญชีปลายทางเป็นบัญชีเดียวกัน')
        } else {
          checkAccountNumber(qrAccount, amount)
        }
      } else {
        if (destinationAccountNumber?.length !== 14 && favoriteNumber === undefined) {
          setShowAlert(true)
          setAlertMessage('กรุณากรอกหมายเลขบัญชีให้ครบ')
        } else if (!number && !favAmount) {
          setShowAlert(true)
          setAlertMessage('กรุณากรอกจำนวนเงิน')
        } else {
          let amount = getAmount(number)
          let available = getAmount(sourceAccount.AVAILABLE)

          if (isInteger(amount)) {
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

            if (favoriteNumber !== undefined) {
              if (removeDash(sourceAccount.ACCOUNT_SHOW) === favoriteNumber) {
                setShowAlert(true)
                setAlertMessage('บัญชีต้นทางกับบัญชีปลายทางเป็นบัญชีเดียวกัน')
              } else {
                const favoriteAccountType = getAccountType(favoriteNumber)

                if (favNumber === '0.00' || favAmount === 0) {
                  if (sourceAccount.ACC_TYPE === '03' || favoriteAccountType === '03') {
                    if (amount % 100 !== 0) {
                      setShowAlert(true)
                      setAlertMessage('กรณีบัญชีมูฏอรอบะฮ์ กรุณาระบุจำนวนเงินคราวละ 100 บาท')
                    } else {
                      checkAccountNumber(removeDash(favoriteNumber), amount)
                    }
                  } else {
                    checkAccountNumber(removeDash(favoriteNumber), amount)
                  }
                } else {
                  checkAccountNumber(removeDash(favoriteNumber), getAmount(favNumber))
                }
              }
            } else {
              if (sourceAccount.ACCOUNT_SHOW === destinationAccountOther.ACCOUNT_NO) {
                setShowAlert(true)
                setAlertMessage('บัญชีต้นทางกับบัญชีปลายทางเป็นบัญชีเดียวกัน')
              } else {
                if (sourceAccount.ACC_TYPE === '03' || destinationAccountOther.ACC_TYPE === '03') {
                  if (amount % 100 !== 0) {
                    setShowAlert(true)
                    setAlertMessage('กรณีบัญชีมูฏอรอบะฮ์ กรุณาระบุจำนวนเงินคราวละ 100 บาท')
                  } else {
                    navigation.navigate('CheckList', {
                      ref1: sourceAccount.ACCOUNT_SHOW,
                      ref2: destinationAccountOther.ACCOUNT_NO,
                      ref3: amount,
                      sourceAccount: sourceAccount,
                      destinationAccount: destinationAccountOther,
                      memo: memo,
                      previousScreen: 'TransferMoney'
                    })
                  }
                } else {
                  navigation.navigate('CheckList', {
                    ref1: sourceAccount.ACCOUNT_SHOW,
                    ref2: destinationAccountOther.ACCOUNT_NO,
                    ref3: amount,
                    sourceAccount: sourceAccount,
                    destinationAccount: destinationAccountOther,
                    memo: memo,
                    previousScreen: 'TransferMoney'
                  })
                }
              }
            }
          } else {
            setShowAlert(true)
            setAlertMessage('กรุณาระบุจำนวนเงินเป็นจำนวนเต็ม')
          }
        }
      }
    }
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

  const renderItem = ({ item }) => {
    const { ACCOUNT_SHOW, ACCOUNT_NAME, ACC_DESC, AVAILABLE } = item

    return (
      <Pressable activeOpacity={1} style={[styles.item]}>
        <View style={{ paddingHorizontal: 10 }}>
          <Text numberOfLines={1} style={[styles.cardText, { fontFamily: 'Sarabun-Regular' }]}>{ACCOUNT_NAME}</Text>
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

  const checkAccountNumber = (accountNumber, amount) => {
    if (getAccountType(accountNumber) === '06' || getAccountType(accountNumber) === '07') {
      setShowAlert(true)
      setAlertMessage(' ไม่สามารถโอนเงินเข้าบัญชีอิสติกอมะฮ์ หรือบัญชีมูฎอรอบะฮฺ พิเศษได้')
      setDestinationAccountNumber('')
    } else {
      axios
        .post(`${API_URL}/CheckAccountNO`, {
          API_KEY: apiKey,
          ACCOUNT_NO: accountNumber
        }, {
          headers: {
            APP_KEY: APP_KEY,
            Authorization: `Bearer ${token}`
          }
        })
        .then(async (response) => {
          // console.log(response.data.item)
          if (response.data.code === 10) {
            setDestinationAccountOther(response.data.item[0])

            if (favoriteNumber !== undefined || qrAccount !== undefined) {
              navigation.navigate('CheckList', {
                ref1: sourceAccount.ACCOUNT_SHOW,
                ref2: response.data.item[0].ACCOUNT_NO,
                ref3: amount,
                sourceAccount: sourceAccount,
                destinationAccount: response.data.item[0],
                memo: memo,
                previousScreen: 'TransferMoney'
              })
            }
          } else {
            setShowAlert(true)
            setAlertMessage(response.data.message)
            setDestinationAccountNumber('')
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
  }

  useEffect(() => {
    const getToken = async () => {
      setFavNumber(prettyAmount(+favAmount).toString())

      try {
        const StoreAPI_URL = await AsyncStorage.getItem('StoreAPI_URL')
        const token = await AsyncStorage.getItem('token')
        const apiKey = await AsyncStorage.getItem('confirmShareNumber')

        if (StoreAPI_URL !== null && token !== null && apiKey !== null) {
          setAPI_URL(StoreAPI_URL)
          setToken(token)
          setApiKey(apiKey)
          setIndex(0)

          axios
            .post(
              `${StoreAPI_URL}/SavingItem`,
              {
                API_KEY: apiKey,
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
              if (response.data !== undefined) {
                if (await response.data.item.Saving.length !== 0) {
                  if (response.data.item.Saving.length == 1) {
                    setIsSavingEmpty(true)
                  }

                  if (!mainAccount) {
                    dispatch({ type: 'SET_SAVING_LIST', SAVING_LIST: response.data.item.Saving })

                    setAccountName(response.data.item.Saving[0].ACCOUNT_NAME)
                    setAccountNumber(response.data.item.Saving[0].ACCOUNT_SHOW)
                    setAccountDescription(response.data.item.Saving[0].ACC_DESC)

                    setSourceAccount(response.data.item.SavingItem[0])
                    setSourceAccountList(response.data.item.SavingItem)
                    setDestinationAccount(response.data.item.Saving[0])
                  } else {
                    let newSavings = []
                    const main = (response.data.item.Saving).find(account => account.ACCOUNT_NO === mainAccount.ACCOUNT_NO)

                    newSavings.push(main)

                    dispatch({ type: 'SET_SAVING_LIST', SAVING_LIST: newSavings })

                    setSourceAccount(main)
                    setSourceAccountList(newSavings)
                    setDestinationAccount(main)
                  }
                } else {
                  setIsSavingEmpty(true)
                }

                if (favoriteNumber !== undefined) {
                  setAccountType('otherAccount')
                  setFavoriteAccountNumber(removeDash(favoriteNumber))
                }

                if (qrAccount !== undefined) {
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
    if (destinationAccountNumber.length === 14) {
      let destinationAccountNumberReplaced = removeDash(destinationAccountNumber)

      checkAccountNumber(destinationAccountNumberReplaced)
    }
  }, [destinationAccountNumber])

  useEffect(() => {
    setDestinationAccountNumber('')
    setNumber('')
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

  if (!SAVING_LIST || !sourceAccountList) {
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
          onConfirm={() => {
            setShowAlert(false)
            navigation.reset({
              index: 0,
              routes: [{ name: 'PinInput' }]
            })
          }}
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
            <View style={[styles.labelBox, styles.headerLabelBox,]}>
              <Text style={styles.labelText}> โอนเข้าบัญชีเงินฝาก</Text>
            </View>

            <ScrollView>
              <TouchableOpacity activeOpacity={1}>
                <View style={[{ height: verticalScale(160) }]}>
                  <Text style={[styles.titleText, { padding: 10 }]}>จากบัญชี</Text>



                  <View style={{ marginTop: -6 }}>
                    <Carousel
                      sliderWidth={windowWidth}
                      sliderHeight={windowWidth}
                      itemWidth={windowWidth - 90}
                      data={sourceAccountList}
                      renderItem={renderItem}
                      onBeforeSnapToItem={(index1) => setIndex(index1)}
                      onSnapToItem={(index1) => selectAccount(index1)}
                    />
                  </View>

                  {
                    sourceAccountList.length > 1 && (
                      <View style={{ marginTop: -15 }}>
                        <Pagination
                          dotsLength={sourceAccountList.length}
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
                      <Pressable
                        style={accountType === 'ownAccount' ? styles.tapBtnActive : styles.tapBtn}
                        onPress={() => favoriteNumber === undefined && qrAccount === undefined && setAccountType('ownAccount')}
                      >
                        <Text style={accountType === 'ownAccount' ? styles.tapTextActive : styles.tapText}>บัญชีตัวเอง</Text>
                      </Pressable>

                      <Pressable
                        style={accountType === 'otherAccount' ? styles.tapBtnActive : styles.tapBtn}
                        onPress={() => setAccountType('otherAccount')}
                      >
                        <Text style={accountType === 'otherAccount' ? styles.tapTextActive : styles.tapText}>บัญชีผู้อื่น</Text>
                      </Pressable>
                    </View>

                    <Text style={styles.titleText}>เลขที่บัญชีผู้รับ</Text>
                    {
                      accountType === 'ownAccount' ? (
                        SAVING_LIST.length <= 0 ? (
                          <TouchableOpacity style={styles.savingBox}>
                            <Text style={styles.savingText} numberOfLines={1}> ไม่พบหมายเลขบัญชี</Text>
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity style={styles.savingBox} onPress={() => setModalVisible(true)}>
                            {
                              isSavingEmpty ? (
                                <Text style={[styles.savingText, { flex: 1 }]} numberOfLines={1}> ไม่พบหมายเลขบัญชี</Text>
                              ) : (
                                <View>
                                  <Text style={styles.savingText} numberOfLines={1}>{accountName}</Text>
                                  <Text style={[styles.savingText, styles.savingDetail]} numberOfLines={1}>{accountNumber} ({accountDescription})</Text>
                                </View>
                              )
                            }

                            <AntDesign name='down' size={16} color='#aaa' />
                          </TouchableOpacity>
                        )
                      ) : (
                        !favoriteAccountNumber ? (
                          !qrAccount ? (
                            <TextInputMask
                              autoFocus={true}
                              type={'custom'}
                              keyboardType='numeric'
                              options={{ mask: '999-99-99999-9' }}
                              value={destinationAccountNumber}
                              onChangeText={text => setDestinationAccountNumber(text)}
                              style={styles.input}
                            />
                          ) : (
                            <TextInputMask
                              editable={false}
                              type={'custom'}
                              keyboardType='numeric'
                              options={{ mask: '999-99-99999-9' }}
                              value={qrAccount}
                              style={styles.input}
                            />
                          )
                        ) : (
                          <TextInputMask
                            editable={false}
                            type={'custom'}
                            keyboardType='numeric'
                            options={{ mask: '999-99-99999-9' }}
                            value={favoriteAccountNumber}
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
                        !qrAmount || qrAmount < 1 ? (
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
                            onBlur={() => onBlur()}
                            keyboardType='numeric'
                            placeholder='0.00'
                          />
                        )
                      )
                    }

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
                  <TouchableOpacity style={styles.button} onPress={onSubmit}>
                    <Text style={styles.btnText}>ตรวจสอบข้อมูล</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </ScrollView>

            <ActionSheet
              visible={modalVisible}
              onClose={() => setModalVisible(false)}
              title='เลือกบัญชี'
            >
              <ScrollView style={{ width: '100%' }}>
                {
                  SAVING_LIST.length <= 0 ? (
                    <TouchableOpacity style={styles.modalSavingList} onPress={() => setModalVisible(false)}>
                      <Text style={styles.savingText}> ไม่พบหมายเลขบัญชี</Text>
                    </TouchableOpacity>
                  ) : (
                    SAVING_LIST.map((saving, index) => (
                      <TouchableOpacity key={index} style={styles.modalSavingList} onPress={() => selectSaving(saving)}>
                        <Text style={styles.savingText} numberOfLines={1}>{saving.ACCOUNT_NAME}</Text>
                        <Text style={[styles.savingText, styles.savingDetail]} numberOfLines={1}>{saving.ACCOUNT_SHOW} ({saving.ACC_DESC})</Text>
                      </TouchableOpacity>
                    ))
                  )
                }
              </ScrollView>
            </ActionSheet>
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

export default TransferMoney

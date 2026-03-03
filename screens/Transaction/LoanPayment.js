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
import { scale, verticalScale } from 'react-native-size-matters'
import { TextInputMask } from 'react-native-masked-text'
import { getAccountType, prettyAmount, removeDash, getAmount, isInteger } from '../../util'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import { APP_KEY, PRIMARY_COLOR } from '../../environment'
import { savingListReducer, initialSavingListState } from '../../reducers/savingListReducer'
import AppAlert from '../../components/AppAlert'
import AntDesign from 'react-native-vector-icons/AntDesign'
import NetInfo from '@react-native-community/netinfo'
import { addScreenshotListener } from 'react-native-detector'

const { width: windowWidth } = Dimensions.get('window')

const LoanPayment = ({ route, navigation }) => {
  const { favoriteShare, favoriteNumber, previousScreen, qrLoanCode, qrAmount, mainAccount, favAmount } = route.params

  const [{ SAVING_LIST }, dispatch] = useReducer(savingListReducer, initialSavingListState)

  const carouselRef = useRef(null)

  const [LOAN_LIST, setLOAN_LIST] = useState([])
  const [destinationLoanList, setDestinationLoanList] = useState([])
  const [DestinationMem, setDestinationMem] = useState('')
  const [DestinationLoan, setDestinationLoan] = useState('')
  const [ownNumber, setOwnNumber] = useState(null)
  const [otherNumber, setOtherNumber] = useState(null)
  const [favNumber, setFavNumber] = useState(null)
  const [sourceAccount, setSourceAccount] = useState(null)
  const [sourceAccountList, setSourceAccountList] = useState(null)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertType, setAlertType] = useState('normal')
  const [LoanType, setLoanType] = useState('ownLoan')
  const [LoanLcontID, setLoanLcontID] = useState(null)
  const [LoanName, setLoanName] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [token, setToken] = useState(null)
  const [memo, setMemo] = useState('')
  const [debt, setDebt] = useState(null)
  const [otherDebt, setOtherDebt] = useState(null)
  const [chargeAmount, setChargeAmount] = useState(null)
  const [otherChargeAmount, setOtherChargeAmount] = useState(null)
  const [MemID, setMemID] = useState(null)
  const [OtherLOAN_LIST, setOtherLOAN_LIST] = useState(null)
  const [index1, setIndex] = useState(0)
  const [API_URL, setAPI_URL] = useState(null)
  const [qrShare, setQrShare] = useState(null)
  const [qrLoanId, setQrLoanId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const selectLoan = loan => {
    setDestinationLoanList(loan)
    setLoanName(loan.LSUB_NAME)
    setLoanLcontID(loan.LCONT_ID)
    setDebt(loan.LCONT_AMOUNT_SAL)
    setOwnNumber(loan.LCONT_SAL)
    setModalVisible(false)
  }

  const selectAccount = saving => {
    setSourceAccount(sourceAccountList[saving])
  }

  const onSubmit = () => {
    if (LoanType === 'ownLoan') {
      if (LOAN_LIST.length <= 0) {
        return
      } else {
        checkLoan(ownNumber, LoanLcontID, debt, destinationLoanList, MemID)
      }
    } else {
      if (DestinationMem?.length !== 12 && favoriteShare === undefined && qrShare === null) {
        setShowAlert(true)
        setAlertMessage('กรุณากรอกเลขบัญชีหุ้นให้ครบ')
      } else if (DestinationLoan?.length !== 13 && favoriteNumber === undefined && qrLoanId === null) {
        setShowAlert(true)
        setAlertMessage('กรุณากรอกเลขสัญญาให้ครบ')
      } else {
        if (favoriteShare !== undefined && favoriteNumber !== undefined) {
          getLoanDetail(favoriteShare, favoriteNumber)
        } else if (qrLoanCode !== undefined) {
          getLoanDetail(qrShare, qrLoanId)
        } else {
          if (otherDebt === null || OtherLOAN_LIST === null) {
            setShowAlert(true)
            setAlertMessage('เลขบัญชีหุ้นหรือเลขสัญญาไม่ถูกต้อง!')
          } else {
            checkLoan(otherNumber, DestinationLoan, otherDebt, OtherLOAN_LIST, DestinationMem)
          }
        }
      }
    }
  }

  const checkLoan = (NUMBER, DESTINATION_REF, DEBT, DESTINATION, DESTINATION_MEM) => {
    if (!NUMBER) {
      setShowAlert(true)
      setAlertMessage('กรุณากรอกจำนวนเงิน')
      return
    }

    let savingavailable = getAmount(sourceAccount.AVAILABLE)
    let amount = getAmount(NUMBER)
    let loanBalance = getAmount(DEBT)

    if (isInteger(amount)) {
      if (savingavailable - 100 < amount) {
        setShowAlert(true)
        setAlertMessage('ต้องมียอดเงินคงเหลือในบัญชีอย่างน้อย 100 บาท')
        return
      }

      if (savingavailable < amount) {
        setShowAlert(true)
        setAlertMessage('ยอดเงินของคุณไม่เพียงพอในการชำระ')
        return
      }

      if (sourceAccount.ACC_TYPE === '03') {
        if (amount % 100 !== 0) {
          setShowAlert(true)
          setAlertMessage('กรณีบัญชีมูฏอรอบะฮ์ กรุณาระบุจำนวนเงินคราวละ 100 บาท')
          return
        }
      }

      if (DESTINATION_REF === null || DEBT === null || DESTINATION === null || DESTINATION_REF === undefined || DEBT === undefined || DESTINATION === undefined) {
        setShowAlert(true)
        setAlertMessage('เลขบัญชีหุ้นหรือเลขสัญญาไม่ถูกต้อง!')
        return
      }

      if (amount > loanBalance) {
        setShowAlert(true)
        setAlertMessage('จำนวนที่ต้องการผ่อน มากกว่ายอดหนี้คงเหลือ')
        return
      }

      if (!(amount >= 100 || amount === loanBalance)) {
        setShowAlert(true)
        setAlertMessage('ยอดผ่อนขั้นต่ำ 100 บาท')
        return
      }

      navigation.navigate('CheckList', {
        ref1: sourceAccount.ACCOUNT_SHOW,
        ref2: DESTINATION_REF,
        ref3: NUMBER,
        sourceAccount: sourceAccount,
        destinationAccount: DESTINATION,
        memo: memo,
        other: DESTINATION_MEM,
        previousScreen: 'LoanPayment'
      })
    } else {
      setShowAlert(true)
      setAlertMessage('กรุณาระบุจำนวนเงินเป็นจำนวนเต็ม')
    }
  }

  const getLoanDetail = (mem, loanId) => {
    axios
      .post(
        `${API_URL}/CheckLoanID`,
        {
          MEM: mem,
          LCONT_ID: loanId,
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
          const OtherLOAN_LIST = await response.data.item[0]
          const { LCONT_AMOUNT_SAL, LCONT_SAL, CHARGE_AMOUNT } = await response.data.item[0]

          if (favoriteShare !== undefined && favoriteNumber !== undefined) {
            checkLoan(otherNumber, favoriteNumber, LCONT_AMOUNT_SAL, OtherLOAN_LIST, favoriteShare)
          } else if (qrLoanCode !== undefined) {
            checkLoan(otherNumber, qrLoanId, LCONT_AMOUNT_SAL, OtherLOAN_LIST, qrShare)
          } else {
            setOtherNumber(LCONT_SAL)
            setOtherDebt(LCONT_AMOUNT_SAL)
            setOtherChargeAmount(CHARGE_AMOUNT)
            setOtherLOAN_LIST(OtherLOAN_LIST)
          }
        } else {
          setShowAlert(true)
          setAlertMessage(response.data.message)
          setOtherNumber(null)
          setOtherDebt(null)
          setOtherLOAN_LIST(null)
          return
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

  useEffect(() => {
    if (DestinationMem.length === 12 && DestinationLoan.length === 13) {
      const accountNumber = removeDash(DestinationMem)
      const accountType = getAccountType(accountNumber)

      if (accountType !== '01') {
        setShowAlert(true)
        setAlertMessage('เลขบัญชีหุ้นหรือเลขสัญญาไม่ถูกต้อง!')
        setOtherNumber(null)
        setOtherDebt(null)
        setOtherLOAN_LIST(null)
      } else {
        getLoanDetail(DestinationMem, DestinationLoan)
      }
    }
  }, [DestinationLoan, DestinationMem])

  const onConfirmPressed = () => {
    setShowAlert(false)
    setAlertMessage('')

    if (alertType === 'Authen') {
      setLoanType('ownLoan')
      setAlertType('normal')

      navigation.reset({
        index: 0,
        routes: [{ name: 'PinInput' }]
      })
    }
  }

  const renderItem = ({ item, index }) => {
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
    if (LoanType === 'ownLoan') {
      if (ownNumber !== null && ownNumber !== '') {
        const prettyNumber = prettyAmount(ownNumber)

        if (prettyNumber[0] === '0.00') {
          setOwnNumber(null)
        } else {
          setOwnNumber(...prettyNumber)
        }
      }
    } else {
      if (otherNumber !== null && otherNumber !== '') {
        const prettyNumber = prettyAmount(otherNumber)

        if (prettyNumber[0] === '0.00') {
          setOtherNumber(null)
        } else {
          setOtherNumber(...prettyNumber)
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
  }

  const handleBackNavigator = () => {
    if (favoriteShare !== undefined && favoriteNumber !== undefined) {
      navigation.reset({
        index: 0,
        routes: [{
          name: 'FavoriteDashboard',
          params: {
            previousScreen: previousScreen,
          }
        }]
      })
    } else if (qrLoanCode !== undefined) {
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
      if (favoriteNumber !== undefined || qrLoanCode !== undefined) {
        setLoanType('otherLoan')
        setFavNumber(prettyAmount(+favAmount).toString())
      }

      try {
        const StoreAPI_URL = await AsyncStorage.getItem('StoreAPI_URL')
        const token = await AsyncStorage.getItem('token')
        const apiKey = await AsyncStorage.getItem('confirmShareNumber')

        if (StoreAPI_URL !== null && token !== null && apiKey !== null) {
          setAPI_URL(StoreAPI_URL)
          setToken(token)
          setIndex(0)

          axios
            .post(
              `${StoreAPI_URL}/SavingAndLoan`,
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
                if (response.data.itemdetail.length !== 0) {
                  setLoanName(response.data.itemdetail[0].LSUB_NAME)
                  setLoanLcontID(response.data.itemdetail[0].LCONT_ID)
                  setDebt(response.data.itemdetail[0].LCONT_AMOUNT_SAL)
                  setChargeAmount(response.data.itemdetail[0].CHARGE_AMOUNT)
                  setOwnNumber(response.data.itemdetail[0].LCONT_SAL)
                }

                if (!mainAccount) {
                  setSourceAccount(response.data.item.SavingDetail[0])
                  setSourceAccountList(response.data.item.SavingDetail)
                  setMemID(response.data.item.MEMID)
                  setDestinationLoanList(response.data.itemdetail[0])
                  setLOAN_LIST(response.data.itemdetail)

                  dispatch({ type: 'SET_SAVING_LIST', SAVING_LIST: response.data.item.SavingDetail })
                  setIsLoading(false)
                } else {
                  let newSavings = []
                  const main = (response.data.item.SavingDetail).find(account => account.ACCOUNT_NO === mainAccount.ACCOUNT_NO)

                  newSavings.push(main)

                  dispatch({ type: 'SET_SAVING_LIST', SAVING_LIST: newSavings })

                  setSourceAccount(main)
                  setSourceAccountList(newSavings)

                  setTimeout(() => {
                    axios
                      .post(`${StoreAPI_URL}/loanscan`, {
                        LCONT_ID: qrLoanCode,
                      }, {
                        headers: {
                          APP_KEY: APP_KEY,
                          Authorization: `Bearer ${token}`,
                        },
                      })
                      .then(async response => {
                        const { code, item, itemdetail, message } = response.data

                        if (code === 10) {
                          const amount = prettyAmount(qrAmount)

                          setLoanType('otherLoan')
                          setQrShare(item.MEM)
                          setQrLoanId(item.LCONT_ID)
                          setOtherNumber(...amount)
                          setIsLoading(false)

                          try {
                            await AsyncStorage.setItem('token', itemdetail)
                          } catch (err) {
                            console.log(err)
                          }
                        } else {
                          showAlert(true)
                          setAlertMessage(message)
                        }
                      })
                      .catch(err => {
                        console.log(err)
                      })
                  }, 500)
                }

                try {
                  await AsyncStorage.setItem('token', response.data.item.Token)
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
    setDestinationMem('')
    setDestinationLoan('')
    setOtherDebt(null)
    setMemo('')
  }, [LoanType])

  useEffect(() => {
    const backAction = () => {
      handleBackNavigator()
      return true
    }

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction)

    return () => backHandler.remove()
  })

  if (isLoading) {
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
              <Text style={styles.labelText}>ชำระสินเชื่อ</Text>
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
                      <Pressable style={LoanType === 'ownLoan' ? styles.tapBtnActive : styles.tapBtn} onPress={() => favoriteNumber === undefined && setLoanType('ownLoan')}>
                        <Text style={LoanType === 'ownLoan' ? styles.tapTextActive : styles.tapText}>สินเชื่อตัวเอง</Text>
                      </Pressable>

                      <Pressable style={LoanType === 'otherLoan' ? styles.tapBtnActive : styles.tapBtn} onPress={() => setLoanType('otherLoan')}>
                        <Text style={LoanType === 'otherLoan' ? styles.tapTextActive : styles.tapText}>สินเชื่อผู้อื่น</Text>
                      </Pressable>
                    </View>

                    <Text style={styles.titleText}> ไปยังสินเชื่อ</Text>

                    {
                      LoanType === 'ownLoan' ? (
                        <View style={[{ height: verticalScale(175) }]}>
                          {
                            LOAN_LIST.length <= 0 ? (
                              <View>
                                <TouchableOpacity style={styles.savingBox}>
                                  <Text style={styles.savingText} numberOfLines={1} > ไม่พบหมายเลขสินเชื่อ</Text>
                                </TouchableOpacity>

                                <Text style={styles.titleText}>จำนวนเงิน</Text>

                                <TextInput
                                  editable={false}
                                  placeholder='0.00'
                                  style={[styles.input, styles.amountInput]}
                                />
                              </View>
                            ) : (
                              <View>
                                <TouchableOpacity style={styles.savingBox} onPress={() => setModalVisible(true)}>
                                  <Text style={styles.savingText} numberOfLines={1}>{LoanLcontID} {LoanName}</Text>

                                  <AntDesign name='down' size={16} color='#aaa' />
                                </TouchableOpacity>

                                <Text style={styles.titleText}>จำนวนเงิน</Text>

                                <TextInput
                                  placeholder='0.00'
                                  style={[styles.input, styles.amountInput]}
                                  onChangeText={text => setOwnNumber(text)}
                                  value={ownNumber}
                                  onBlur={onBlur}
                                  keyboardType='numeric'
                                />

                                {
                                  debt !== null && (
                                    <Text style={styles.guideText}>
                                      หนี้คงเหลือ {debt} บาท
                                      {
                                        chargeAmount !== null && chargeAmount !== 0 && (
                                          <Text>   ค่าติดตาม {chargeAmount} บาท</Text>
                                        )
                                      }
                                    </Text>
                                  )
                                }
                              </View>
                            )
                          }
                        </View>
                      ) : (
                        !favoriteNumber ? (
                          !qrLoanCode ? (
                            <View style={[{ height: verticalScale(240) }]}>
                              <TextInputMask
                                autoFocus={true}
                                type={'custom'}
                                placeholder='เลขบัญชีหุ้นปลายทาง'
                                keyboardType='numeric'
                                placeholderTextColor='#999'
                                options={{ mask: '999-99-99999' }}
                                value={DestinationMem}
                                onChangeText={text => setDestinationMem(text)}
                                style={styles.input}
                              />

                              <TextInputMask
                                type={'custom'}
                                placeholder='เลขที่สัญญาปลายทาง'
                                placeholderTextColor='#999'
                                options={{ mask: '*.999999/9999' }}
                                value={DestinationLoan}
                                onChangeText={text => setDestinationLoan(text)}
                                style={[styles.input, { marginTop: 10 }]}
                              />

                              <View style={{ marginTop: 10 }}>
                                <Text style={[styles.titleText]}>จำนวนเงิน</Text>

                                <TextInput
                                  placeholder='0.00'
                                  style={[styles.input, styles.amountInput]}
                                  onChangeText={text => setOtherNumber(text)}
                                  value={otherNumber}
                                  onBlur={onBlur}
                                  keyboardType='numeric'
                                />

                                {
                                  otherDebt !== null && (
                                    <Text style={styles.guideText}>
                                      หนี้คงเหลือ {otherDebt} บาท
                                      {
                                        otherChargeAmount !== null && otherChargeAmount !== 0 && (
                                          <Text>   ค่าติดตาม {otherChargeAmount} บาท</Text>
                                        )
                                      }
                                    </Text>
                                  )
                                }
                              </View>
                            </View>
                          ) : (
                            <View style={[{ height: verticalScale(240) }]}>
                              <TextInputMask
                                editable={false}
                                autoFocus={true}
                                type={'custom'}
                                placeholder='เลขบัญชีหุ้นปลายทาง'
                                keyboardType='numeric'
                                placeholderTextColor='#999'
                                options={{ mask: '999-99-99999' }}
                                value={qrShare}
                                style={styles.input}
                              />

                              <TextInputMask
                                editable={false}
                                type={'custom'}
                                placeholder='เลขที่สัญญาปลายทาง'
                                placeholderTextColor='#999'
                                options={{ mask: '*.999999/9999' }}
                                value={qrLoanId}
                                style={[styles.input, { marginTop: 10 }]}
                              />

                              <View style={{ marginTop: 10 }}>
                                <Text style={[styles.titleText]}>จำนวนเงิน</Text>

                                <TextInput
                                  placeholder='0.00'
                                  style={[styles.input, styles.amountInput]}
                                  onChangeText={text => setOtherNumber(text)}
                                  value={otherNumber}
                                  onBlur={onBlur}
                                  keyboardType='numeric'
                                />

                                {
                                  otherDebt !== null && (
                                    <Text style={styles.guideText}>
                                      หนี้คงเหลือ {otherDebt} บาท
                                      {
                                        otherChargeAmount !== null && otherChargeAmount !== 0 && (
                                          <Text>   ค่าติดตาม {otherChargeAmount} บาท</Text>
                                        )
                                      }
                                    </Text>
                                  )
                                }
                              </View>
                            </View>
                          )
                        ) : (
                          <View style={[{ height: verticalScale(240) }]}>
                            <TextInputMask
                              editable={false}
                              autoFocus={true}
                              type={'custom'}
                              placeholder='เลขบัญชีหุ้นปลายทาง'
                              keyboardType='numeric'
                              placeholderTextColor='#999'
                              options={{ mask: '999-99-99999' }}
                              value={favoriteShare}
                              style={styles.input}
                            />

                            <TextInputMask
                              editable={false}
                              type={'custom'}
                              placeholder='เลขที่สัญญาปลายทาง'
                              placeholderTextColor='#999'
                              options={{ mask: '*.999999/9999' }}
                              value={favoriteNumber}
                              style={[styles.input, { marginTop: 10 }]}
                            />

                            <View style={{ marginTop: 10 }}>
                              <Text style={[styles.titleText]}>จำนวนเงิน</Text>

                              {
                                favNumber ? (
                                  <TextInput
                                    placeholder={'0.00'}
                                    style={[styles.input, { textAlign: 'right' }]}
                                    onChangeText={text => setFavNumber(text)}
                                    value={favNumber}
                                    onBlur={() => onBlur()}
                                    keyboardType='numeric'
                                  />
                                ) : (
                                  <TextInput
                                    placeholder={'0.00'}
                                    style={[styles.input, { textAlign: 'right' }]}
                                    onChangeText={text => setOtherNumber(text)}
                                    value={otherNumber}
                                    onBlur={() => onBlur()}
                                    keyboardType='numeric'
                                  />
                                )
                              }

                              {
                                otherDebt !== null && (
                                  <Text style={styles.guideText}>หนี้คงเหลือ {otherDebt} บาท</Text>
                                )
                              }
                            </View>
                          </View>
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
                  <TouchableOpacity style={styles.button} onPress={onSubmit} >
                    <Text style={styles.btnText}>ตรวจสอบข้อมูล</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>

          <ActionSheet
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            title='เลือกสินเชื่อ'
          >
            <ScrollView style={{ width: '100%' }}>
              {
                LOAN_LIST.length <= 0 ? (
                  <TouchableOpacity style={styles.modalSavingList} onPress={() => setModalVisible(false)}>
                    <Text style={styles.savingText}> ไม่พบหมายเลขสินเชื่อ</Text>
                  </TouchableOpacity>
                ) : (
                  LOAN_LIST.map((loan, index) => (
                    <TouchableOpacity key={index} style={[styles.modalSavingList, { paddingVertical: 16 }]} onPress={() => selectLoan(loan)}>
                      <Text style={styles.savingText} numberOfLines={1}>{loan.LCONT_ID} {loan.LSUB_NAME}</Text>
                    </TouchableOpacity>
                  ))
                )
              }
            </ScrollView>
          </ActionSheet>

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

export default LoanPayment

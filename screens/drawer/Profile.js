import React, { useState, useEffect } from 'react'
import {
  Text,
  View,
  Image,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Platform,
  TouchableOpacity,
  SafeAreaView,
  BackHandler
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import { ScaledSheet } from 'react-native-size-matters'
import AppAlert from '../../components/AppAlert'
import { APP_KEY, COOP_NAME, PRIMARY_COLOR } from '../../environment'
import NetInfo from '@react-native-community/netinfo'
import { addScreenshotListener } from 'react-native-detector'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'

export default function Profile({ route, navigation }) {
  const [UserProfile, setUserProfile] = useState(null)
  const [photo, setPhoto] = useState(null)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')

  const handleBackNavigator = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }]
    })
  }

  const hidePhone = (phone) => {
    if (phone !== null)
      return 'xxx xxx ' + phone.slice(6, 10)
    else
      return ''
  }

  const hideIdNumber = (id) => {
    if (id !== null)
      return id.slice(0, 1) + ' ' + id.slice(1, 5) + ' ' + 'xxxxx xx' + ' ' + id.slice(12, 13)
    else
      return ''
  }

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

  useEffect(() => {
    const getImage = async () => {
      try {
        const imageUri = await AsyncStorage.getItem('imageUri')
        if (imageUri !== null) {
          setPhoto(imageUri)
        }
      } catch (error) {
        console.log(error)
      }
    }

    getImage()

    const getData = async () => {
      try {
        const StoreAPI_URL = await AsyncStorage.getItem('StoreAPI_URL')
        const token = await AsyncStorage.getItem('token')
        const apiKey = await AsyncStorage.getItem('confirmShareNumber')

        if (StoreAPI_URL !== null) {
          axios.post(`${StoreAPI_URL}/Profile`, {
            API_KEY: apiKey
          }, {
            headers: {
              APP_KEY: APP_KEY,
              Authorization: `Bearer ${token}`
            }
          })
            .then(async (response) => {

              if (response.data !== undefined) {
                setUserProfile(response.data.item)
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

    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isInternetReachable) {
        getData()
      } else {
        setShowAlert(true)
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


  if (UserProfile === null) {
    return (
      <View style={{ flex: 1 }}>
        <StatusBar barStyle='light-content' />

        <View style={styles.appHeader}>
          <SafeAreaView style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity style={{ paddingRight: 16 }} onPress={() => handleBackNavigator()}>
              <FontAwesome5 name='chevron-left' size={18} color='#fff' />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerText} numberOfLines={1}>{COOP_NAME}</Text>
            </View>
          </SafeAreaView>
        </View>

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
      <View style={{ flex: 1 }}>
        <StatusBar barStyle='light-content' />

        <View style={styles.appHeader}>
          <SafeAreaView style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity style={{ paddingRight: 16 }} onPress={() => handleBackNavigator()}>
              <FontAwesome5 name='chevron-left' size={18} color='#fff' />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerText} numberOfLines={1}>{COOP_NAME}</Text>
            </View>
          </SafeAreaView>
        </View>

        <View style={{ flex: 1 }}>
          <View style={styles.header}>
            {
              photo ? (
                <Image style={styles.avatar} source={{ uri: photo }} />
              ) : (
                <Image style={styles.avatar} source={require('../../assets/avatar.png')} />
              )
            }

            <Text style={styles.headerName}>{UserProfile.USER_NAME}</Text>
          </View>

          <ScrollView style={{ flex: 1 }}>

            <View style={styles.dataContainer}>
              <View style={styles.labelBox}>
                <Text style={styles.textcolor}>เลขที่บัญชีหุ้น</Text>
              </View>
              <View style={styles.dataBox}>
                <Text style={styles.textstye}>{UserProfile.SHR_MEM}</Text>
              </View>
            </View>

            <View style={styles.dataContainer}>
              <View style={styles.labelBox}>
                <Text style={styles.textcolor}>สมาชิกสาขา</Text>
              </View>
              <View style={styles.dataBox}>
                <Text style={styles.textstye}>{UserProfile.BRANCH}</Text>
              </View>
            </View>

            <View style={styles.dataContainer}>
              <View style={styles.labelBox}>
                <Text style={styles.textcolor}>ประเภทสมาชิก</Text>
              </View>
              <View style={styles.dataBox}>
                <Text style={styles.textstye}>{UserProfile.MEMBER_TYPE}</Text>
              </View>
            </View>

            <View style={styles.dataContainer}>
              <View style={styles.labelBox}>
                <Text style={styles.textcolor}>วันที่เป็นสมาชิก</Text>
              </View>
              <View style={styles.dataBox}>
                <Text style={styles.textstye}>{UserProfile.MEM_DATE}</Text>
              </View>
            </View>

            <View style={styles.dataContainer}>
              <View style={styles.labelBox}>
                <Text style={styles.textcolor}>อายุการเป็นสมาชิก</Text>
              </View>
              <View style={styles.dataBox}>
                <Text style={styles.textstye}>{UserProfile.MEM_AGE}</Text>
              </View>
            </View>

            {/* <View style={styles.dataContainer}>
              <View style={styles.labelBox}>
                <Text style={styles.textcolor}>วัน เดือน ปีเกิด</Text>
              </View>
              <View style={styles.dataBox}>
                <Text style={styles.textstye}>{UserProfile.DMY_BIRTH}</Text>
              </View>
            </View> */}

            <View style={styles.dataContainer}>
              <View style={styles.labelBox}>
                <Text style={styles.textcolor}>อายุ</Text>
              </View>
              <View style={styles.dataBox}>
                <Text style={styles.textstye}>{UserProfile.AGE} ปี</Text>
              </View>
            </View>

            <View style={styles.dataContainer}>
              <View style={styles.labelBox}>
                <Text style={styles.textcolor}>เลขที่บัตรประชาชน</Text>
              </View>
              <View style={styles.dataBox}>
                <Text style={styles.textstye}>{hideIdNumber(UserProfile.ID_CARD)}</Text>
              </View>
            </View>

            <View style={styles.dataContainer}>
              <View style={styles.labelBox}>
                <Text style={styles.textcolor}>เบอร์โทรศัพท์</Text>
              </View>
              <View style={styles.dataBox}>
                <Text style={styles.textstye}>{hidePhone(UserProfile.MOBILE_TEL)}</Text>
              </View>
            </View>

            <View style={styles.dataContainer}>
              <View style={styles.labelBox}>
                <Text style={styles.textcolor}>ที่อยู่</Text>
              </View>
              <View style={styles.dataBox}>
                <Text style={styles.textstye}>{UserProfile.ADDRESS}</Text>
                <Text style={styles.textstye}>{UserProfile.PROVINCE}</Text>
              </View>
            </View>

          </ScrollView>
        </View>
      </View>
    )
  }
}

const styles = ScaledSheet.create({
  textcolor: {
    color: PRIMARY_COLOR,
    fontFamily: 'Sarabun-Light',
    fontSize: '14@s',
    paddingVertical: '1@s',
  },
  textstye: {
    fontFamily: 'Sarabun-Light',
    fontSize: '14@s',
    color: '#434343',
    paddingVertical: '1@s',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    backgroundColor: PRIMARY_COLOR,
    alignItems: 'center',
  },
  avatar: {
    width: '70@s',
    height: '70@s',
    borderRadius: '35@s',
    borderWidth: 3,
    borderColor: '#fff',
  },
  headerName: {
    fontFamily: 'Sarabun-Medium',
    color: '#fff',
    fontSize: '16@s',
    marginVertical: '10@vs',
    paddingVertical: '1.5@s',
  },
  info: {
    flex: 1,
  },
  dataContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  labelBox: {
    flex: 0.45,
  },
  dataBox: {
    flex: 0.55
  },
  appHeader: {
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

import React, { useEffect } from 'react'
import { Text, View, TouchableOpacity, BackHandler, Platform } from 'react-native'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { styles } from '../../styles/favoriteSuccess'
import { addScreenshotListener } from 'react-native-detector'

const FavoriteSuccess = ({ route, navigation }) => {
    const { type, newFavoriteName, previousScreen } = route.params

    const onSubmit = () => {
        navigation.reset({
            index: 0,
            routes: [
                {
                    name: 'FavoriteDashboard',
                    params: {
                        previousScreen: previousScreen
                    }
                }
            ]
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
            onSubmit()
            return true
        }

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        )

        return () => backHandler.remove()
    })

    return (
        <View style={styles.container}>
            <View style={styles.banner}>
                <Text style={styles.bannerText}>สำเร็จ</Text>
                <AntDesign name='checkcircleo' size={48} color='#fff' style={styles.successIcon} />
                <Text style={styles.bannerText}>บันทึกรายการโปรดสำเร็จ</Text>
            </View>

            <View style={styles.body}>
                <View>
                    <View style={[styles.section, { marginTop: 30 }]}>
                        <Text style={[styles.bodyText, { fontFamily: 'Sarabun-Light' }]}>ชื่อรายการโปรด :</Text>
                        <Text style={styles.bodyText}>{newFavoriteName}</Text>
                    </View>
                    <View style={styles.section}>
                        <Text style={[styles.bodyText, { fontFamily: 'Sarabun-Light' }]}>ประเภทรายการโปรด :</Text>
                        <Text style={styles.bodyText}>{type}</Text>
                    </View>
                </View>
                <View style={{ marginBottom: 40, alignSelf: 'center', width: '50%' }}>
                    <TouchableOpacity style={styles.btn} onPress={onSubmit}>
                        <Text style={styles.bannerText}>กลับ</Text>
                    </TouchableOpacity>
                </View>
            </View>

        </View>
    )
}

export default FavoriteSuccess

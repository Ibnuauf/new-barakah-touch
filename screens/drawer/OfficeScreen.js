import React, { useEffect } from 'react'
import { View, Text, Platform, BackHandler } from 'react-native'
import AppHeader2 from '../../components/AppHeader2'
import { WebView } from 'react-native-webview'
import { URL } from '../../environment'
import { styles } from '../../styles/drawerMenu'
import { addScreenshotListener } from 'react-native-detector'

export default function OfficeScreen({ navigation }) {
    const handleBackNavigator = () => {
        navigation.goBack()
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
        <View style={styles.container}>
            <AppHeader2 onPress={handleBackNavigator} />

            <View style={styles.labelBox}>
                <Text style={styles.labelText}>สาขา</Text>
            </View>

            <WebView source={{ uri: `${URL}MobileApp/offset_mobile.php` }} />

        </View>
    )
}
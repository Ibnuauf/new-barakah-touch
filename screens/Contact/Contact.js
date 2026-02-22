import React, { useEffect } from 'react'
import { View, Text, Image, TouchableOpacity, Linking, Platform, BackHandler } from 'react-native'
import AppHeader2 from '../../components/AppHeader2'
import { ScaledSheet } from 'react-native-size-matters'
import AntDesign from 'react-native-vector-icons/AntDesign'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Fontisto from 'react-native-vector-icons/Fontisto'
import { URL, LINE_URL, FACEBOOK_URL, COOP_NAME } from '../../environment'
import { addScreenshotListener } from 'react-native-detector'

export default function Contact({ navigation }) {
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
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <AppHeader2 onPress={handleBackNavigator} />

            <View style={{ justifyContent: 'center', height: '80%' }}>
                <Image
                    style={styles.image}
                    source={require('../../assets/Ibnuauf-Logo-for-App.png')}
                />

                <View style={{ alignItems: 'center' }}>
                    <Text style={styles.title}>ติดต่อเรา</Text>
                    <Text style={[styles.text, { fontFamily: 'Sarabun-Regular' }]}>{COOP_NAME}</Text>
                    <Text style={styles.text}>373 หมู่ที่ 2 ต.ฉลุง อ.เมือง จ.สตูล 91140</Text>
                    <Text style={styles.text}> โทร 074-799-003</Text>
                </View>

                <View style={styles.socialMediaContainer}>
                    <TouchableOpacity style={styles.icon} onPress={() => Linking.openURL(FACEBOOK_URL).catch(err => console.error('An error occured', err))}>
                        <AntDesign name='facebook-square' size={30} color='#4267B2' style={{ marginHorizontal: 30 }} />
                        <Text style={styles.text, styles.iconText}>Ibnu care</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.icon} onPress={() => Linking.openURL(LINE_URL).catch(err => console.error('An error occured', err))}>
                        <Fontisto name='line' size={30} color='#00b900' style={{ marginHorizontal: 30 }} />
                        <Text style={styles.text, styles.iconText}>IBNU AUF</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.icon} onPress={() => Linking.openURL(URL).catch(err => console.error('An error occured', err))}>
                        <FontAwesome name='internet-explorer' size={30} color='#0091d6' style={{ marginHorizontal: 30 }} />
                        <Text style={styles.text, styles.iconText}>ibnuauf.net</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

const styles = ScaledSheet.create({
    text: {
        fontFamily: 'Sarabun-Light',
        fontSize: '14@s',
        color: '#333',
        paddingVertical: '1.5@vs'
    },
    title: {
        fontFamily: 'Sarabun-Regular',
        fontSize: '15@s',
        color: '#333',
        marginVertical: '10@vs'
    },
    image: {
        width: '40%',
        height: '100@s',
        resizeMode: 'cover',
        alignSelf: 'center'
    },
    socialMediaContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: '20@s'
    },
    icon: {
        alignItems: 'center'
    },
    iconText: {
        fontSize: '12@s',
        color: '#555',
        marginTop: '5@vs',
    }
})
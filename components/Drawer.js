import React, { useEffect, useRef } from 'react'
import {
    Modal,
    View,
    Text,
    Pressable,
    Animated,
    Dimensions,
    Image,
    SafeAreaView
} from 'react-native'
import AntDesign from 'react-native-vector-icons/AntDesign'
import Ionicons from 'react-native-vector-icons/Ionicons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { ScaledSheet } from 'react-native-size-matters'
import { useNavigation } from '@react-navigation/native'
import { APP_VERSION } from '../environment'

const { width } = Dimensions.get('window')
const DRAWER_WIDTH = width * 0.7

const size = 20
const color = '#40a9ff'

export default function Drawer({ visible, onClose, onExit }) {
    const navigation = useNavigation()

    const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current

    const onNavigate = (route) => {
        onClose()
        navigation.navigate(route)
    }

    useEffect(() => {
        Animated.timing(translateX, {
            toValue: visible ? 0 : -DRAWER_WIDTH,
            duration: 250,
            useNativeDriver: true,
        }).start()
    }, [visible])

    return (
        <Modal
            visible={visible}
            transparent
            animationType='none'
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                {/* Overlay */}
                <Pressable style={styles.overlay} onPress={onClose} />

                {/* Drawer */}
                <Animated.View
                    style={[
                        styles.drawer,
                        { transform: [{ translateX }] },
                    ]}
                >
                    <View>
                        <SafeAreaView>
                            <View style={styles.header}>
                                <Image style={styles.image} source={require('../assets/new-logo-barakah3.png')} />
                                <Text style={styles.title}>เวอร์ชั่น {APP_VERSION}</Text>
                            </View>
                        </SafeAreaView>

                        <View style={{ marginTop: 10, borderBottomColor: '#ccc', borderBottomWidth: 0.5 }}>
                            <Pressable style={styles.item} onPress={() => onNavigate('NewsScreen')}>
                                <Ionicons name='megaphone-outline' size={size} color={color} />
                                <Text style={styles.text}>ข่าวสารประชาสัมพันธ์</Text>
                            </Pressable>

                            <Pressable style={styles.item} onPress={() => onNavigate('PromotionScreen')}>
                                <AntDesign name='gift' size={size} color={color} />
                                <Text style={styles.text}>โปรโมชั่น</Text>
                            </Pressable>

                            <Pressable style={styles.item} onPress={() => onNavigate('FriedMarket')}>
                                <AntDesign name='shoppingcart' size={size} color={color} />
                                <Text style={styles.text}>ขายทอดตลาด</Text>
                            </Pressable>

                            <Pressable style={styles.item} onPress={() => onNavigate('OfficeScreen')}>
                                <MaterialCommunityIcons name='map-marker-outline' size={size} color={color} />
                                <Text style={styles.text}>ค้นหาสาขา</Text>
                            </Pressable>

                            <Pressable style={styles.item} onPress={() => onNavigate('Contact')}>
                                <AntDesign name='contacts' size={size} color={color} />
                                <Text style={styles.text}>ติดต่อเรา</Text>
                            </Pressable>

                            <Pressable style={styles.item} onPress={() => { onNavigate('Profile') }}>
                                <MaterialCommunityIcons name='account-outline' size={size} color={color} />
                                <Text style={styles.text}>ข้อมูลส่วนตัว</Text>
                            </Pressable>

                            <Pressable style={styles.item} onPress={() => { onNavigate('Setting') }}>
                                <Ionicons name='settings-outline' size={size} color={color} />
                                <Text style={styles.text}>การตั้งค่า</Text>
                            </Pressable>
                        </View>
                    </View>

                    <View>
                        <Pressable style={[styles.item, { borderTopColor: '#ccc', borderTopWidth: 0.5, marginBottom: 10 }]} onPress={onExit}>
                            <MaterialCommunityIcons name='exit-to-app' color={color} size={size} />
                            <Text style={styles.text}>ออกจากระบบ</Text>
                        </Pressable>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    )
}

const styles = ScaledSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    drawer: {
        position: 'absolute',
        left: 0,
        width: DRAWER_WIDTH,
        height: '100%',
        backgroundColor: '#fff',
        paddingTop: 10,
        paddingHorizontal: 20,
        elevation: 8,
        justifyContent: 'space-between'
    },
    header: {
        alignItems: 'center',
        borderBottomColor: '#ccc',
        borderBottomWidth: 0.5,
        paddingBottom: 10
    },
    title: {
        fontFamily: 'Sarabun-Regular',
        fontSize: 13,
        height: 20
    },
    item: {
        height: '45@vs',
        marginVertical: 0,
        flexDirection: 'row',
        alignItems: 'center'
    },
    text: {
        fontFamily: 'Sarabun-Regular',
        color: '#333',
        height: '30@s',
        paddingVertical: 3,
        marginLeft: 8
    },
    image: {
        width: '100@s',
        height: '100@vs',
        resizeMode: 'cover',
    },
})

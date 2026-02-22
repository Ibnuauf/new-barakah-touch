import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import {
    Camera,
    useCameraDevice,
    useCodeScanner,
} from 'react-native-vision-camera'
import Ionicons from 'react-native-vector-icons/Ionicons'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { PRIMARY_COLOR } from '../environment'

const QRScanner = (props) => {
    const [hasPermission, setHasPermission] = useState(false)
    const [refresh, setRefresh] = useState(false)
    const [torchOn, setTorchOn] = useState(false)

    const device = useCameraDevice('back')
    const codeScanner = useCodeScanner({
        codeTypes: ['qr'],
        onCodeScanned: (codes) => {
            // codes[0].value = ค่าที่อ่านได้จาก Qr Code
            props.onRead(codes[0].value)
            setTorchOn(false)
        },
    })

    useEffect(() => {
        // exception case
        setRefresh(!refresh)
    }, [device, hasPermission])

    useEffect(() => {
        const requestCameraPermission = async () => {
            const permission = await Camera.requestCameraPermission()
            console.log('Camera.requestCameraPermission ', permission)
            setHasPermission(permission === 'granted')
        }

        requestCameraPermission()

        //if it is idle for 15 secs, it will be closed
        // setTimeout(() => {
        //     props.onRead(null)
        // }, 15 * 1000)
    }, [])

    if (device == null || !hasPermission) {
        return (
            <View style={styles.page2}>
                <Text style={{ backgroundColor: 'white' }}>
                    Camera not available or not permitted
                </Text>
            </View>
        )
    }

    return (
        <View style={styles.page2}>
            <Camera
                codeScanner={codeScanner}
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={true}
                torch={torchOn ? 'on' : 'off'}
            />
            <View style={styles.backHeader}>
                <View style={{ opacity: 0 }}>
                    <AntDesign name='close' size={30} color={PRIMARY_COLOR} />
                </View>
                <Text style={[styles.primaryText]}>สแกน QR ชำระเงิน</Text>
                <TouchableOpacity onPress={() => props.handleBackNavigator()}>
                    <AntDesign name='close' size={30} color={PRIMARY_COLOR} />
                </TouchableOpacity>
            </View>
            <View style={styles.footer}>
                <TouchableOpacity onPress={() => props.handleChoosePhoto()} style={styles.icon}>
                    <Ionicons name='image-sharp' size={30} color={PRIMARY_COLOR} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setTorchOn(prev => !prev)} style={styles.icon} >
                    <Ionicons name='flash' size={30} color={PRIMARY_COLOR} />
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default QRScanner

const styles = StyleSheet.create({
    page2: {
        flex: 1,
        position: 'absolute',
        top: 0,
        width: 0,
        height: '100%',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    backHeader: {
        backgroundColor: '#fff',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        paddingVertical: '10%',
        paddingHorizontal: 22,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    footer: {
        backgroundColor: '#fff',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '10%',
        height: '20%',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row'
    },
    icon: {
        padding: 10,
        borderRadius: 100,
        borderWidth: 2,
        borderColor: PRIMARY_COLOR,
    },
    primaryText: {
        fontFamily: 'Sarabun-Medium',
        fontSize: 16,
        color: PRIMARY_COLOR,
        paddingVertical: 1.5
    },
})
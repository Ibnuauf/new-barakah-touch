import React from 'react'
import { View, ImageBackground, Image, StyleSheet, TouchableWithoutFeedback } from 'react-native'
// import { NativeBaseProvider } from 'native-base'

export default function LoginLayout(props) {
    return (
        // <NativeBaseProvider>
            <ImageBackground source={require('../../assets/blue-wallpapers.jpg')} style={styles.image} blurRadius={10}>
                <TouchableWithoutFeedback onPress={props.onPress}>
                    <View style={styles.container}>
                        <Image
                            style={{ width: '45%', height: 120 }}
                            source={require('../../assets/index.png')}
                        />
                        {props.children}
                    </View>
                </TouchableWithoutFeedback>
            </ImageBackground>
        // </NativeBaseProvider>
    )
}

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    image: {
        flex: 1,
        resizeMode: 'cover',
        justifyContent: 'center'
    }
})

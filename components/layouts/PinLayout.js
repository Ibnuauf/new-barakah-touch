import React from 'react'
import { View, ImageBackground, Image, StyleSheet, SafeAreaView } from 'react-native'

export default function PinLayout(props) {
    return (
        <ImageBackground source={require('../../assets/blue-wallpapers.jpg')} style={styles.image} blurRadius={10}>
            <SafeAreaView>
                <View style={styles.container}>
                    <Image
                        style={{ width: '45%', height: 120 }}
                        source={require('../../assets/index.png')}
                    />
                    {props.children}
                </View>
            </SafeAreaView>
        </ImageBackground>
    )
}

export const styles = StyleSheet.create({
    container: {
        height: '100%',
        alignItems: 'center',
        justifyContent: 'flex-end'
    },
    image: {
        flex: 1,
        resizeMode: 'cover',
        justifyContent: 'center'
    }
})

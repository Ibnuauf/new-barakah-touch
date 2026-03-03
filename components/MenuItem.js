import React from 'react'
import { Text, View, TouchableOpacity, Image } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'

const MenuItem = ({ title, description, image, onPress }) => {
    return (
        <TouchableOpacity style={styles.statementBox} onPress={onPress}>
            <Image source={image} style={styles.icon} />

            <View>
                <Text style={styles.titleText}>{title}</Text>
                {
                    description && (
                        <Text style={styles.secondaryText}>{description}</Text>
                    )
                }
            </View>
        </TouchableOpacity>
    )
}

export default MenuItem

const styles = ScaledSheet.create({
    statementBox: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        marginTop: '5@s',
        width: '95%',
        paddingVertical: '14@vs',
        alignItems: 'center',
        borderRadius: 10,
        borderColor: '#ccc',
        borderWidth: 1,
        shadowColor: '#555',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 3,
        paddingHorizontal: '16@s',
    },
    icon: {
        width: 50,
        height: 50,
        marginRight: 14
    },
    titleText: {
        fontFamily: 'Sarabun-Regular',
        fontSize: '15@s',
        color: '#555',
        paddingVertical: '1.5@s'
    },
    secondaryText: {
        fontFamily: 'Sarabun-Light',
        color: '#555',
        paddingVertical: '1.5@vs'
    },
})

import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import FavoriteItem from './FavoriteItem'
import FavoriteBankItem from './FavoriteBankItem'

const FavoriteGroup = ({ favorites, type, previousScreen }) => {
    return (
        <View style={styles.container}>
            <View style={styles.lableBox}>
                <Text style={styles.labelTxt}>{type}</Text>
            </View>

            {
                type === 'บัญชีธนาคาร/พร้อมเพย์' ? (
                    favorites?.length > 0 && (
                        favorites.map((item, index) => (
                            <FavoriteBankItem key={index} type={type} item={item} previousScreen={previousScreen} />
                        ))
                    )
                ) : (
                    favorites?.length > 0 && (
                        favorites.map((item, index) => (
                            <FavoriteItem key={index} type={type} item={item} previousScreen={previousScreen} />
                        ))
                    )
                )
            }
        </View>
    )
}

export default FavoriteGroup

const styles = StyleSheet.create({
    container: {
        width: '90%',
        alignItems: 'center',
        marginTop: 5,
        alignSelf: 'center'
    },
    lableBox: {
        backgroundColor: '#bae7ff',
        padding: 6,
        width: '100%',
        marginBottom: 5,
        borderRadius: 5
    },
    labelTxt: {
        fontFamily: 'Sarabun-Light',
        fontSize: 15,
    }
})

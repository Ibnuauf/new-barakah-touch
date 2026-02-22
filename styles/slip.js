import { StatusBar } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'
import { PRIMARY_COLOR } from '../environment'

export const styles = ScaledSheet.create({
    body: {
        justifyContent: 'center',
        alignSelf: 'center',
        width: '100%',
        paddingHorizontal: '10@s'
    },
    header: {
        paddingVertical: '20@vs',
        alignItems: 'center',
        top: 25
    },
    container: {
        flex: 1,
        paddingTop: StatusBar.currentHeight,
        resizeMode: 'cover',
        justifyContent: 'center',
        backgroundColor: '#fefefe'
    },
    slip: {
        flex: 1,
        resizeMode: 'cover',
        justifyContent: 'center'
    },
    logo: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12
    },
    subSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '2@msr',
    },
    subSection1: {
        flexDirection: 'row',
        padding: '5@msr',
    },
    icon: {
        marginHorizontal: '5@s',
        width: '45@s',
        height: '45@s',
    },
    bankIcon: {
        width: '66%',
        height: '66%'
    },
    primaryText: {
        fontFamily: 'Sarabun-Regular',
        fontSize: '14@s',
        color: '#555',
        padding: 1,
    },
    successText: {
        fontFamily: 'Sarabun-Medium',
        fontSize: '15@s',
        color: '#00CC00',
        marginVertical: '6@vs',
    },
    largeText: {
        fontFamily: 'Sarabun-Medium',
        fontSize: '14@s',
        color: '#555',
        paddingVertical: '2@vs',
    },
    secondaryText: {
        fontFamily: 'Sarabun-Regular',
        fontSize: '14@s',
        color: '#777',
        paddingVertical: '2@vs',
    },
    refText: {
        fontFamily: 'Sarabun-Light',
        fontSize: '13@s',
        color: '#777',
        paddingVertical: '1.5@vs',
    },
    favoriteModalCenteredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)'
    },
    favoriteModalView: {
        width: '70%',
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    favoriteModalText: {
        fontFamily: 'Sarabun-Regular',
        fontSize: '14@s',
        marginBottom: 15,
        textAlign: 'center',
        color: PRIMARY_COLOR,
        paddingVertical: '1.5@vs'
    },
    favoriteModalTextStyle: {
        fontFamily: 'Sarabun-Regular',
        fontSize: '13@s',
        color: '#69c0ff',
        textAlign: 'center'
    },
    favoriteModalCloseTextStyle: {
        fontFamily: 'Sarabun-Regular',
        fontSize: '13@s',
        color: '#fff',
        textAlign: 'center'
    },
    favoriteModalButton: {
        borderRadius: 10,
        padding: 10,
        marginTop: 10,
        marginHorizontal: 5
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 10,
    },
    buttonCancel: {
        flex: 1,
        borderColor: '#91d5ff',
        borderWidth: 1,
    },
    buttonOk: {
        flex: 1,
        backgroundColor: PRIMARY_COLOR,
    },
    input: {
        width: '100%',
        borderWidth: 1,
        padding: 10,
        borderRadius: 10,
        borderColor: '#91d5ff',
        fontFamily: 'Sarabun-Regular',
        color: PRIMARY_COLOR,
    },
    menuContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginTop: '36@vs',
        paddingBottom: '30@vs'
    },
    menuItem: {
        width: '90@s',
        alignItems: 'center',
    },
    menuIcon: {
        width: '40@s',
        height: '40@s',
        borderRadius: '20@s',
        borderWidth: 2,
        borderColor: PRIMARY_COLOR,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuText: {
        fontFamily: 'Sarabun-Regular',
        fontSize: '13@s',
        color: PRIMARY_COLOR,
        marginTop: '6@vs',
        textAlign: 'center',
    },
    toastContainer: {
        backgroundColor: '#42ba96',
        flexDirection: 'row',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 20,
        alignItems: 'center'
    },
    amountContainer: {
        paddingVertical: 15, 
        flexDirection: 'row', 
        alignItems: 'center',
    }
})
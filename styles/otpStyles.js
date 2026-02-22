import { ScaledSheet } from 'react-native-size-matters'

export const otpStyles = ScaledSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        paddingVertical: 40,
    },
    image: {
        flex: 1,
        resizeMode: 'cover',
        alignItems: 'center'
    },
    title: {
        alignItems: 'center',
        marginTop: '120@vs',
        width: '100%',
    },
    title2: {
        alignItems: 'center',
        marginTop: '20@vs',
        width: '100%',
    },
    titleText: {
        fontFamily: 'Sarabun-Regular',
        fontSize: '14@s',
        color: '#0047AB',
        width: '100%',
        textAlign: 'center'
    },
    titleTextUnderline: {
        color: '#333',
        textDecorationLine: 'underline'
    },
    refTitle: {
        fontSize: '12@s',
    },
    refTitleTimeOut: {
        fontSize: '12@s',
        color: '#b90e0a'
    },
    largeTitle: {
        fontFamily: 'Sarabun-SemiBold',
        fontSize: '16@s',
        color: '#0047AB',
        width: '100%',
        textAlign: 'center',
        marginBottom: 10
    },
    codeContainer: {
        height: '5%',
        margin: '30@s',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '65%',
    }
})
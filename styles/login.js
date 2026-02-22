import { ScaledSheet } from 'react-native-size-matters'
export const loginStyles = ScaledSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        flex: 1,
        resizeMode: 'cover',
        justifyContent: 'center'
    },
    title: {
        fontFamily: 'Sarabun-Regular',
        fontSize: '20@s',
        color: '#0047AB',
        marginBottom: '30@vs',
        marginTop: '15@vs',
        paddingVertical: 3
    },
    inputView: {
        width: '70%',
        backgroundColor: 'rgba(240, 255, 255, 0.5)',
        borderRadius: 25,
        height: '42@vs',
        marginBottom: 20,
        justifyContent: 'center',
        padding: '16@msr',
        flexDirection: 'row',
        alignItems: 'center',
    },
    inputText: {
        fontFamily: 'Sarabun-ExtraLight',
        height: '55@vs',
        color: '#0047AB',
        fontSize: '14@s',
        flex: 1,
    },
    eye: {
        height: '42@vs',
        paddingHorizontal: 3,
        justifyContent: 'center'
    },
    forgot: {
        fontFamily: 'Sarabun-Regular',
        color: 'white',
        fontSize: '14@s',
        marginTop: 10,
    },
    registerBtn: {
        fontFamily: 'Sarabun-Regular',
        color: '#fff',
        fontSize: '14@s',
        paddingVertical: 3
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22
    },
    modalView: {
        width: '90%',
        height: '80%',
        margin: 20,
        backgroundColor: '#F0FFFF',
        borderRadius: 10,
        padding: '28@msr',
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
    button: {
        borderRadius: 20,
        padding: 5,
        elevation: 2,
        margin: 8
    },
    acceptButton: {
        backgroundColor: '#2196F3',
    },
    notAcceptButton: {
        backgroundColor: '#6F8FAF',
    },
    textStyle: {
        fontFamily: 'Sarabun-Light',
        color: 'white',
        fontSize: '14@s',
        textAlign: 'center'
    },
    modalText: {
        fontFamily: 'Sarabun-Light',
        marginBottom: 5,
    },
    closeIcon: {
        position: 'absolute',
        top: 40,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.03)',
        width: 50,
        height: 50,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center'
    },
    largeTitle: {
        fontFamily: 'Sarabun-Medium',
        fontSize: '18@s',
        color: '#0047AB',
        width: '100%',
        textAlign: 'center',
        marginBottom: '30@vs',
        marginTop: '15@vs',
        paddingVertical: '3@vs'
    },
    popoverMsg: {
        fontFamily: 'Sarabun-Light',
        lineHeight: 26
    }
})
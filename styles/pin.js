import { ScaledSheet } from 'react-native-size-matters'

export const styles = ScaledSheet.create({
    titleText: {
        fontFamily: 'Sarabun-Regular',
        fontSize: '15@s',
        color: '#0047AB',
        width: '100%',
        textAlign: 'center',
        marginTop: '10@vs',
        marginBottom: '5@vs',
    },
    codeContainer: {
        height: '5%',
        margin: '18@s',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '50%',
        marginBottom: '25@vs',
        marginTop: '5@vs'
    },
    code: {
        width: 15,
        height: 15,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#0047AB'
    },
    codeSelected: {
        width: 15,
        height: 15,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#0047AB',
        backgroundColor: '#0047AB'
    },
    container: {
        width: '100%',
        alignItems: 'center',
        marginBottom: '20@vs'
    },
    numberContainer: {
        width: '75%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
    },
    number: {
        width: '60@s',
        height: '60@s',
        borderRadius: '60@s',
        margin: 7,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.4)'
    },
    numberText: {
        fontFamily: 'Sarabun-Light',
        fontSize: '24@s',
        color: '#0047AB',
        letterSpacing: 0,
        textAlign: 'center'
    },
    closeIcon: {
        position: 'absolute',
        top: 10,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.03)',
        width: 50,
        height: 50,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center'
    },
    loadingModal: {
        backgroundColor: '#fff',
        width: '30%',
        height: '10%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10
    },
    avatar: {
        width: '100%',
        height: '100%',
        flex: 0.4,
        alignItems: 'center',
    },
    userImage: {
        width: '65@s',
        height: '65@s',
        borderRadius: '32.5@s',
        marginRight: '14@s'
    },
})
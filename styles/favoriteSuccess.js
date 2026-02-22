import { ScaledSheet } from 'react-native-size-matters'

export const styles = ScaledSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e6f7ff'
    },
    banner: {
        backgroundColor: '#52c41a',
        flex: 0.4,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bannerText: {
        fontFamily: 'Sarabun-Regular',
        fontSize: '16@s',
        color: '#fff',
        padding: '3@s',
    },
    successIcon: {
        marginVertical: '20@vs'
    },
    body: {
        width: '100%',
        backgroundColor: '#fafafa',
        flex: 0.6,
        justifyContent: 'space-between'
    },
    bodyText: {
        fontFamily: 'Sarabun-Regular',
        fontSize: '14@s',
        color: '#595959',
        padding: '3@s'
    },
    section: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: '6@vs',
        paddingHorizontal: '12@s'
    },
    btn: {
        backgroundColor: '#52c41a',
        padding: '6@s',
        alignItems: 'center',
        borderRadius: '10@s'
    },
})
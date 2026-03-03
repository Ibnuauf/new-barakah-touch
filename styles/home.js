import { ScaledSheet } from 'react-native-size-matters'
import { PRIMARY_COLOR } from '../environment'

export const styles = ScaledSheet.create({
    container: {
        flex: 1,
    },
    image: {
        flex: 1,
        resizeMode: 'cover',
        justifyContent: 'center'
    },
    headerText: {
        fontSize: '16@s',
        color: '#fff',
        fontFamily: 'Sarabun-Medium',
        paddingVertical: 3,
        lineHeight: 36,
    },
    body: {
        flex: 1
    },
    banner: {
        height: '40%',
    },
    bannerImage: {
        flex: 1,
        resizeMode: 'cover',
        justifyContent: 'center'
    },
    userImage: {
        width: '65@s',
        height: '65@s',
        borderRadius: '32.5@s',
        marginRight: '14@s'
    },
    avatarImage: {
        width: '65@s',
        height: '65@s',
        marginRight: '14@s'
    },
    menuContainer: {
        alignItems: 'center',
    },
    avatar: {
        width: '100%',
        height: '100%',
        flex: 0.4,
        alignItems: 'flex-end',
    },
    bannerText: {
        fontFamily: 'Sarabun-Medium',
        fontSize: '15@s',
        color: '#32b4e7',
        marginLeft: '14@s',
        paddingVertical: 1
    },
    totalText: {
        fontFamily: 'Sarabun-Regular',
        fontSize: '14@s',
        color: '#004068',
        marginLeft: 10
    },
    primaryText: {
        fontFamily: 'Sarabun-Regular',
        fontSize: '14@s',
        color: '#32b4e7',
        paddingVertical: 2,
    },
    accountNoText: {
        marginLeft: '14@s',
        fontFamily: 'Sarabun-Light'
    },
    welcomeContainer: {
        flexDirection: 'row',
        flex: 0.7
    },
    userInfo: {
        flex: 1.2,
        top: 4
    },
    totalContainer: {
        flexDirection: 'row',
        flex: 0.3,
        backgroundColor: '#d7dae2',
        paddingVertical: '8@msr',
    },
    totalBox: {
        flex: 0.5,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row'
    },
    menuCard: {
        height: '100%',
        alignItems: 'center',
        justifyContent: 'space-evenly',
    },
    iconImage: {
        width: '70@s',
        height: '70@s'
    },
    header: {
        padding: 16,
        backgroundColor: PRIMARY_COLOR
    }
})
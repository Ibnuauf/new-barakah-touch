import { ScaledSheet } from 'react-native-size-matters'

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
        color: '#333',
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
        flex: 0.4,
        alignItems: 'flex-end',
    },
    bannerText: {
        fontFamily: 'Sarabun-Regular',
        fontSize: '16@s',
        color: '#333',
        marginLeft: '14@s',
        paddingVertical: 3
    },
    totalText: {
        fontFamily: 'Sarabun-Regular',
        fontSize: '14@s',
        color: '#096dd9',
        marginLeft: 10
    },
    primaryText: {
        fontFamily: 'Sarabun-Regular',
        fontSize: '14@s',
        color: '#333',
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
        flex: 0.6,
    },
    totalContainer: {
        flexDirection: 'row',
        flex: 0.3,
        backgroundColor: '#fff',
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
        backgroundColor: 'rgba(0,0,0,0.03)'
    }
})
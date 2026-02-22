import { ScaledSheet } from 'react-native-size-matters'

export const styles = ScaledSheet.create({
    container: {
        flex: 1
    },
    labelText: {
        fontFamily: 'Sarabun-Regular',
        fontSize: '15@s',
        color: '#333'
    },
    labelBox: {
        width: '100%',
        height: '50@vs',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: '14@msr',
        backgroundColor: '#ddd',
        borderBottomColor: '#ccc',
        borderBottomWidth: 1
    },
    headerText: {
        fontSize: '16@s',
        lineHeight: 46,
        paddingVertical: 3,
        color: '#fff',
        fontFamily: 'Sarabun-Medium'
    }
})
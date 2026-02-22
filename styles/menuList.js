import { ScaledSheet } from 'react-native-size-matters'

export const menuListStyles = ScaledSheet.create({
    container: {
        flex: 1,
    },
    labelBox: {
        width: '100%',
        height: '50@vs',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: '14@msr',
        backgroundColor: '#ddd',
    },
    headerBox: {
        borderBottomColor: '#ccc',
        borderBottomWidth: 1
    },
    listContainer: {
        alignItems: 'center'
    },
    labelText: {
        fontFamily: 'Sarabun-Regular',
        fontSize: '15@s',
        color: '#333',
        paddingVertical: '1.5@vs'
    },
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
    titleText: {
        fontFamily: 'Sarabun-Regular',
        fontSize: '15@s',
        color: '#555',
        padding: '1.5@s',
    },
    secondaryText: {
        fontFamily: 'Sarabun-Light',
        color: '#555',
        fontSize: '12@s',
        padding: '1.5@s',
    },
    icon: {
        width: 50, 
        height: 50, 
        marginRight: 14
    },
})
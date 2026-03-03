import { ScaledSheet } from 'react-native-size-matters'
import { PRIMARY_COLOR } from '../environment'

export const styles = ScaledSheet.create({
    body: {
        flex: 1,
        justifyContent: 'space-between',
        backgroundColor: '#fdfdfd'
    },
    section: {
        padding: '12@msr',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomColor: '#ddd',
        borderBottomWidth: 1,
        minHeight: '50@vs'
    },
    leftItem: {
        flex: 1,
    },
    rightItem: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center'
    },
    icon: {
        marginHorizontal: '5@s',
        width: '45@s',
        height: '45@s'
    },
    bankIcon: {
        width: '65%',
        height: '65%'
    },
    primaryText: {
        fontFamily: 'Sarabun-Regular',
        fontSize: '14@s',
        color: '#555',
        paddingVertical: 3
    },
    largeText: {
        fontFamily: 'Sarabun-Medium',
        fontSize: '16@s',
        color: '#555',
        padding: 3
    },
    secondaryText: {
        fontFamily: 'Sarabun-Regular',
        fontSize: '14@s',
        color: '#777',
        paddingVertical: 3
    },
    warnning: {
        width: '90%',
        alignSelf: 'center',
        alignItems: 'center',
        paddingHorizontal: 10,
        marginBottom: 14
    },
    warnningText: {
        fontFamily: 'Sarabun-Light',
        fontSize: '13@s',
        color: '#777',
        textAlign: 'center',
    },
    warnningHeader: {
        fontFamily: 'Sarabun-Regular',
        fontSize: '14@s',
        color: '#ff7875',
        marginVertical: 8,
    },
    button: {
        width: '90%',
        backgroundColor: PRIMARY_COLOR,
        borderRadius: 5,
        height: '42@vs',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginBottom: '50@s'
    },
    btnText: {
        fontFamily: 'Sarabun-Medium',
        color: '#fff',
        fontSize: '16@s',
        padding: 3
    },
    subSection1: {
        flexDirection: 'row',
        padding: '5@msr',
    },
    headerText: {
        fontSize: '16@s',
        color: PRIMARY_COLOR,
        fontFamily: 'Sarabun-Medium',
        paddingVertical: 3,
        lineHeight: 46,
    },
    centeredView: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)'
    },
    modalView: {
        width: '100%',
        height: '65%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: '15@msr',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    container: {
        flex: 1,
        alignItems: 'center'
    },
    closeIcon: {
        width: '100%',
        alignItems: 'flex-end',
        marginBottom: '10@vs'
    },
    title: {
        fontFamily: 'Sarabun-Medium',
        fontSize: '14@s',
        color: '#333',
        paddingVertical: 2
    },
    text: {
        fontFamily: 'Sarabun-Regular',
        fontSize: '14@s',
        color: '#4096ff',
        paddingVertical: '1@vs'
    },
    codeContainer: {
        height: '5%',
        margin: '18@s',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '40%',
        marginBottom: '20@vs',
        marginTop: '10@vs',
    },
    code: {
        width: 15,
        height: 15,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#e0dfdd'
    },
    codeSelected: {
        width: 15,
        height: 15,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#4096ff',
        backgroundColor: '#4096ff'
    },
    numberContainer: {
        width: '80%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
    },
    number: {
        width: '65@s',
        height: '65@s',
        borderRadius: '35@s',
        margin: 7,
        justifyContent: 'center',
        alignItems: 'center',
    },
    numberText: {
        fontFamily: 'Sarabun-Medium',
        fontSize: '24@s',
        color: '#333',
        letterSpacing: 0,
        textAlign: 'center'
    },
    header: {
        padding: 16,
        backgroundColor: '#eee'
    },
})
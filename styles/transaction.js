import { ScaledSheet } from 'react-native-size-matters'
import { PRIMARY_COLOR } from '../environment'

export const styles = ScaledSheet.create({
    labelBox: {
        width: '100%',
        height: '50@vs',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: '14@msr',
        backgroundColor: '#ddd',
    },
    headerLabelBox: {
        borderBottomColor: '#ccc',
        borderBottomWidth: 1
    },
    labelText: {
        fontFamily: 'Sarabun-Regular',
        fontSize: '15@s',
        color: '#333',
        paddingVertical: '1.5@vs',
    },
    input: {
        marginTop: '3@vs',
        backgroundColor: '#fff',
        fontFamily: 'Sarabun-Light',
        height: '45@vs',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        fontSize: '14@s',
        color: '#333',
        paddingHorizontal: '12@s',
        marginBottom: '10@s'
    },
    amountInput: {
        textAlign: 'right'
    },
    titleText: {
        fontFamily: 'Sarabun-Regular',
        fontSize: '14@s',
        color: '#555',
        padding: 3,
    },
    memoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end'
    },
    mamoLen: {
        fontFamily: 'Sarabun-Regular',
        fontSize: '12@s',
        color: '#aaa',
        padding: 3,
    },
    carousel: {
        flexGrow: 0,
        height: '130@vs',
    },
    item: {
        backgroundColor: '#fff',
        height: '110@s',
        marginTop: '5@s',
        justifyContent: 'center',
        borderRadius: 10,
        borderColor: PRIMARY_COLOR,
        borderWidth: 1,
        shadowColor: '#555',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 3,

    },
    button: {
        width: '100%',
        backgroundColor: PRIMARY_COLOR,
        borderRadius: 5,
        height: '42@vs',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: '15@s',
        marginBottom: 50,
    },
    btnText: {
        fontFamily: 'Sarabun-Medium',
        color: '#fff',
        fontSize: '16@s',
        padding: 3
    },
    cardText: {
        fontFamily: 'Sarabun-Light',
        fontSize: '14@s',
        color: '#555',
        padding: 3,
        textAlign: 'left',
    },
    emptyContainer: {
        height: '90%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    formContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
    },
    tapContainer: {
        height: '35@vs',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginBottom: '10@vs'
    },
    tapBtn: {
        flex: 1,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tapBtnActive: {
        flex: 1,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomColor: PRIMARY_COLOR,
        borderBottomWidth: 2
    },
    tapText: {
        fontFamily: 'Sarabun-Regular',
        fontSize: '14@s',
        color: '#999',
        padding: 3
    },
    tapTextActive: {
        fontFamily: 'Sarabun-Medium',
        fontSize: '14@s',
        color: PRIMARY_COLOR,
        padding: 3
    },
    savingBox: {
        marginTop: '3@vs',
        marginBottom: '10@vs',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: '10@s',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        justifyContent: 'space-between',
        paddingVertical: '8@vs',
        minHeight: '45@vs',
    },
    savingText: {
        fontFamily: 'Sarabun-Regular',
        fontSize: '14@s',
        color: '#555',
        paddingVertical: '1@vs'
    },
    savingDetail: {
        fontFamily: 'Sarabun-Light',
        fontSize: '13@s',
    },
    modalSavingList: {
        borderBottomColor: '#eee',
        borderBottomWidth: 1,
        paddingVertical: '8@vs',
        justifyContent: 'center',
        paddingHorizontal: '15@msr',
    },
    modalBankList: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start'
    },
    modalHeaderContent: {
        flexGrow: 1,
        alignSelf: 'flex-start'
    },
    balance: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        alignItems: 'center'
    },
    cardBoldText: {
        fontFamily: 'Sarabun-Medium',
        fontSize: '14@s',
        color: '#555',
    },
    bankLogo: {
        width: 40,
        height: 40,
        marginRight: 16
    },
    guideText: {
        fontFamily: 'Sarabun-Light',
        fontSize: '11@s',
        color: '#777',
        marginTop: 2,
        paddingVertical: '1@vs',
    }
})
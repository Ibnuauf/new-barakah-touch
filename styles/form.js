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
        borderBottomColor: '#ccc',
        borderBottomWidth: 1
    },
    labelText: {
        fontFamily: 'Sarabun-Regular',
        fontSize: '15@s',
        color: '#333',
        paddingVertical: 3
    },
    shareInfoBox: {
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        overflow: 'hidden',
        height: '50@s',
        padding: 0,
        marginTop: '2@vs',
        marginBottom: '10@vs'
    },
    input: {
        marginTop: '2@vs',
        backgroundColor: '#fff',
        fontFamily: 'Sarabun-Light',
        height: '45@vs',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        fontSize: '14@s',
        color: '#333',
        paddingHorizontal: '12@s'
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
    buttonContainer: {
        marginTop: '20@vs',
        flexDirection: 'row',
        justifyContent: 'center',
        minHeight: '100@vs'
    },
    button: {
        width: '40%',
        borderRadius: 25,
        height: '42@vs',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: '5@s'
    },
    backBtn: {
        borderColor: '#1b7ecd',
        borderWidth: 1,
    },
    nextBtn: {
        backgroundColor: PRIMARY_COLOR,
    },
    buttonText: {
        fontFamily: 'Sarabun-Medium',
        fontSize: '16@s'
    },
    backText: {
        color: '#1b7ecd',
    },
    nextText: {
        color: '#fff',
    },
    emptyContainer: {
        height: '92%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    accountNameText: {
        fontFamily: 'Sarabun-Light',
        fontSize: '13@s',
        color: '#333',
        paddingVertical: '1.5@vs',
    },
    accountNameContainer: {
        height: '40@vs',
        justifyContent: 'center',
        paddingHorizontal: 10,
    },
    btnContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: '10@vs',
    },
    btnTab: {
        width: '40%',
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: '#ccc',
        borderWidth: 1,
        paddingVertical: '2@s'
    },
    btnTabActive: {
        backgroundColor: PRIMARY_COLOR,
        width: '40%',
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: PRIMARY_COLOR,
        borderWidth: 0.5
    },
    btnTabText: {
        fontFamily: 'Sarabun-Light',
        fontSize: '14@s',
        color: '#333',
        padding: 3
    },
    btnTabTextActive: {
        fontFamily: 'Sarabun-Medium',
        fontSize: '15@s',
        color: '#fff',
        padding: 3
    },
    formContainer: {
        backgroundColor: '#fff',
        padding: '20@vs',
        marginTop: '10@vs',
        width: '95%',
        alignSelf: 'center',
        minHeight: '300@vs',
        borderColor: '#ccc',
        borderWidth: 0.5,
        borderRadius: 10
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
    modalHeaderContent: {
        alignSelf: 'flex-start',
        paddingLeft: '10@s'
    },
    guideText: {
        fontFamily: 'Sarabun-Light',
        fontSize: '11@s',
        color: '#777',
        marginTop: 2,
        paddingVertical: '1@vs',
    }
})
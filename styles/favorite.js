import { ScaledSheet } from 'react-native-size-matters'
import { PRIMARY_COLOR } from '../environment'

export const styles = ScaledSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fafafa'
    },
    headerText: {
        fontSize: '16@s',
        color: '#fff',
        fontFamily: 'Sarabun-Medium',
        paddingVertical: 6,
        lineHeight: 52,
        paddingTop: -6,
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
    // ---------------- Modal ----------------- //
    modalText: {
        marginBottom: 15,
        fontFamily: 'Sarabun-Medium',
        fontSize: '14@s',
        color: '#434343',
    },
    modalItemBox: {
        borderBottomColor: '#f0f0f0',
        borderBottomWidth: 1,
        height: '50@vs',
        justifyContent: 'center',
        paddingHorizontal: '15@msr',
    },
    modalItemText: {
        fontFamily: 'Sarabun-Regular',
        fontSize: '14@s',
        color: '#595959',
        padding: '3@s',
    },
    modalHeaderContent: {
        alignSelf: 'flex-start',
        paddingLeft: '10@s'
    },
    // -------------------------------------------- //
    labelText: {
        fontFamily: 'Sarabun-Regular',
        fontSize: '15@s',
        color: '#555',
        paddingVertical: '1.5@s'
    },
    inputBox: {
        marginTop: '5@vs',
        backgroundColor: '#fff',
        height: '45@vs',
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: '#d9d9d9',
        paddingHorizontal: '12@s',
        marginBottom: '10@s',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    input: {
        width: '80%',
        height: '100%',
        fontFamily: 'Sarabun-Light',
        fontSize: '14@s',
        color: '#434343',
    },
    buttonContainer: {
        marginTop: '20@vs',
        flexDirection: 'row',
        justifyContent: 'center',
        minHeight: '100@vs'
    },
    backBtn: {
        width: '40%',
        borderRadius: 10,
        borderColor: '#1b7ecd',
        borderWidth: 0.5,
        height: '42@vs',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: '5@s'
    },
    nextBtn: {
        width: '40%',
        backgroundColor: PRIMARY_COLOR,
        borderRadius: 10,
        height: '42@vs',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: '5@s'
    },
    backText: {
        fontFamily: 'Sarabun-Regular',
        color: '#1b7ecd',
        fontSize: '16@s'
    },
    nextText: {
        fontFamily: 'Sarabun-Regular',
        color: '#fff',
        fontSize: '16@s'
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    savingBox: {
        marginTop: '3@vs',
        backgroundColor: '#fff',
        fontFamily: 'Sarabun-Light',
        minHeight: '45@vs',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#d9d9d9',
        fontSize: '14@s',
        color: '#333',
        paddingHorizontal: '12@s',
        paddingVertical: '5@vs',
        marginBottom: '10@s',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    balance: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cardBoldText: {
        fontFamily: 'Sarabun-Medium',
        fontSize: '14@s',
        color: '#fff',
    },
    bankLogo: {
        width: 40,
        height: 40,
        marginRight: 16
    },
    modalBankList: {
        borderBottomColor: '#eee',
        borderBottomWidth: 1,
        paddingVertical: '8@vs',
        paddingHorizontal: '15@msr',
        flexDirection: 'row',
        alignItems: 'center',
    },
    savingText: {
        fontFamily: 'Sarabun-Regular',
        fontSize: '14@s',
        color: '#555',
        padding: '1.5@s',
    },
    savingDetail: {
        fontFamily: 'Sarabun-Light',
        fontSize: '12@s',
        color: '#777',
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'center'
    },
    tab: {
        paddingVertical: 8, paddingHorizontal: 16, borderRadius: 50
    },
    tabActive: {
        backgroundColor: PRIMARY_COLOR,
    }
})
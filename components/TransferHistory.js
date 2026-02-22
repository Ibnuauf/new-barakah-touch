import React from 'react'
import { Text, View, TouchableOpacity, Image } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'
import { prettyAmount, searchBankIcon } from '../util'

const TransferHistory = ({ history }) => {

    const getIcon = ({ ProxyType, ToBankID }) => {
        switch (ProxyType) {
            case 'MSISDN': return require('../assets/bank/smartphone.png')
            case 'NATID': return require('../assets/bank/idcard.png')
            case 'ACCNO': return searchBankIcon(ToBankID)
            default: return require('../assets/bank/idcard.png')
        }
    }

    return (
        history.map((item, index) => (
            <TouchableOpacity style={[styles.item, index === history.length - 1 && { marginBottom: 20 }]} key={index}>
                <Image source={getIcon(item)} style={styles.bankLogo} />

                <View style={styles.middleDetail}>
                    <Text style={styles.name}>{item.BeneficiaryName}</Text>
                    <Text style={styles.accountNo}>{item.ProxyID}</Text>
                </View>

                <View style={styles.rightDetail}>
                    <Text style={styles.amount}>{prettyAmount(item.Amount)}</Text>
                    <Text style={styles.date}>{item.DATE_TODAY}</Text>
                </View>
            </TouchableOpacity>
        ))
    )
}

export default TransferHistory

const styles = ScaledSheet.create({
    item: {
        flexDirection: 'row',
        borderBottomColor: '#ececec',
        borderBottomWidth: 1,
        alignItems: 'center',
        paddingVertical: '10@vs'
    },
    bankLogo: {
        width: 32,
        height: 32,
        marginRight: 16
    },
    middleDetail: {
        flex: 1,
    },
    rightDetail: {
        alignItems: 'flex-end'
    },
    name: {
        fontFamily: 'Sarabun-Regular',
        fontSize: '14@s',
        color: '#555',
        paddingVertical: '1@vs',
    },
    accountNo: {
        fontFamily: 'Sarabun-Light',
        fontSize: '13@s',
        color: '#555',
        paddingVertical: '1@vs',
    },
    amount: {
        fontFamily: 'Sarabun-Regular',
        fontSize: '16@s',
        color: '#555',
        paddingVertical: '1@vs',
    },
    date: {
        fontFamily: 'Sarabun-Light',
        fontSize: '13@s',
        color: '#777',
        paddingVertical: '1@vs',
    }
})

import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'
import { useNavigation } from '@react-navigation/native'
import { accountNumberFormat, dateSlipFormat, getAmount, searchBankName, shareNumberFormat } from '../util'
import Ionicons from 'react-native-vector-icons/Ionicons'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'

export default function Statement({ saving, statements }) {
    const navigation = useNavigation()

    const [localStatements, setLocalStatement] = useState([])
    const [id, setId] = useState(null)

    const amountColor = (code) => {
        switch (code) {
            case 'D': return { color: '#52c41a' }
            case 'E': return { color: '#faad14' }
            case 'W': return { color: '#ff4d4f' }
            default: return {}
        }
    }

    const getCopySlip = async (statement) => {
        const createDate = dateSlipFormat(statement.DATE_TODAY)
        const sourceAccountName = saving.ACCOUNT_NAME
        const sourceAccountNumber = saving.ACCOUNT_NO
        const destinationAccountName = statement.FULL_NAME
        const sourceAccountType = saving.ACC_DESC
        const amount = getAmount(statement.DEP_WDL) * -1
        const slipNo = statement.SLIP_NO
        const accType = statement.ACC_TYPE
        const memo = statement.F_CAUSE
        const bankId = statement.ToBankID
        const promptPayType = statement.ProxyType
        let destinationAccountNumber = statement.ACCOUNT

        if (!bankId) {
            if (destinationAccountNumber.length === 11) {
                destinationAccountNumber = accountNumberFormat(destinationAccountNumber)
            } else if (destinationAccountNumber.length === 10) {
                destinationAccountNumber = shareNumberFormat(destinationAccountNumber)
            }

            navigation.reset({
                index: 0,
                routes: [{
                    name: 'SlipCopy',
                    params: {
                        createDate: createDate,
                        sourceAccountName: sourceAccountName,
                        sourceAccountNumber: sourceAccountNumber,
                        sourceAccountType: sourceAccountType,
                        amount: amount,
                        destinationAccountName: destinationAccountName,
                        destinationAccountNumber: destinationAccountNumber,
                        destinationAccountType: accType,
                        slipNo: slipNo,
                        memo: memo
                    }
                }]
            })
        } else {
            navigation.reset({
                index: 0,
                routes: [{
                    name: 'SlipBankCopy',
                    params: {
                        PromptPayAccountNo: destinationAccountNumber,
                        PromptPayAccountName: destinationAccountName,
                        ToBankId: bankId,
                        SenderName: sourceAccountName,
                        SenderReference: sourceAccountNumber,
                        Amount: amount,
                        memo: memo,
                        SLIP_NO: slipNo,
                        CREATE_DATE: createDate,
                        promptPayType: promptPayType
                    }
                }]
            })
        }
    }

    useEffect(() => {
        if (statements) {
            setLocalStatement(statements)
        }
    }, [statements])

    return (
        <ScrollView>
            {
                localStatements.map((statement, i) => (
                    <TouchableOpacity
                        key={i}
                        activeOpacity={0.8}
                        onPress={() => id !== i ? setId(i) : setId(null)}
                    >
                        <View style={statementStyles.statementBox}>
                            <View style={statementStyles.detailsBox}>
                                <Text style={statementStyles.statementText}> {statement.TRANS_DESC}</Text>
                                <Text style={statementStyles.secondaryText}> {statement.DATE_TODAY}</Text>
                            </View>

                            <View style={statementStyles.amountBox}>
                                <Text style={[statementStyles.statementText, amountColor(statement.S_SLIP_CODE)]}>
                                    {statement.S_SLIP_CODE !== 'W' ? '+' : ''}{statement.DEP_WDL} บาท
                                </Text>

                            </View>

                            <View style={statementStyles.iconBox}>
                                {
                                    id === i ? (
                                        <FontAwesome5 name='chevron-up' style={{ marginRight: 6 }} size={16} color='#ccc' />
                                    ) : (
                                        <FontAwesome5 name='chevron-down' style={{ marginRight: 6 }} size={16} color='#ccc' />
                                    )
                                }
                            </View>
                        </View>

                        {
                            id === i && (
                                <View style={statementStyles.statementDetail}>
                                    {
                                        statement.ACCOUNT ? (
                                            <View style={statementStyles.leftBox}>
                                                {
                                                    statement.ToBankID && (
                                                        <View style={statementStyles.statementDetailLine}>
                                                            <Text style={statementStyles.detailText}>ธนาคาร</Text>
                                                            <Text style={[statementStyles.detailText, { fontFamily: 'Sarabun-Regular' }]}>
                                                                {searchBankName(statement.ToBankID)}
                                                            </Text>
                                                        </View>
                                                    )
                                                }
                                                <View style={statementStyles.statementDetailLine}>
                                                    <Text style={statementStyles.detailText}>
                                                        {statement.S_SLIP_CODE === 'D' ? 'จากเลขบัญชี' : statement.ACCOUNT.length > 11 ? ' ไปยังเลขสัญญา' : ' ไปยังเลขบัญชี'}
                                                    </Text>
                                                    <Text style={[statementStyles.detailText, { fontFamily: 'Sarabun-Regular' }]}>
                                                        {statement.ACCOUNT.length === 11 ? accountNumberFormat(statement.ACCOUNT) :
                                                            statement.ACCOUNT.length === 10 ? shareNumberFormat(statement.ACCOUNT) : statement.ACCOUNT}
                                                    </Text>
                                                </View>
                                                <View style={statementStyles.statementDetailLine}>
                                                    <Text style={statementStyles.detailText}> ชื่อบัญชี</Text>
                                                    <Text style={[statementStyles.detailText, { fontFamily: 'Sarabun-Regular' }]}>{statement.FULL_NAME}</Text>
                                                </View>
                                                <View style={statementStyles.statementDetailLine}>
                                                    <Text style={statementStyles.detailText}> ช่องทาง</Text>
                                                    <Text style={[statementStyles.detailText, { fontFamily: 'Sarabun-Regular' }]}>{statement.BR_NO_REC_NAME}</Text>
                                                </View>

                                                {
                                                    // and ถอนผ่านแอป ***
                                                    statement.S_SLIP_CODE === 'W' && statement.TRANS_DESC !== 'ค่าธรรมเนียมโอน-Bank' ? (
                                                        <TouchableOpacity
                                                            style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}
                                                            onPress={() => getCopySlip(statement)}
                                                        >
                                                            <Ionicons name='refresh' style={{ marginRight: 6 }} size={20} color='#1677ff' />
                                                            <Text style={{ fontFamily: 'Sarabun-Regular', color: '#1677ff' }}>ขอสลิปอีกครั้ง</Text>
                                                        </TouchableOpacity>
                                                    ) : null
                                                }
                                            </View>
                                        ) : (
                                            <View>
                                                {
                                                    statement.FULL_NAME && (
                                                        <View style={statementStyles.statementDetailLine}>
                                                            <Text style={statementStyles.detailText}> ชื่อบัญชี</Text>
                                                            <Text style={[statementStyles.detailText, { fontFamily: 'Sarabun-Regular' }]}>{statement.FULL_NAME}</Text>
                                                        </View>
                                                    )
                                                }
                                                <View style={statementStyles.statementDetailLine}>
                                                    <Text style={statementStyles.detailText}> ช่องทาง</Text>
                                                    <Text style={[statementStyles.detailText, { fontFamily: 'Sarabun-Regular' }]}>{statement.BR_NO_REC_NAME}</Text>
                                                </View>
                                            </View>
                                        )
                                    }
                                </View>
                            )
                        }
                    </TouchableOpacity>
                ))
            }
        </ScrollView>
    )
}

export const statementStyles = ScaledSheet.create({
    statementBox: {
        flexDirection: 'row',
        paddingVertical: '12@vs',
        borderBottomColor: '#ddd',
        borderBottomWidth: 1
    },
    detailsBox: {
        width: '50%',
        paddingLeft: '14@msr',
    },
    amountBox: {
        justifyContent: 'center',
        alignItems: 'flex-end',
        width: '40%',
    },
    iconBox: {
        width: '10%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    statementText: {
        fontFamily: 'Sarabun-Regular',
        fontSize: '14@s',
        color: '#333',
    },
    secondaryText: {
        fontFamily: 'Sarabun-Light',
        fontSize: '13@s',
        color: '#555',
        paddingVertical: '1.5@vs',
        marginTop: 2
    },
    statementDetail: {
        backgroundColor: '#fdfdfd',
        paddingHorizontal: 16,
    },
    leftBox: {
        paddingLeft: 14,
        paddingVertical: 12,
        borderLeftColor: '#eee',
        borderLeftWidth: 1
    },
    statementDetailLine: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6
    },
    detailText: {
        fontFamily: 'Sarabun-Light',
        fontSize: '13@s',
        color: '#555',
    }
})

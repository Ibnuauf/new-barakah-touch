import React from 'react'
import { Text, View } from 'react-native'
import { accountNumberFormat } from '../util'
import { statementStyles } from './Statement'

const StatementDetail = ({ statement }) => {
    const { ACCOUNT_NUMBER, ACCOUNT_NAME, BR_NO_REC_NAME } = statement

    return (
        <View style={statementStyles.statementDetail}>
            {
                ACCOUNT_NUMBER ? (
                    <View style={statementStyles.leftBox}>
                        <View style={statementStyles.statementDetailLine}>
                            <Text style={statementStyles.detailText}>จากเลขบัญชี</Text>
                            <Text style={[statementStyles.detailText, { fontFamily: 'Sarabun-Regular' }]}>
                                {ACCOUNT_NUMBER.length === 11 ? accountNumberFormat(ACCOUNT_NUMBER) : ACCOUNT_NUMBER}
                            </Text>
                        </View>
                        <View style={statementStyles.statementDetailLine}>
                            <Text style={statementStyles.detailText}>ชื่อบัญชี</Text>
                            <Text style={[statementStyles.detailText, { fontFamily: 'Sarabun-Regular' }]}>{ACCOUNT_NAME}</Text>
                        </View>
                        <View style={statementStyles.statementDetailLine}>
                            <Text style={statementStyles.detailText}>ช่องทาง</Text>
                            <Text style={[statementStyles.detailText, { fontFamily: 'Sarabun-Regular' }]}>{BR_NO_REC_NAME}</Text>
                        </View>
                    </View>
                ) : (
                    <View>
                        {
                            ACCOUNT_NAME && (
                                <View style={statementStyles.statementDetailLine}>
                                    <Text style={statementStyles.detailText}>ชื่อบัญชี</Text>
                                    <Text style={[statementStyles.detailText, { fontFamily: 'Sarabun-Regular' }]}>{ACCOUNT_NAME}</Text>
                                </View>
                            )
                        }
                        <View style={statementStyles.statementDetailLine}>
                            <Text style={statementStyles.detailText}>ช่องทาง</Text>
                            <Text style={[statementStyles.detailText, { fontFamily: 'Sarabun-Regular' }]}>{BR_NO_REC_NAME}</Text>
                        </View>
                    </View>
                )
            }
        </View>

    )
}

export default StatementDetail

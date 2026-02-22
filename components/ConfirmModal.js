import React, { useState } from 'react'
import { Text, View, Modal, Pressable, TouchableOpacity } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'

const ConfirmModal = (props) => {
    const { modalVisible, title, content, color, onConfirm, onCancel } = props

    return (
        <Modal
            animationType='slide'
            transparent={true}
            visible={modalVisible}
            onRequestClose={onCancel}
        >
            <Pressable style={styles.centeredView} onPress={onCancel}>
                <View style={styles.modalView}>
                    <Text style={styles.modalText}>{title}</Text>
                    <View style={{ marginVertical: 12 }}>
                        <Text style={[styles.detailText, { fontFamily: 'Sarabun-Light', lineHeight: 26, textAlign: 'center' }]}>
                            {content}
                        </Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                        <TouchableOpacity style={[styles.button, styles.buttonCancel]} onPress={onCancel}>
                            <Text style={[styles.detailText, styles.cencelText]}>ยกเลิก</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.buttonConfrim, { backgroundColor: color, borderColor: color, }]} onPress={onConfirm}>
                            <Text style={[styles.detailText, styles.confirmText]}>ยืนยัน</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Pressable>
        </Modal>
    )
}

export default ConfirmModal

const styles = ScaledSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 8,
        padding: '15@vs',
        width: '80%',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    button: {
        borderRadius: 8,
        paddingHorizontal: '36@s',
        paddingVertical: '6@s',
        elevation: 2,
        marginHorizontal: 5,
    },
    buttonConfrim: {
        borderWidth: 0.5
    },
    buttonCancel: {
        backgroundColor: '#fff',
        borderColor: '#777',
        borderWidth: 0.5
    },
    confirmText: {
        fontFamily: 'Sarabun-Medium',
        color: '#fff'
    },
    cencelText: {
        color: '#777',
    },
    modalText: {
        fontFamily: 'Sarabun-Medium',
        color: '#333',
        fontSize: '13@s',
        padding: '3@s',
    },
    detailText: {
        fontFamily: 'Sarabun-Regular',
        color: '#333',
        fontSize: '13@s',
        padding: '3@s',
    },
})

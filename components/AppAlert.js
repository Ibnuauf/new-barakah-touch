import React from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Pressable,
} from 'react-native';

export default function AppAlert({
    visible,
    title = 'แจ้งเตือน',
    message = '',
    showConfirm = true,
    confirmText = 'ตกลง',
    confirmButtonColor = '#DD6B55',
    cancelText = 'ยกเลิก',
    showCancel = false,
    onConfirm,
    onCancel,
}) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType='fade'
            onRequestClose={onCancel} // Android back button
        >
            <Pressable style={styles.overlay}>
                <View style={styles.container}>
                    <Text style={styles.title}>{title}</Text>

                    <Text style={styles.message}>{message}</Text>

                    <View style={styles.buttonRow}>
                        {
                            showCancel && (
                                <TouchableOpacity
                                    style={[styles.button, styles.cancelButton]}
                                    onPress={onCancel}
                                >
                                    <Text style={styles.cancelText}>{cancelText}</Text>
                                </TouchableOpacity>
                            )
                        }

                        {
                            showConfirm && (
                                <TouchableOpacity
                                    style={[styles.button, { backgroundColor: confirmButtonColor }]}
                                    onPress={onConfirm}
                                >
                                    <Text style={styles.confirmText}>{confirmText}</Text>
                                </TouchableOpacity>
                            )
                        }
                    </View>
                </View>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        // width: '85%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        elevation: 5,
        margin: 20
    },
    title: {
        fontSize: 18,
        color: '#333',
        fontWeight: '600',
        marginBottom: 8,
        textAlign: 'center',
        fontFamily: 'Sarabun-SemiBold',
        paddingVertical: 2
    },
    message: {
        fontSize: 15,
        color: '#555',
        textAlign: 'center',
        marginBottom: 20,
        fontFamily: 'Sarabun-Light',
        paddingVertical: 2
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 6,
        marginLeft: 10,
    },
    cancelButton: {
        backgroundColor: '#eee',
    },
    confirmText: {
        color: '#fff',
        fontWeight: '500',
    },
    cancelText: {
        color: '#333',
    },
});

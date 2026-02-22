import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, StyleSheet, Platform } from 'react-native';
import PropTypes from 'prop-types';

export const KeycodeInput = ({
    tintColor = '#007AFF',
    textColor = '#000',
    length = 4,
    autoFocus = true,
    numeric = false,
    alphaNumeric = true,
    uppercase = true,
    defaultValue = '',
    onChange,
    onComplete,
    value,
    style,
    inputRef,
    editable = true,
}) => {
    const [inputValue, setInputValue] = useState(defaultValue);
    useEffect(() => {
        if (value !== undefined && value !== inputValue) {
            setInputValue(value);
        }
    }, [value]);

    if (value !== undefined && !onChange) {
        throw new Error(
            'To use the KeycodeInput as a controlled component, ' +
            'you need to supply both the value and onChange props.'
        );
    }

    const changeText = (value) => {
        if (uppercase) {
            value = value.toUpperCase();
        }
        if (alphaNumeric) {
            value = value.replace('/[^a-z0-9]/i', '');
        }

        setInputValue(value);

        if (onChange) {
            onChange(value);
        }

        if (value.length < length) {
            return;
        }

        if (onComplete) {
            onComplete(value);
        }
    };

    const renderBoxes = () => {
        let elements = [];
        let i = 0;
        let vals = inputValue.split('');
        while (i < length) {
            let active = i === inputValue.length;
            let barStyles = [styles.bar, active ? [styles.barActive, { backgroundColor: tintColor }] : []];

            elements.push(
                <View style={styles.box} key={i}>
                    <Text style={styles.text}>{vals[i] || ''}</Text>
                    <View style={barStyles} />
                </View>
            );

            i++;
        }

        return elements;
    };

    // let keyboardType = numeric ? 'numeric' : (Platform.OS === 'ios' ? 'ascii-capable' : 'default');
    let keyboardType = 'numeric'

    return (
        <View style={[styles.container, style]}>
            {renderBoxes()}
            <TextInput
                ref={(component) => {
                    if (inputRef) {
                        inputRef(component);
                    }
                }}
                editable={editable}
                style={[styles.input, { color: textColor, width: 42 * length }]}
                autoFocus={autoFocus}
                autoCorrect={false}
                autoCapitalize='characters'
                value={inputValue}
                blurOnSubmit={false}
                keyboardType={keyboardType}
                maxLength={length}
                disableFullscreenUI
                clearButtonMode='never'
                spellCheck={false}
                returnKeyType='go'
                underlineColorAndroid='transparent'
                onChangeText={(text) => changeText(text)}
                caretHidden />
        </View>
    );
};

KeycodeInput.propTypes = {
    length: PropTypes.number,
    tintColor: PropTypes.string,
    textColor: PropTypes.string,
    onChange: PropTypes.func,
    onComplete: PropTypes.func,
    autoFocus: PropTypes.bool,
    uppercase: PropTypes.bool,
    alphaNumeric: PropTypes.bool,
    numeric: PropTypes.bool,
    value: PropTypes.string,
    style: PropTypes.any,
    inputRef: PropTypes.func
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative'
    },
    input: {
        height: 48,
        position: 'absolute',
        opacity: 0,
        zIndex: 100
    },
    box: {
        width: 32,
        marginHorizontal: 5
    },
    bar: {
        backgroundColor: '#0047AB',
        height: 1,
        width: 32
    },
    barActive: {
        height: 2,
        marginTop: -0.5
    },
    text: {
        fontSize: 32,
        fontWeight: '600',
        lineHeight: 36,
        height: 36,
        textAlign: 'center',
        width: 32,
        marginBottom: 8,
        color: '#333'
    }
});
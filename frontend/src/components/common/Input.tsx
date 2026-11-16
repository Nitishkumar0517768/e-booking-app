import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { Colors, Radius, Typography, Spacing } from '../../constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  leftIcon,
  rightIcon,
  ...props
}) => {
  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          error ? styles.inputError : undefined,
          props.editable === false ? styles.inputDisabled : undefined,
        ]}>
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
        <TextInput
          placeholderTextColor={Colors.muted}
          style={styles.textInput}
          {...props}
        />
        {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.base,
  },
  label: {
    ...Typography.bodySm,
    fontWeight: '600',
    color: Colors.ink,
    marginBottom: Spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.hairline,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.base,
    minHeight: 48,
  },
  inputError: {
    borderColor: Colors.semanticDown,
  },
  inputDisabled: {
    backgroundColor: Colors.surfaceSoft,
    borderColor: Colors.hairlineSoft,
  },
  textInput: {
    flex: 1,
    ...Typography.bodyLg,
    color: Colors.ink,
    paddingVertical: 10,
  },
  iconLeft: {
    marginRight: Spacing.sm,
  },
  iconRight: {
    marginLeft: Spacing.sm,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.semanticDown,
    marginTop: 4,
  },
});


import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { Colors, Radius, Typography, Spacing } from '../../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const getContainerStyle = (): ViewStyle => {
    let sizeStyle: ViewStyle = { paddingVertical: 12, paddingHorizontal: 18, borderRadius: Radius.md };
    if (size === 'sm') {
      sizeStyle = { paddingVertical: 8, paddingHorizontal: 12, borderRadius: Radius.sm };
    } else if (size === 'lg') {
      sizeStyle = { paddingVertical: 14, paddingHorizontal: 24, borderRadius: Radius.pill };
    }

    let variantStyle: ViewStyle = { backgroundColor: disabled ? Colors.primaryDisabled : Colors.primary };
    if (variant === 'secondary') {
      variantStyle = { backgroundColor: Colors.surfaceStrong };
    } else if (variant === 'outline') {
      variantStyle = { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.hairline };
    } else if (variant === 'danger') {
      variantStyle = { backgroundColor: disabled ? '#fca5a5' : Colors.semanticDown };
    } else if (variant === 'ghost') {
      variantStyle = { backgroundColor: 'transparent' };
    }

    return {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      ...sizeStyle,
      ...variantStyle,
    };
  };

  const getTextStyle = (): TextStyle => {
    let fontSize = 15;
    if (size === 'sm') fontSize = 13;
    if (size === 'lg') fontSize = 16;

    let color: string = Colors.onPrimary;
    if (variant === 'outline' || variant === 'secondary' || variant === 'ghost') {
      color = Colors.ink;
    }

    return {
      fontSize,
      fontWeight: '600',
      color,
    };
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[getContainerStyle(), style]}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'danger' ? '#ffffff' : Colors.primary}
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text style={[getTextStyle(), icon ? { marginLeft: 8 } : undefined, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

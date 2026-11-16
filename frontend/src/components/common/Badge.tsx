import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Radius, Typography } from '../../constants/theme';

interface BadgeProps {
  status: string;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({ status, size = 'md', style }) => {
  const getBadgeColors = () => {
    switch (status) {
      case 'Pending':
        return { bg: '#fffbeb', text: '#b45309', border: '#fef3c7' };
      case 'Approved':
        return { bg: '#eff6ff', text: '#1d4ed8', border: '#dbeafe' };
      case 'Issued':
        return { bg: '#f5f3ff', text: '#6d28d9', border: '#ede9fe' };
      case 'Returned':
        return { bg: '#ecfdf5', text: '#047857', border: '#d1fae5' };
      case 'Overdue':
        return { bg: '#fef2f2', text: '#b91c1c', border: '#fee2e2' };
      case 'Cancelled':
        return { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0' };
      case 'Rejected':
        return { bg: '#fff1f2', text: '#be123c', border: '#ffe4e6' };
      // Operational Statuses
      case 'available':
        return { bg: '#ecfdf5', text: '#047857', border: '#d1fae5' };
      case 'maintenance':
        return { bg: '#fffbeb', text: '#b45309', border: '#fef3c7' };
      case 'inactive':
        return { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0' };
      default:
        return { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' };
    }
  };

  const colors = getBadgeColors();
  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
          paddingVertical: isSm ? 2 : 4,
          paddingHorizontal: isSm ? 8 : 10,
        },
        style,
      ]}>
      <Text
        style={[
          styles.text,
          {
            color: colors.text,
            fontSize: isSm ? 11 : 12,
          },
        ]}>
        {status.toUpperCase()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});


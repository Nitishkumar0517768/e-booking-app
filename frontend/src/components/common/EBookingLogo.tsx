import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';

interface EBookingLogoProps {
  size?: number;
  style?: ViewStyle;
}

export const EBookingLogo: React.FC<EBookingLogoProps> = ({ size = 64, style }) => {
  const iconSize = Math.round(size * 0.52);

  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: Math.round(size * 0.28) }, style]}>
      {/* Background glow & inner emblem */}
      <View style={styles.innerBadge}>
        {/* Layered book / equipment icon */}
        <Ionicons name="calendar-clear" size={iconSize} color="#ffffff" />
        <View style={styles.sparkleBadge}>
          <Ionicons name="checkmark-circle" size={Math.round(size * 0.32)} color="#22c55e" />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  innerBadge: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkleBadge: {
    position: 'absolute',
    bottom: -6,
    right: -8,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
});

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../constants/theme';

export interface ProfileAvatarProps {
  name?: string;
  onPress?: () => void;
  size?: number;
  style?: ViewStyle;
}

/**
 * Extracts first and last initials from a full name.
 * e.g. "System Administrator" -> "SA"
 * e.g. "John Doe" -> "JD"
 * e.g. "Admin" -> "AD"
 */
export const getInitials = (name?: string): string => {
  if (!name || !name.trim()) return 'U';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  const first = parts[0][0];
  const last = parts[parts.length - 1][0];
  return (first + last).toUpperCase();
};

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  name,
  onPress,
  size = 38,
  style,
}) => {
  const initials = getInitials(name);
  const fontSize = Math.round(size * 0.38);

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      disabled={!onPress}
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        style,
      ]}>
      <Text style={[styles.initialsText, { fontSize }]}>{initials}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  initialsText: {
    color: '#ffffff',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

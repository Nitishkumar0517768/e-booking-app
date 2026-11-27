import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ActivityIndicator } from 'react-native';
import { EBookingLogo } from './EBookingLogo';
import { Colors, Typography, Spacing } from '../../constants/theme';

interface AppSplashScreenProps {
  onFinish?: () => void;
  durationMs?: number;
}

export const AppSplashScreen: React.FC<AppSplashScreenProps> = ({
  onFinish,
  durationMs = 1000,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    // Smooth gentle scale animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // Trigger onFinish reliably after durationMs (1 second)
    const timer = setTimeout(() => {
      onFinish?.();
    }, durationMs);

    return () => clearTimeout(timer);
  }, [durationMs, onFinish]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { transform: [{ scale: scaleAnim }] }]}>
        <EBookingLogo size={90} variant="full" style={styles.logo} />
        <Text style={styles.appName}>e-Booking</Text>
        <Text style={styles.tagline}>College Equipment & Resource Management</Text>
        <View style={styles.institutionPill}>
          <Text style={styles.institutionText}>Campus Resource Network</Text>
        </View>
      </Animated.View>

      <View style={styles.footer}>
        <ActivityIndicator size="small" color={Colors.primary} />
        <Text style={styles.footerText}>Loading institutional catalog...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 60,
    paddingHorizontal: Spacing.xl,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    marginBottom: Spacing.base,
  },
  appName: {
    ...Typography.displayMd,
    color: Colors.ink,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  tagline: {
    ...Typography.bodyMd,
    color: Colors.body,
    marginTop: 6,
    textAlign: 'center',
  },
  institutionPill: {
    marginTop: Spacing.base,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  institutionText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footer: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  footerText: {
    ...Typography.caption,
    color: Colors.muted,
  },
});

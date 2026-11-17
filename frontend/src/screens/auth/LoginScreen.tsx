import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import { EBookingLogo } from '../../components/common/EBookingLogo';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

interface LoginScreenProps {
  onNavigateToRegister: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigateToRegister }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    Keyboard.dismiss();
    const identifier = email.trim();

    if (!identifier || !password) {
      setError('Please fill in your College Email or Student ID and password.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await login({ email: identifier, password });
    } catch (err: any) {
      setError(
        err.message || 'Login failed. Please verify your credentials and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
        style={styles.keyboardView}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            showsVerticalScrollIndicator={false}>
            
            {/* Logo / Brand Header */}
            <View style={styles.brandContainer}>
              <EBookingLogo size={68} style={styles.logoMargin} />
              <Text style={styles.appName}>e-Booking</Text>
              <Text style={styles.tagline}>
                College Equipment & Resource Management System
              </Text>
            </View>

            {/* Form Container */}
            <View style={styles.formContainer}>
              <Text style={styles.welcomeText}>Sign in to your account</Text>
              <Text style={styles.instructionText}>
                Access college lab equipment, electronics, and facilities
              </Text>

              {error && (
                <View style={styles.errorBanner}>
                  <Ionicons name="alert-circle" size={18} color={Colors.semanticDown} />
                  <Text style={styles.errorBannerText}>{error}</Text>
                </View>
              )}

              <Input
                label="College Email or Student ID"
                placeholder="e.g. CS2026-088 or student@college.edu"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  setError(null);
                }}
                autoCapitalize="none"
                autoCorrect={false}
                leftIcon={<Ionicons name="person-outline" size={20} color={Colors.muted} />}
              />

              <Input
                label="Password"
                placeholder="Enter password"
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  setError(null);
                }}
                secureTextEntry={!showPassword}
                leftIcon={<Ionicons name="lock-closed-outline" size={20} color={Colors.muted} />}
                rightIcon={
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={Colors.muted}
                    />
                  </TouchableOpacity>
                }
              />

              <Button
                title="Sign In"
                onPress={handleLogin}
                loading={loading}
                size="lg"
                style={styles.signInButton}
              />

              {/* Switch to Register */}
              <View style={styles.footerRow}>
                <Text style={styles.footerText}>New to e-Booking? </Text>
                <TouchableOpacity onPress={onNavigateToRegister}>
                  <Text style={styles.registerLink}>Create Student Account</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.canvas,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: 160,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoMargin: {
    marginBottom: Spacing.sm,
  },
  appName: {
    ...Typography.displayMd,
    color: Colors.ink,
    letterSpacing: -0.5,
  },
  tagline: {
    ...Typography.bodySm,
    color: Colors.body,
    marginTop: 4,
    textAlign: 'center',
    maxWidth: 280,
  },
  formContainer: {
    backgroundColor: Colors.surfaceCard,
  },
  welcomeText: {
    ...Typography.titleLg,
    color: Colors.ink,
    marginBottom: 4,
  },
  instructionText: {
    ...Typography.bodyMd,
    color: Colors.body,
    marginBottom: Spacing.lg,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderColor: '#fee2e2',
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.base,
    gap: 8,
  },
  errorBannerText: {
    ...Typography.bodySm,
    color: Colors.semanticDown,
    flex: 1,
  },
  signInButton: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  footerText: {
    ...Typography.bodyMd,
    color: Colors.body,
  },
  registerLink: {
    ...Typography.bodyMd,
    fontWeight: '700',
    color: Colors.primary,
  },
});

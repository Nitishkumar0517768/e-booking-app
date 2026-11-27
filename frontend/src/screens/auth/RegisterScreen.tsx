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

interface RegisterScreenProps {
  onNavigateToLogin: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onNavigateToLogin }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('');
  const [phone, setPhone] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    Keyboard.dismiss();

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedStudentId = studentId.trim();
    const trimmedDept = department.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName || !trimmedEmail || !password || !trimmedStudentId || !trimmedDept) {
      setError('Please fill in all mandatory fields (*).');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await register({
        name: trimmedName,
        email: trimmedEmail,
        password,
        studentId: trimmedStudentId,
        department: trimmedDept,
        phone: trimmedPhone || undefined,
      });
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check network connection.');
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
            
            <View style={styles.topNavRow}>
              <TouchableOpacity onPress={onNavigateToLogin} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={Colors.ink} />
              </TouchableOpacity>
              <EBookingLogo size={40} />
            </View>

            <View style={styles.header}>
              <Text style={styles.title}>Student Registration</Text>
              <Text style={styles.subtitle}>
                Create your student account to reserve equipment and campus facilities.
              </Text>
            </View>

            {error && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={18} color={Colors.semanticDown} />
                <Text style={styles.errorBannerText}>{error}</Text>
              </View>
            )}

            <Input
              label="Full Name *"
              placeholder="e.g. Alex Johnson"
              value={name}
              onChangeText={(t) => {
                setName(t);
                setError(null);
              }}
              leftIcon={<Ionicons name="person-outline" size={20} color={Colors.muted} />}
            />

            <Input
              label="College Email Address *"
              placeholder="e.g. alex.j@college.edu"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                setError(null);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon={<Ionicons name="mail-outline" size={20} color={Colors.muted} />}
            />

            <Input
              label="Student ID / Enrollment Number *"
              placeholder="e.g. CS2026-104"
              value={studentId}
              onChangeText={(t) => {
                setStudentId(t);
                setError(null);
              }}
              autoCapitalize="characters"
              leftIcon={<Ionicons name="card-outline" size={20} color={Colors.muted} />}
            />

            <Input
              label="Department / Faculty *"
              placeholder="e.g. Computer Science & Engineering"
              value={department}
              onChangeText={(t) => {
                setDepartment(t);
                setError(null);
              }}
              leftIcon={<Ionicons name="school-outline" size={20} color={Colors.muted} />}
            />

            <Input
              label="Phone Number (Optional)"
              placeholder="e.g. +1 555-0199"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              leftIcon={<Ionicons name="call-outline" size={20} color={Colors.muted} />}
            />

            <Input
              label="Password *"
              placeholder="At least 6 characters"
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

            <Input
              label="Confirm Password *"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChangeText={(t) => {
                setConfirmPassword(t);
                setError(null);
              }}
              secureTextEntry={!showConfirmPassword}
              leftIcon={<Ionicons name="checkmark-done-outline" size={20} color={Colors.muted} />}
              rightIcon={
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={Colors.muted}
                  />
                </TouchableOpacity>
              }
            />

            <Button
              title="Create Student Account"
              onPress={handleRegister}
              loading={loading}
              size="lg"
              style={styles.submitBtn}
            />

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={onNavigateToLogin}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
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
    paddingTop: Spacing.base,
    paddingBottom: 180, // Generous padding so inputs never get covered by keyboard
  },
  topNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: Spacing.sm,
    padding: 6,
  },
  header: {
    marginBottom: Spacing.base,
  },
  title: {
    ...Typography.titleLg,
    color: Colors.ink,
    marginBottom: 4,
  },
  subtitle: {
    ...Typography.bodyMd,
    color: Colors.body,
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
  submitBtn: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.base,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: Spacing.base,
  },
  footerText: {
    ...Typography.bodyMd,
    color: Colors.body,
  },
  loginLink: {
    ...Typography.bodyMd,
    fontWeight: '700',
    color: Colors.primary,
  },
});

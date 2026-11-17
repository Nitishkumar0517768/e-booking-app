import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { ProfileAvatar } from '../../components/common/ProfileAvatar';

interface ProfileScreenProps {
  onBack?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onBack }) => {
  const { user, logout, refreshUser } = useAuth();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenEdit = () => {
    setName(user?.name || '');
    setDepartment(user?.department || '');
    setPhone(user?.phone || '');
    setError(null);
    setEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      setError('Name cannot be empty.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await authService.updateProfile({
        name: name.trim(),
        department: department.trim(),
        phone: phone.trim(),
      });
      await refreshUser();
      setEditModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Confirm Sign Out', 'Are you sure you want to sign out of e-Booking?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.ink} />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Account Profile</Text>
          <Text style={styles.subtitle}>Institutional identity and settings</Text>
        </View>
        <ProfileAvatar name={user?.name || 'Student'} size={42} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Identity Card */}
        <Card style={styles.userCard}>
          <View style={styles.userHeaderRow}>
            <ProfileAvatar name={user?.name || 'Student'} size={56} />
            <View style={[styles.userMainInfo, { marginLeft: Spacing.sm }]}>
              <Text style={styles.userName}>{user?.name}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <View style={styles.roleRow}>
                <Badge status={user?.role === 'admin' ? 'admin' : 'student'} size="sm" />
                {user?.studentId && (
                  <Text style={styles.studentIdText}>ID: {user.studentId}</Text>
                )}
              </View>
            </View>
          </View>
        </Card>

        {/* Academic Details Block */}
        <Card style={styles.infoCard}>
          <Text style={styles.cardHeaderTitle}>Institutional Information</Text>
          <View style={styles.detailItem}>
            <Text style={styles.itemLabel}>Department / Faculty</Text>
            <Text style={styles.itemValue}>{user?.department || 'Not specified'}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.itemLabel}>Enrollment ID</Text>
            <Text style={styles.itemValue}>{user?.studentId || 'N/A'}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.itemLabel}>Phone Number</Text>
            <Text style={styles.itemValue}>{user?.phone || 'Not provided'}</Text>
          </View>

          <Button
            title="Edit Profile"
            onPress={handleOpenEdit}
            variant="outline"
            size="sm"
            style={styles.editBtn}
          />
        </Card>

        {/* Institutional Guidelines */}
        <Card style={styles.infoCard}>
          <Text style={styles.cardHeaderTitle}>Booking Rules & Guidelines</Text>
          <View style={styles.guidelineRow}>
            <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
            <Text style={styles.guidelineText}>
              All requests are subject to approval by resource custodians.
            </Text>
          </View>
          <View style={styles.guidelineRow}>
            <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
            <Text style={styles.guidelineText}>
              Equipment must be returned before the scheduled end time to avoid overdue penalties.
            </Text>
          </View>
          <View style={styles.guidelineRow}>
            <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
            <Text style={styles.guidelineText}>
              Cancellations are accepted prior to the scheduled start time.
            </Text>
          </View>
        </Card>

        {/* Sign Out Button */}
        <Button
          title="Sign Out"
          onPress={handleLogout}
          variant="danger"
          size="lg"
          style={styles.logoutBtn}
        />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={editModalVisible} animationType="slide" presentationStyle="formSheet">
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setEditModalVisible(false)} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={Colors.ink} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            {error && (
              <View style={styles.modalErrorBox}>
                <Ionicons name="alert-circle" size={18} color={Colors.semanticDown} />
                <Text style={styles.modalErrorText}>{error}</Text>
              </View>
            )}

            <Input
              label="Full Name *"
              value={name}
              onChangeText={setName}
              placeholder="Your full name"
            />
            <Input
              label="Department"
              value={department}
              onChangeText={setDepartment}
              placeholder="e.g. Computer Science"
            />
            <Input
              label="Phone Number"
              value={phone}
              onChangeText={setPhone}
              placeholder="Your contact number"
              keyboardType="phone-pad"
            />

            <Button
              title="Save Changes"
              onPress={handleSaveProfile}
              loading={saving}
              size="lg"
              style={{ marginTop: Spacing.base }}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.canvas,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  backBtn: {
    marginRight: Spacing.sm,
    padding: 4,
  },
  title: {
    ...Typography.titleLg,
    color: Colors.ink,
    fontWeight: '700',
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.body,
    marginTop: 2,
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: Spacing.base,
  },
  userCard: {
    backgroundColor: Colors.surfaceSoft,
    borderColor: Colors.hairline,
    marginBottom: Spacing.base,
  },
  userHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.base,
  },
  avatarInitial: {
    ...Typography.displayMd,
    color: Colors.onPrimary,
    fontWeight: '700',
  },
  userMainInfo: {
    flex: 1,
  },
  userName: {
    ...Typography.titleSm,
    fontWeight: '700',
    color: Colors.ink,
  },
  userEmail: {
    ...Typography.bodySm,
    color: Colors.body,
    marginBottom: 4,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  studentIdText: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.body,
  },
  infoCard: {
    marginBottom: Spacing.base,
  },
  cardHeaderTitle: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: Colors.muted,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  detailItem: {
    marginBottom: Spacing.sm,
  },
  itemLabel: {
    ...Typography.caption,
    color: Colors.muted,
  },
  itemValue: {
    ...Typography.bodySm,
    fontWeight: '600',
    color: Colors.ink,
    marginTop: 1,
  },
  editBtn: {
    marginTop: Spacing.xs,
    alignSelf: 'flex-start',
  },
  guidelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  guidelineText: {
    ...Typography.caption,
    color: Colors.body,
    flex: 1,
    lineHeight: 18,
  },
  logoutBtn: {
    marginTop: Spacing.sm,
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: Colors.canvas,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    height: 54,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairlineSoft,
  },
  closeBtn: {
    padding: 6,
  },
  modalTitle: {
    ...Typography.titleSm,
    fontWeight: '700',
    color: Colors.ink,
  },
  modalContent: {
    padding: Spacing.base,
  },
  modalErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: Spacing.sm,
    borderRadius: Radius.md,
    gap: 8,
    marginBottom: Spacing.base,
  },
  modalErrorText: {
    ...Typography.caption,
    color: Colors.semanticDown,
    flex: 1,
  },
});


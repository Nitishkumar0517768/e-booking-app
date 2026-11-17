import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../services/api';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ProfileAvatar } from '../../components/common/ProfileAvatar';

interface AdminProfileScreenProps {
  onBack?: () => void;
}

export const AdminProfileScreen: React.FC<AdminProfileScreenProps> = ({ onBack }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Sign out of administrator session?', [
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
          <Text style={styles.title}>Admin Profile</Text>
          <Text style={styles.subtitle}>System administration and server settings</Text>
        </View>
        <ProfileAvatar name={user?.name || 'Admin'} size={42} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Admin Card */}
        <Card style={styles.userCard}>
          <View style={styles.userRow}>
            <ProfileAvatar name={user?.name || 'Admin'} size={60} />
            <View style={styles.infoCol}>
              <Text style={styles.userName}>{user?.name}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <Badge status="Approved" size="sm" style={{ marginTop: 4 }} />
            </View>
          </View>
        </Card>

        {/* Server & DB Diagnostics */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>System Architecture</Text>
          <View style={styles.diagnosticRow}>
            <Text style={styles.diagLabel}>API Host:</Text>
            <Text style={styles.diagValue}>{API_BASE_URL}</Text>
          </View>
          <View style={styles.diagnosticRow}>
            <Text style={styles.diagLabel}>Database:</Text>
            <Text style={styles.diagValue}>MongoDB Atlas (Cluster 0)</Text>
          </View>
          <View style={styles.diagnosticRow}>
            <Text style={styles.diagLabel}>Concurrency Engine:</Text>
            <Text style={styles.diagValue}>Sweep-Line Interval Algorithm</Text>
          </View>
          <View style={styles.diagnosticRow}>
            <Text style={styles.diagLabel}>App Version:</Text>
            <Text style={styles.diagValue}>1.0.0 (Production Build)</Text>
          </View>
        </Card>

        {/* Admin Privileges Summary */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Administrative Privileges</Text>
          <Text style={styles.privilegeItem}>• Approve or reject student equipment requests</Text>
          <Text style={styles.privilegeItem}>• Issue physical devices & verify equipment returns</Text>
          <Text style={styles.privilegeItem}>• Create, update, or archive campus resources</Text>
          <Text style={styles.privilegeItem}>• Toggle operational statuses (Available / Maintenance / Inactive)</Text>
          <Text style={styles.privilegeItem}>• View real-time institutional dashboard metrics</Text>
        </Card>

        {/* Logout Button */}
        <Button
          title="Sign Out of Admin Console"
          onPress={handleLogout}
          variant="danger"
          size="lg"
          style={styles.logoutBtn}
        />
      </ScrollView>
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
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.base,
  },
  infoCol: {
    flex: 1,
    marginLeft: Spacing.base,
  },
  userName: {
    ...Typography.titleSm,
    fontWeight: '700',
    color: Colors.ink,
  },
  userEmail: {
    ...Typography.bodySm,
    color: Colors.body,
  },
  sectionCard: {
    marginBottom: Spacing.base,
  },
  sectionTitle: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: Colors.muted,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  diagnosticRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairlineSoft,
  },
  diagLabel: {
    ...Typography.caption,
    color: Colors.body,
  },
  diagValue: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.ink,
  },
  privilegeItem: {
    ...Typography.bodySm,
    color: Colors.body,
    marginBottom: 6,
    lineHeight: 18,
  },
  logoutBtn: {
    marginTop: Spacing.sm,
  },
});


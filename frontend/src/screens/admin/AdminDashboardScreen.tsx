import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { adminService, DashboardStatistics } from '../../services/adminService';
import { Booking } from '../../services/bookingService';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ProfileAvatar } from '../../components/common/ProfileAvatar';

interface AdminDashboardScreenProps {
  onNavigateToRequests: () => void;
  onNavigateToResources: () => void;
  onNavigateToHistory: () => void;
  onAddNewResource: () => void;
  onNavigateToProfile?: () => void;
}

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({
  onNavigateToRequests,
  onNavigateToResources,
  onNavigateToHistory,
  onAddNewResource,
  onNavigateToProfile,
}) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStatistics | null>(null);
  const [recentActivity, setRecentActivity] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const res = await adminService.getDashboardSummary();
      setStats(res.data.statistics);
      setRecentActivity(res.data.recentActivity || []);
    } catch (e) {
      console.warn('[Admin Dashboard Error]:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greetingText}>Admin Console</Text>
          <Text style={styles.adminNameText}>{user?.name || 'Admin'}</Text>
        </View>
        <ProfileAvatar
          name={user?.name || 'Admin'}
          onPress={onNavigateToProfile}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        
        {/* Metric Cards 2x2 Grid */}
        <Text style={styles.sectionTitle}>Overview Statistics</Text>

        {loading && !refreshing ? (
          <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: 24 }} />
        ) : (
          <View style={styles.statsGrid}>
            {/* Pending Requests Highlight */}
            <Card onPress={onNavigateToRequests} style={[styles.statCard, styles.pendingHighlight]}>
              <View style={styles.statIconRow}>
                <Ionicons name="time" size={20} color="#b45309" />
                <Text style={styles.statLabel}>Pending</Text>
              </View>
              <Text style={[styles.statValue, { color: '#b45309' }]}>
                {stats?.pendingRequests || 0}
              </Text>
              <Text style={styles.statSub}>Awaiting Decision</Text>
            </Card>

            {/* Issued Equipment */}
            <Card onPress={onNavigateToHistory} style={styles.statCard}>
              <View style={styles.statIconRow}>
                <Ionicons name="cube" size={20} color={Colors.primary} />
                <Text style={styles.statLabel}>Issued</Text>
              </View>
              <Text style={styles.statValue}>{stats?.issuedEquipment || 0}</Text>
              <Text style={styles.statSub}>Currently Out</Text>
            </Card>

            {/* Total Resources */}
            <Card onPress={onNavigateToResources} style={styles.statCard}>
              <View style={styles.statIconRow}>
                <Ionicons name="cube-outline" size={20} color={Colors.ink} />
                <Text style={styles.statLabel}>Resources</Text>
              </View>
              <Text style={styles.statValue}>{stats?.totalResources || 0}</Text>
              <Text style={styles.statSub}>
                {stats?.activeResources || 0} active in catalog
              </Text>
            </Card>

            {/* Total Bookings */}
            <Card onPress={onNavigateToHistory} style={styles.statCard}>
              <View style={styles.statIconRow}>
                <Ionicons name="calendar-outline" size={20} color={Colors.semanticUp} />
                <Text style={styles.statLabel}>Bookings</Text>
              </View>
              <Text style={styles.statValue}>{stats?.totalBookings || 0}</Text>
              <Text style={styles.statSub}>
                {stats?.approvedBookings || 0} approved
              </Text>
            </Card>
          </View>
        )}

        {/* Overdue Warning Alert if any */}
        {(stats?.overdueEquipment || 0) > 0 && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onNavigateToHistory}
            style={styles.overdueBanner}>
            <Ionicons name="warning" size={22} color={Colors.semanticDown} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.overdueTitle}>
                {stats?.overdueEquipment} Equipment Overdue!
              </Text>
              <Text style={styles.overdueSubtitle}>
                Items have passed their return deadline without being checked in.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.semanticDown} />
          </TouchableOpacity>
        )}

        {/* Quick Management Actions */}
        {/* <Text style={styles.sectionTitle}>Quick Management Actions</Text> */}
        {/* <View style={styles.actionButtonsCol}>
          <Button
            title="Review Pending Requests"
            onPress={onNavigateToRequests}
            variant="primary"
            size="md"
            icon={<Ionicons name="clipboard-outline" size={18} color="#ffffff" />}
          />
          <View style={{ height: 8 }} />
          <Button
            title="Manage Resource Inventory"
            onPress={onNavigateToResources}
            variant="secondary"
            size="md"
            icon={<Ionicons name="library-outline" size={18} color={Colors.ink} />}
          />
        </View> */}

        {/* Recent Activity Feed */}
        <View style={styles.recentSectionHeader}>
          <Text style={styles.sectionTitle}>Recent Booking Activity</Text>
          <TouchableOpacity onPress={onNavigateToHistory}>
            <Text style={styles.viewAllText}>View History</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.activityList}>
          {recentActivity.length === 0 ? (
            <Text style={styles.noActivityText}>No recent booking activity recorded.</Text>
          ) : (
            recentActivity.map((b) => (
              <Card key={b._id} onPress={onNavigateToHistory} style={styles.activityCard}>
                <View style={styles.activityHeader}>
                  <Text style={styles.activityCode}>{b.bookingCode}</Text>
                  <Badge status={b.status} size="sm" />
                </View>
                <Text style={styles.activityResource}>{b.resourceId?.name || 'Resource'}</Text>
                <View style={styles.activityFooter}>
                  <Text style={styles.activityStudent}>
                    Student: {b.userId?.name} ({b.userId?.studentId || 'N/A'})
                  </Text>
                  <Text style={styles.activityDate}>
                    {new Date(b.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.canvas,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greetingText: {
    ...Typography.caption,
    color: Colors.body,
    textTransform: 'uppercase',
  },
  adminNameText: {
    ...Typography.titleLg,
    fontWeight: '700',
    color: Colors.ink,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.base,
  },
  sectionTitle: {
    ...Typography.titleMd,
    fontWeight: '700',
    color: Colors.ink,
    marginTop: Spacing.base,
    marginBottom: Spacing.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  statCard: {
    width: '48%' as any,
    marginBottom: 0,
    padding: Spacing.sm,
  },
  pendingHighlight: {
    backgroundColor: '#fffbeb',
    borderColor: '#fef3c7',
  },
  statIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.body,
    fontWeight: '600',
  },
  statValue: {
    ...Typography.displayMd,
    fontWeight: '700',
    color: Colors.ink,
  },
  statSub: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.muted,
    marginTop: 2,
  },
  overdueBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fee2e2',
    borderRadius: Radius.md,
    padding: Spacing.base,
    marginTop: Spacing.base,
  },
  overdueTitle: {
    ...Typography.bodySm,
    fontWeight: '700',
    color: Colors.semanticDown,
  },
  overdueSubtitle: {
    ...Typography.caption,
    color: Colors.body,
    marginTop: 2,
  },
  actionButtonsCol: {
    marginTop: Spacing.xs,
  },
  recentSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  viewAllText: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.primary,
  },
  activityList: {
    gap: Spacing.xs,
  },
  noActivityText: {
    ...Typography.bodySm,
    color: Colors.muted,
    textAlign: 'center',
    marginVertical: Spacing.base,
  },
  activityCard: {
    marginBottom: Spacing.xs,
    padding: Spacing.sm,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  activityCode: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.ink,
  },
  activityResource: {
    ...Typography.bodySm,
    fontWeight: '600',
    color: Colors.ink,
    marginBottom: 4,
  },
  activityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityStudent: {
    ...Typography.caption,
    color: Colors.body,
  },
  activityDate: {
    ...Typography.caption,
    color: Colors.muted,
    fontSize: 11,
  },
});

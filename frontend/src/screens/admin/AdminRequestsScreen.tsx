import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { bookingService, Booking } from '../../services/bookingService';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { EmptyState } from '../../components/common/EmptyState';
import { ProfileAvatar } from '../../components/common/ProfileAvatar';
import { useAuth } from '../../context/AuthContext';

interface AdminRequestsScreenProps {
  onNavigateToProfile?: () => void;
}

export const AdminRequestsScreen: React.FC<AdminRequestsScreenProps> = ({
  onNavigateToProfile,
}) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Reject Modal State
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejecting, setRejecting] = useState(false);
  const [rejectError, setRejectError] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await bookingService.getAllBookings({ status: 'Pending' });
      setRequests(res.data.bookings || []);
    } catch (e) {
      console.warn('[Admin Requests Error]:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };

  const handleApprove = (booking: Booking) => {
    Alert.alert(
      'Approve Request',
      `Approve booking ${booking.bookingCode} for ${booking.userId?.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            try {
              await bookingService.decisionBooking(booking._id, {
                action: 'approve',
                remarks: 'Approved by administrator',
              });
              fetchRequests();
            } catch (err: any) {
              Alert.alert('Approval Error', err.message);
            }
          },
        },
      ]
    );
  };

  const handleOpenReject = (booking: Booking) => {
    setSelectedBooking(booking);
    setRejectionReason('');
    setRejectError(null);
    setRejectModalVisible(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectionReason.trim()) {
      setRejectError('A rejection reason is strictly required.');
      return;
    }

    if (!selectedBooking) return;

    setRejecting(true);
    setRejectError(null);
    try {
      await bookingService.decisionBooking(selectedBooking._id, {
        action: 'reject',
        rejectionReason: rejectionReason.trim(),
      });
      setRejectModalVisible(false);
      fetchRequests();
    } catch (err: any) {
      setRejectError(err.message || 'Failed to reject booking request.');
    } finally {
      setRejecting(false);
    }
  };

  const renderItem = ({ item }: { item: Booking }) => (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.code}>{item.bookingCode}</Text>
          <Text style={styles.timeAgo}>
            Submitted {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <Badge status="Pending" size="sm" />
      </View>

      <Text style={styles.resourceName}>{item.resourceId?.name}</Text>

      {/* Student info box */}
      <View style={styles.studentInfoBox}>
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={15} color={Colors.body} />
          <Text style={styles.infoText}>
            <Text style={{ fontWeight: '700', color: Colors.ink }}>{item.userId?.name}</Text> •{' '}
            {item.userId?.studentId} ({item.userId?.department})
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={15} color={Colors.body} />
          <Text style={styles.infoText}>
            {new Date(item.startAt).toLocaleDateString()} •{' '}
            {new Date(item.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
            {new Date(item.endAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="cube-outline" size={15} color={Colors.body} />
          <Text style={styles.infoText}>Quantity Requested: {item.quantity} units</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="information-circle-outline" size={15} color={Colors.body} />
          <Text style={styles.infoText}>Purpose: {item.purpose}</Text>
        </View>
      </View>

      {/* Approve & Reject Actions */}
      <View style={styles.actionRow}>
        <Button
          title="Reject"
          onPress={() => handleOpenReject(item)}
          variant="outline"
          size="sm"
          textStyle={{ color: Colors.semanticDown }}
          style={styles.actionBtn}
        />
        <Button
          title="Approve Request"
          onPress={() => handleApprove(item)}
          variant="primary"
          size="sm"
          style={styles.actionBtn}
        />
      </View>
    </Card>
  );

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.header}>
        <View style={{ flex: 1, marginRight: Spacing.sm }}>
          <Text style={styles.title}>Pending Requests</Text>
          {/* <Text style={styles.subtitle}>
            {requests.length} student booking request(s) awaiting approval
          </Text> */}
        </View>
        <ProfileAvatar
          name={user?.name || 'Admin'}
          onPress={onNavigateToProfile}
        />
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <EmptyState
              icon="checkmark-done-circle-outline"
              title="All caught up!"
              description="There are no pending booking requests right now. New requests will appear here immediately."
            />
          }
        />
      )}

      {/* Mandatory Rejection Reason Modal */}
      <Modal visible={rejectModalVisible} animationType="slide" presentationStyle="formSheet">
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setRejectModalVisible(false)} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={Colors.ink} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Reject Request</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.modalSubtitle}>
              Please provide a clear rejection reason for {selectedBooking?.userId?.name}. This will be delivered to the student in their notifications.
            </Text>

            {rejectError && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color={Colors.semanticDown} />
                <Text style={styles.errorBoxText}>{rejectError}</Text>
              </View>
            )}

            <Input
              label="Rejection Reason *"
              placeholder="e.g. Laboratory is scheduled for faculty maintenance during this time slot."
              value={rejectionReason}
              onChangeText={(t) => {
                setRejectionReason(t);
                setRejectError(null);
              }}
              multiline
              numberOfLines={4}
            />

            <Button
              title="Confirm Rejection"
              onPress={handleConfirmReject}
              loading={rejecting}
              variant="danger"
              size="lg"
              style={{ marginTop: Spacing.base }}
            />
          </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    paddingBottom: Spacing.base,
  },
  card: {
    marginBottom: Spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  code: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.ink,
  },
  timeAgo: {
    ...Typography.caption,
    color: Colors.muted,
    fontSize: 11,
  },
  resourceName: {
    ...Typography.titleSm,
    color: Colors.ink,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  studentInfoBox: {
    backgroundColor: Colors.surfaceSoft,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    gap: 4,
    marginVertical: Spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    ...Typography.caption,
    color: Colors.body,
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  actionBtn: {
    flex: 1,
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
  modalSubtitle: {
    ...Typography.bodyMd,
    color: Colors.body,
    marginBottom: Spacing.base,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: Spacing.sm,
    borderRadius: Radius.md,
    gap: 8,
    marginBottom: Spacing.base,
  },
  errorBoxText: {
    ...Typography.caption,
    color: Colors.semanticDown,
    flex: 1,
  },
});


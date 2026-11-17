import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Booking, bookingService } from '../../services/bookingService';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';

interface BookingDetailModalProps {
  visible: boolean;
  booking: Booking | null;
  onClose: () => void;
  onBookingCancelled?: () => void;
}

export const BookingDetailModal: React.FC<BookingDetailModalProps> = ({
  visible,
  booking,
  onClose,
  onBookingCancelled,
}) => {
  if (!booking) return null;

  const isCancellable =
    ['Pending', 'Approved'].includes(booking.status) && new Date() < new Date(booking.startAt);

  const handleCancel = () => {
    Alert.alert(
      'Cancel Booking',
      `Are you sure you want to cancel booking ${booking.bookingCode}?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await bookingService.cancelBooking(booking._id);
              if (onBookingCancelled) onBookingCancelled();
              onClose();
            } catch (err: any) {
              Alert.alert('Cancellation Error', err.message);
            }
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={Colors.ink} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Booking Details</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Digital Access Pass Header */}
          <Card style={styles.passCard}>
            <View style={styles.passHeader}>
              <View>
                <Text style={styles.passLabel}>CAMPUS PASS CODE</Text>
                <Text style={styles.passCode}>{booking.bookingCode}</Text>
              </View>
              <Badge status={booking.isOverdue ? 'Overdue' : booking.status} />
            </View>

            <View style={styles.qrSimulation}>
              <Ionicons name="qr-code-outline" size={72} color={Colors.ink} />
              <Text style={styles.qrHint}>
                {booking.status === 'Issued'
                  ? 'Present this code at desk to verify return'
                  : 'Present code at equipment counter'}
              </Text>
            </View>
          </Card>

          {/* Student Return Guidance (When Equipment is in Possession) */}
          {booking.status === 'Issued' && (
            <Card style={styles.returnInstructionCard}>
              <View style={styles.returnCardHeader}>
                <Ionicons name="swap-horizontal" size={20} color={Colors.primary} />
                <Text style={styles.returnCardTitle}>How to Return this Item</Text>
              </View>
              <Text style={styles.returnStep}>
                1. Gather the item and all included accessories/cables.
              </Text>
              <Text style={styles.returnStep}>
                2. Return to: <Text style={{ fontWeight: '700', color: Colors.ink }}>{booking.resourceId?.location || 'Campus Resource Desk'}</Text>.
              </Text>
              <Text style={styles.returnStep}>
                3. Show your booking code <Text style={{ fontWeight: '700', color: Colors.primary }}>{booking.bookingCode}</Text> or the QR pass above.
              </Text>
              <Text style={styles.returnStep}>
                4. Administrator verifies condition and completes check-in. The item quantity is automatically restored.
              </Text>
              {booking.isOverdue && (
                <View style={styles.overdueAlertBox}>
                  <Ionicons name="warning-outline" size={16} color={Colors.semanticDown} />
                  <Text style={styles.overdueAlertText}>
                    This booking is overdue! Please return immediately to the counter.
                  </Text>
                </View>
              )}
            </Card>
          )}

          {/* Completed Return Card */}
          {booking.status === 'Returned' && (
            <Card style={styles.returnedCard}>
              <View style={styles.returnCardHeader}>
                <Ionicons name="checkmark-done-circle" size={22} color={Colors.semanticUp} />
                <Text style={styles.returnedCardTitle}>Equipment Returned & Verified</Text>
              </View>
              <Text style={styles.returnedDesc}>
                This item has been checked back in by administrator and inventory restored.
              </Text>
              {booking.returnedAt && (
                <Text style={styles.returnedDate}>
                  Returned on: {new Date(booking.returnedAt).toLocaleString()}
                </Text>
              )}
              {booking.adminRemarks ? (
                <View style={styles.adminRemarksBadge}>
                  <Text style={styles.adminRemarksTitle}>Admin Verification Notes:</Text>
                  <Text style={styles.adminRemarksText}>{booking.adminRemarks}</Text>
                </View>
              ) : null}
            </Card>
          )}

          {/* Resource Summary */}
          <Card style={styles.sectionCard}>
            <Text style={styles.cardHeaderTitle}>Reserved Item</Text>
            <Text style={styles.resourceTitle}>{booking.resourceId?.name}</Text>
            <Text style={styles.resourceMeta}>
              Category: {booking.resourceId?.category} • Location: {booking.resourceId?.location}
            </Text>
            <View style={styles.quantityBadge}>
              <Text style={styles.quantityText}>Reserved Quantity: {booking.quantity} units</Text>
            </View>
          </Card>

          {/* Time & Schedule */}
          <Card style={styles.sectionCard}>
            <Text style={styles.cardHeaderTitle}>Schedule & Duration</Text>
            <View style={styles.timelineRow}>
              <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
              <View>
                <Text style={styles.timelineLabel}>Date</Text>
                <Text style={styles.timelineValue}>
                  {new Date(booking.startAt).toLocaleDateString(undefined, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </View>
            </View>
            <View style={[styles.timelineRow, { marginTop: Spacing.sm }]}>
              <Ionicons name="time-outline" size={20} color={Colors.primary} />
              <View>
                <Text style={styles.timelineLabel}>Time Window</Text>
                <Text style={styles.timelineValue}>
                  {new Date(booking.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{' '}
                  –{' '}
                  {new Date(booking.endAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
          </Card>

          {/* Purpose & Remarks */}
          <Card style={styles.sectionCard}>
            <Text style={styles.cardHeaderTitle}>Academic Purpose</Text>
            <Text style={styles.purposeText}>{booking.purpose}</Text>

            {booking.adminRemarks && booking.status !== 'Returned' ? (
              <View style={styles.remarksBox}>
                <Text style={styles.remarksLabel}>Administrator Remarks:</Text>
                <Text style={styles.remarksValue}>{booking.adminRemarks}</Text>
              </View>
            ) : null}

            {booking.rejectionReason ? (
              <View style={styles.rejectionBox}>
                <Text style={styles.rejectionLabel}>Rejection Reason:</Text>
                <Text style={styles.rejectionValue}>{booking.rejectionReason}</Text>
              </View>
            ) : null}
          </Card>

          {/* Custody Tracking */}
          {(booking.issuedAt || booking.returnedAt) && (
            <Card style={styles.sectionCard}>
              <Text style={styles.cardHeaderTitle}>Custody Tracking</Text>
              {booking.issuedAt && (
                <Text style={styles.trackingText}>
                  • Issued on: {new Date(booking.issuedAt).toLocaleString()}
                </Text>
              )}
              {booking.returnedAt && (
                <Text style={styles.trackingText}>
                  • Returned on: {new Date(booking.returnedAt).toLocaleString()}
                </Text>
              )}
            </Card>
          )}

          {isCancellable && (
            <Button
              title="Cancel Booking Request"
              onPress={handleCancel}
              variant="outline"
              size="lg"
              textStyle={{ color: Colors.semanticDown }}
              style={styles.cancelButton}
            />
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
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
    height: 54,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairlineSoft,
  },
  closeBtn: {
    padding: 6,
  },
  headerTitle: {
    ...Typography.titleSm,
    color: Colors.ink,
    fontWeight: '700',
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: Spacing.xxl,
  },
  passCard: {
    backgroundColor: Colors.surfaceSoft,
    borderColor: Colors.hairline,
  },
  passHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.base,
  },
  passLabel: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: Colors.muted,
  },
  passCode: {
    ...Typography.displayMd,
    fontWeight: '700',
    color: Colors.ink,
    letterSpacing: 1,
  },
  qrSimulation: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radius.md,
    paddingVertical: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.hairlineSoft,
  },
  qrHint: {
    ...Typography.caption,
    color: Colors.body,
    marginTop: Spacing.xs,
  },
  returnInstructionCard: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
    marginBottom: Spacing.base,
  },
  returnCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  returnCardTitle: {
    ...Typography.titleSm,
    fontWeight: '700',
    color: Colors.primary,
  },
  returnStep: {
    ...Typography.bodySm,
    color: Colors.ink,
    marginBottom: 6,
    lineHeight: 18,
  },
  overdueAlertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    padding: Spacing.sm,
    borderRadius: Radius.xs,
    marginTop: Spacing.xs,
    gap: 6,
  },
  overdueAlertText: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.semanticDown,
    flex: 1,
  },
  returnedCard: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
    marginBottom: Spacing.base,
  },
  returnedCardTitle: {
    ...Typography.titleSm,
    fontWeight: '700',
    color: Colors.semanticUp,
  },
  returnedDesc: {
    ...Typography.bodySm,
    color: Colors.ink,
    marginBottom: 4,
  },
  returnedDate: {
    ...Typography.caption,
    color: Colors.muted,
  },
  adminRemarksBadge: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.surfaceCard,
    padding: Spacing.sm,
    borderRadius: Radius.xs,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  adminRemarksTitle: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.semanticUp,
  },
  adminRemarksText: {
    ...Typography.caption,
    color: Colors.ink,
    marginTop: 2,
  },
  sectionCard: {
    marginBottom: Spacing.base,
  },
  cardHeaderTitle: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: Colors.muted,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  resourceTitle: {
    ...Typography.titleMd,
    color: Colors.ink,
  },
  resourceMeta: {
    ...Typography.caption,
    color: Colors.body,
    marginTop: 2,
    marginBottom: Spacing.sm,
  },
  quantityBadge: {
    backgroundColor: '#eff6ff',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.xs,
  },
  quantityText: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.primary,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  timelineLabel: {
    ...Typography.caption,
    color: Colors.muted,
  },
  timelineValue: {
    ...Typography.bodySm,
    fontWeight: '600',
    color: Colors.ink,
  },
  purposeText: {
    ...Typography.bodyMd,
    color: Colors.ink,
    lineHeight: 20,
  },
  remarksBox: {
    marginTop: Spacing.sm,
    backgroundColor: '#eff6ff',
    padding: Spacing.sm,
    borderRadius: Radius.sm,
  },
  remarksLabel: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.primary,
  },
  remarksValue: {
    ...Typography.caption,
    color: Colors.ink,
    marginTop: 2,
  },
  rejectionBox: {
    marginTop: Spacing.sm,
    backgroundColor: '#fff1f2',
    padding: Spacing.sm,
    borderRadius: Radius.sm,
  },
  rejectionLabel: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.semanticDown,
  },
  rejectionValue: {
    ...Typography.caption,
    color: Colors.semanticDown,
    marginTop: 2,
  },
  trackingText: {
    ...Typography.caption,
    color: Colors.body,
    marginBottom: 4,
  },
  cancelButton: {
    marginTop: Spacing.base,
    borderColor: '#fca5a5',
  },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { bookingService, Booking } from '../../services/bookingService';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { ProfileAvatar } from '../../components/common/ProfileAvatar';
import { useAuth } from '../../context/AuthContext';

const STATUS_FILTERS = ['All', 'Approved', 'Issued', 'Returned', 'Pending', 'Cancelled', 'Overdue'];
const CONDITIONS = ['Good', 'Fair', 'Damaged', 'Missing Parts'];

interface AdminHistoryScreenProps {
  onNavigateToProfile?: () => void;
}

export const AdminHistoryScreen: React.FC<AdminHistoryScreenProps> = ({
  onNavigateToProfile,
}) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Return Verification Modal State
  const [returnModalVisible, setReturnModalVisible] = useState(false);
  const [selectedBookingForReturn, setSelectedBookingForReturn] = useState<Booking | null>(null);
  const [returnCondition, setReturnCondition] = useState<string>('Good');
  const [returnRemarks, setReturnRemarks] = useState<string>('');
  const [processingReturn, setProcessingReturn] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, [selectedStatus, search]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await bookingService.getAllBookings({
        status: selectedStatus === 'All' ? undefined : selectedStatus,
        search: search.trim() || undefined,
      });
      setBookings(res.data.bookings || []);
    } catch (e) {
      console.warn('[Admin History Error]:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const handleIssueEquipment = (booking: Booking) => {
    Alert.alert(
      'Issue Equipment',
      `Hand over "${booking.resourceId?.name}" (${booking.quantity} units) to ${booking.userId?.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Issue',
          onPress: async () => {
            try {
              await bookingService.issueEquipment(booking._id, {
                remarks: 'Verified and handed over in good condition',
              });
              fetchHistory();
            } catch (err: any) {
              Alert.alert('Issue Error', err.message);
            }
          },
        },
      ]
    );
  };

  const openReturnModal = (booking: Booking) => {
    setSelectedBookingForReturn(booking);
    setReturnCondition('Good');
    setReturnRemarks('');
    setReturnModalVisible(true);
  };

  const handleConfirmReturn = async () => {
    if (!selectedBookingForReturn) return;
    try {
      setProcessingReturn(true);
      await bookingService.returnEquipment(selectedBookingForReturn._id, {
        condition: returnCondition,
        remarks: returnRemarks.trim() || `Item inspected: ${returnCondition} condition`,
      });
      setReturnModalVisible(false);
      setSelectedBookingForReturn(null);
      Alert.alert(
        'Return Verified',
        `Equipment for ${selectedBookingForReturn.bookingCode} checked in successfully. Available units restored!`
      );
      fetchHistory();
    } catch (err: any) {
      Alert.alert('Return Verification Failed', err.message || 'Unable to complete check-in.');
    } finally {
      setProcessingReturn(false);
    }
  };

  const renderItem = ({ item }: { item: Booking }) => {
    const canIssue = item.status === 'Approved' && item.resourceId?.requiresIssueReturn;
    const canReturn = item.status === 'Issued';

    return (
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.code}>{item.bookingCode}</Text>
            <Text style={styles.studentName}>
              Student: {item.userId?.name} ({item.userId?.studentId || item.userId?.email})
            </Text>
          </View>
          <Badge status={item.isOverdue ? 'Overdue' : item.status} size="sm" />
        </View>

        <Text style={styles.resourceName}>{item.resourceId?.name}</Text>

        <View style={styles.detailsBox}>
          <Text style={styles.detailText}>
            • Schedule: {new Date(item.startAt).toLocaleDateString()} (
            {new Date(item.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} –{' '}
            {new Date(item.endAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
          </Text>
          <Text style={styles.detailText}>• Quantity: {item.quantity} units</Text>
          <Text style={styles.detailText}>• Purpose: {item.purpose}</Text>
          {item.issuedAt && (
            <Text style={[styles.detailText, { color: Colors.primary }]}>
              • Handed out on: {new Date(item.issuedAt).toLocaleString()}
            </Text>
          )}
          {item.returnedAt && (
            <Text style={[styles.detailText, { color: Colors.semanticUp }]}>
              • Returned on: {new Date(item.returnedAt).toLocaleString()}
            </Text>
          )}
          {item.adminRemarks && (
            <Text style={[styles.detailText, { fontStyle: 'italic', color: Colors.ink }]}>
              • Admin Note: {item.adminRemarks}
            </Text>
          )}
        </View>

        {/* Action Buttons for Equipment Handout & Check-in */}
        {canIssue && (
          <Button
            title="Issue Equipment to Student"
            onPress={() => handleIssueEquipment(item)}
            variant="primary"
            size="sm"
            style={{ marginTop: Spacing.sm }}
          />
        )}
        {canReturn && (
          <Button
            title="Verify & Check-In Return"
            onPress={() => openReturnModal(item)}
            variant="secondary"
            size="sm"
            style={{ marginTop: Spacing.sm }}
          />
        )}
      </Card>
    );
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.header}>
        <View style={{ flex: 1, marginRight: Spacing.sm }}>
          <Text style={styles.title}>Booking Operations & History</Text>
          <Text style={styles.subtitle}>Track reservations, issue equipment, and verify returns</Text>
        </View>
        <ProfileAvatar
          name={user?.name || 'Admin'}
          onPress={onNavigateToProfile}
        />
      </View>

      {/* Search Input */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={Colors.muted} />
        <TextInput
          placeholder="Search by code (e.g. EB-2026)..."
          placeholderTextColor={Colors.muted}
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={Colors.muted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={STATUS_FILTERS}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.tabsList}
          renderItem={({ item }) => {
            const isSelected = selectedStatus === item;
            return (
              <TouchableOpacity
                onPress={() => setSelectedStatus(item)}
                style={[styles.tab, isSelected ? styles.tabSelected : undefined]}>
                <Text style={[styles.tabText, isSelected ? styles.tabTextSelected : undefined]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* History List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <EmptyState
              icon="calendar-outline"
              title="No Booking Records"
              description="No bookings found matching current filter."
            />
          }
        />
      )}

      {/* Return & Inspection Check-in Modal */}
      <Modal visible={returnModalVisible} animationType="slide" presentationStyle="formSheet">
        <SafeAreaView style={styles.modalArea}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setReturnModalVisible(false)}>
              <Ionicons name="close" size={24} color={Colors.ink} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Equipment Check-In & Verification</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            {selectedBookingForReturn && (
              <>
                <View style={styles.modalItemHeader}>
                  <Text style={styles.modalCode}>{selectedBookingForReturn.bookingCode}</Text>
                  <Text style={styles.modalResourceName}>
                    {selectedBookingForReturn.resourceId?.name}
                  </Text>
                  <Text style={styles.modalStudentInfo}>
                    Returned by: {selectedBookingForReturn.userId?.name} ({selectedBookingForReturn.userId?.studentId || selectedBookingForReturn.userId?.email})
                  </Text>
                  <Text style={styles.modalStudentInfo}>
                    Quantity: {selectedBookingForReturn.quantity} units
                  </Text>
                </View>

                {/* Condition Inspection */}
                <Text style={styles.sectionHeader}>Physical Inspection Condition:</Text>
                <View style={styles.conditionRow}>
                  {CONDITIONS.map((cond) => {
                    const isSelected = returnCondition === cond;
                    return (
                      <TouchableOpacity
                        key={cond}
                        onPress={() => setReturnCondition(cond)}
                        style={[
                          styles.conditionChip,
                          isSelected ? styles.conditionChipActive : undefined,
                        ]}>
                        <Text
                          style={[
                            styles.conditionText,
                            isSelected ? styles.conditionTextActive : undefined,
                          ]}>
                          {cond}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Inspection remarks */}
                <Text style={[styles.sectionHeader, { marginTop: Spacing.base }]}>
                  Inspection / Staff Remarks (Optional):
                </Text>
                <TextInput
                  placeholder="e.g. Returned with all cables and accessories in good order"
                  placeholderTextColor={Colors.muted}
                  value={returnRemarks}
                  onChangeText={setReturnRemarks}
                  multiline
                  style={styles.remarksInput}
                />

                <View style={styles.autoRestockNotice}>
                  <Ionicons name="information-circle-outline" size={18} color={Colors.primary} />
                  <Text style={styles.autoRestockText}>
                    Restocking: {selectedBookingForReturn.quantity} unit(s) will be automatically returned to live catalog inventory.
                  </Text>
                </View>

                <Button
                  title="Verify & Complete Check-In"
                  onPress={handleConfirmReturn}
                  loading={processingReturn}
                  variant="primary"
                  size="lg"
                  style={{ marginTop: Spacing.lg }}
                />
              </>
            )}
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
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  title: {
    ...Typography.titleLg,
    color: Colors.ink,
  },
  subtitle: {
    ...Typography.bodySm,
    color: Colors.body,
    marginTop: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSoft,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    height: 40,
    marginHorizontal: Spacing.base,
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    ...Typography.bodyMd,
    color: Colors.ink,
    paddingVertical: 0,
  },
  tabsContainer: {
    marginVertical: Spacing.sm,
  },
  tabsList: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.xs,
  },
  tab: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surfaceSoft,
    borderWidth: 1,
    borderColor: Colors.hairlineSoft,
  },
  tabSelected: {
    backgroundColor: Colors.ink,
    borderColor: Colors.ink,
  },
  tabText: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.body,
  },
  tabTextSelected: {
    color: Colors.canvas,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.base,
  },
  card: {
    marginBottom: Spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  code: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.ink,
  },
  studentName: {
    ...Typography.caption,
    color: Colors.muted,
  },
  resourceName: {
    ...Typography.titleSm,
    fontWeight: '700',
    color: Colors.ink,
    marginBottom: Spacing.xs,
  },
  detailsBox: {
    backgroundColor: Colors.surfaceSoft,
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    gap: 3,
  },
  detailText: {
    ...Typography.caption,
    color: Colors.body,
  },
  modalArea: {
    flex: 1,
    backgroundColor: Colors.canvas,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    height: 54,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairlineSoft,
  },
  modalTitle: {
    ...Typography.titleSm,
    fontWeight: '700',
    color: Colors.ink,
  },
  modalContent: {
    padding: Spacing.base,
  },
  modalItemHeader: {
    backgroundColor: Colors.surfaceSoft,
    padding: Spacing.base,
    borderRadius: Radius.md,
    marginBottom: Spacing.base,
  },
  modalCode: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '700',
  },
  modalResourceName: {
    ...Typography.titleMd,
    fontWeight: '700',
    color: Colors.ink,
    marginTop: 2,
    marginBottom: 4,
  },
  modalStudentInfo: {
    ...Typography.caption,
    color: Colors.body,
  },
  sectionHeader: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.muted,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  conditionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  conditionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surfaceSoft,
    borderWidth: 1,
    borderColor: Colors.hairlineSoft,
  },
  conditionChipActive: {
    backgroundColor: '#eff6ff',
    borderColor: Colors.primary,
  },
  conditionText: {
    ...Typography.bodySm,
    color: Colors.body,
  },
  conditionTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  remarksInput: {
    backgroundColor: Colors.surfaceSoft,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.hairlineSoft,
    ...Typography.bodySm,
    color: Colors.ink,
    height: 80,
    textAlignVertical: 'top',
  },
  autoRestockNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    marginTop: Spacing.base,
    gap: 8,
  },
  autoRestockText: {
    ...Typography.caption,
    color: Colors.primary,
    flex: 1,
    lineHeight: 16,
  },
});

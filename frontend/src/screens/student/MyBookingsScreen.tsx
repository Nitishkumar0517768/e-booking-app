import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
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
import { EmptyState } from '../../components/common/EmptyState';
import { ProfileAvatar } from '../../components/common/ProfileAvatar';
import { useAuth } from '../../context/AuthContext';

const STATUS_TABS = ['All', 'Pending', 'Approved', 'Issued', 'Returned', 'Cancelled', 'Overdue'];

interface MyBookingsScreenProps {
  onSelectBooking: (booking: Booking) => void;
  onNavigateToExplore: () => void;
  onNavigateToProfile?: () => void;
}

export const MyBookingsScreen: React.FC<MyBookingsScreenProps> = ({
  onSelectBooking,
  onNavigateToExplore,
  onNavigateToProfile,
}) => {
  const { user } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    fetchBookings();
  }, [selectedStatus]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await bookingService.getMyBookings({
        status: selectedStatus === 'All' ? undefined : selectedStatus,
      });
      setBookings(res.data.bookings || []);
    } catch (e) {
      console.warn('[Fetch My Bookings Error]:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const handleCancelBooking = (booking: Booking) => {
    Alert.alert(
      'Cancel Booking',
      `Are you sure you want to cancel booking ${booking.bookingCode}? This action cannot be undone.`,
      [
        { text: 'Keep Booking', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await bookingService.cancelBooking(booking._id);
              fetchBookings();
            } catch (err: any) {
              Alert.alert('Cancellation Failed', err.message || 'Unable to cancel booking.');
            }
          },
        },
      ]
    );
  };

  const renderBookingCard = ({ item }: { item: Booking }) => {
    const isCancellable =
      ['Pending', 'Approved'].includes(item.status) && new Date() < new Date(item.startAt);

    return (
      <Card onPress={() => onSelectBooking(item)} style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.bookingCode}>{item.bookingCode}</Text>
            <Text style={styles.timestamp}>
              Requested on {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <Badge status={item.isOverdue ? 'Overdue' : item.status} />
        </View>

        <Text style={styles.resourceName} numberOfLines={1}>
          {item.resourceId?.name || 'Resource'}
        </Text>

        <View style={styles.detailsBlock}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color={Colors.body} />
            <Text style={styles.detailText}>
              {new Date(item.startAt).toLocaleDateString()} •{' '}
              {new Date(item.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
              {new Date(item.endAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="cube-outline" size={16} color={Colors.body} />
            <Text style={styles.detailText}>
              Quantity: <Text style={{ fontWeight: '700', color: Colors.ink }}>{item.quantity} units</Text>
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="chatbox-ellipses-outline" size={16} color={Colors.body} />
            <Text style={styles.detailText} numberOfLines={1}>
              Purpose: {item.purpose}
            </Text>
          </View>
        </View>

        {item.status === 'Issued' && (
          <View style={styles.cardFooter}>
            <Button
              title="Return Pass & Instructions"
              onPress={() => onSelectBooking(item)}
              variant="secondary"
              size="sm"
            />
          </View>
        )}

        {isCancellable && (
          <View style={styles.cardFooter}>
            <Button
              title="Cancel Booking"
              onPress={() => handleCancelBooking(item)}
              variant="outline"
              size="sm"
              textStyle={{ color: Colors.semanticDown }}
              style={styles.cancelBtn}
            />
          </View>
        )}
      </Card>
    );
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.header}>
        <View style={{ flex: 1, marginRight: Spacing.sm }}>
          <Text style={styles.title}>My Bookings</Text>
          {/* <Text style={styles.subtitle}>Track your reservation requests and equipment status</Text> */}
        </View>
        <ProfileAvatar
          name={user?.name || 'Student'}
          onPress={onNavigateToProfile}
        />
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={STATUS_TABS}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.tabsList}
          renderItem={({ item }) => {
            const isSelected = selectedStatus === item;
            return (
              <TouchableOpacity
                activeOpacity={0.7}
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

      {/* Bookings List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          renderItem={renderBookingCard}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <EmptyState
              icon="calendar-outline"
              title="No bookings found"
              description={
                selectedStatus === 'All'
                  ? 'You have not made any booking requests yet. Discover equipment and facilities to reserve!'
                  : `No bookings currently in ${selectedStatus} status.`
              }
              actionTitle="Browse Resources"
              onAction={onNavigateToExplore}
            />
          }
        />
      )}
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
  tabsContainer: {
    marginVertical: Spacing.sm,
  },
  tabsList: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.xs,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
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
    marginBottom: Spacing.base,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  bookingCode: {
    ...Typography.titleSm,
    color: Colors.ink,
    fontWeight: '700',
  },
  timestamp: {
    ...Typography.caption,
    color: Colors.muted,
  },
  resourceName: {
    ...Typography.bodyLg,
    fontWeight: '600',
    color: Colors.ink,
    marginBottom: Spacing.sm,
  },
  detailsBlock: {
    backgroundColor: Colors.surfaceSoft,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    ...Typography.caption,
    color: Colors.body,
    flex: 1,
  },
  cardFooter: {
    marginTop: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    borderColor: '#fca5a5',
  },
});


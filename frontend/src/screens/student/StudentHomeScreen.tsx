import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { resourceService, Resource } from '../../services/resourceService';
import { bookingService, Booking } from '../../services/bookingService';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { ProfileAvatar } from '../../components/common/ProfileAvatar';

interface StudentHomeScreenProps {
  onSelectResource: (resource: Resource) => void;
  onNavigateToExplore: (category?: string) => void;
  onNavigateToBookings: () => void;
  onNavigateToNotifications: () => void;
  onNavigateToProfile?: () => void;
}

const CATEGORIES = [
  { id: 'Electronics', name: 'Electronics', icon: 'laptop-outline', color: '#0052ff', bg: '#eff6ff' },
  { id: 'Laboratory Equipment', name: 'Lab Gear', icon: 'flask-outline', color: '#05b169', bg: '#ecfdf5' },
  { id: 'Sports Equipment', name: 'Sports', icon: 'football-outline', color: '#564bcd', bg: '#f5f3ff' },
  { id: 'Rooms and Facilities', name: 'Rooms & Halls', icon: 'business-outline', color: '#05b6ea', bg: '#f0f9ff' },
];

export const StudentHomeScreen: React.FC<StudentHomeScreenProps> = ({
  onSelectResource,
  onNavigateToExplore,
  onNavigateToBookings,
  onNavigateToNotifications,
  onNavigateToProfile,
}) => {
  const { user } = useAuth();
  const [featuredResources, setFeaturedResources] = useState<Resource[]>([]);
  const [upcomingBooking, setUpcomingBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadHomeData = async () => {
    try {
      // 1. Fetch available resources (even count for 2-column grid)
      const resData = await resourceService.getResources({ limit: 10, status: 'available' });
      setFeaturedResources(resData.data.resources || []);

      // 2. Fetch student's upcoming booking
      const myBookings = await bookingService.getMyBookings({ limit: 5 });
      const active = (myBookings.data.bookings || []).find((b) =>
        ['Pending', 'Approved', 'Issued'].includes(b.status)
      );
      setUpcomingBooking(active || null);
    } catch (e) {
      console.warn('[Home Screen Error]:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadHomeData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadHomeData();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      {/* Top Bar Greeting */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greetingText}>{getGreeting()},</Text>
          <Text style={styles.userNameText}>{user?.name?.split(' ')[0] || 'Student'}</Text>
        </View>
        <View style={styles.topBarRight}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onNavigateToNotifications}
            style={styles.notificationIconBtn}>
            <Ionicons name="notifications-outline" size={22} color={Colors.ink} />
          </TouchableOpacity>
          <ProfileAvatar
            name={user?.name || 'Student'}
            onPress={onNavigateToProfile}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        
        {/* Search Bar Shortcut */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => onNavigateToExplore()}
          style={styles.searchBar}>
          <Ionicons name="search" size={20} color={Colors.muted} />
          <Text style={styles.searchPlaceholder}>Search laptops, cameras, labs, halls...</Text>
        </TouchableOpacity>

        {/* Categories Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity onPress={() => onNavigateToExplore()}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              activeOpacity={0.8}
              onPress={() => onNavigateToExplore(cat.id)}
              style={styles.categoryCard}>
              <View style={[styles.categoryIconCircle, { backgroundColor: cat.bg }]}>
                <Ionicons name={cat.icon as any} size={22} color={cat.color} />
              </View>
              <Text style={styles.categoryName} numberOfLines={1}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Upcoming Booking Banner */}
        {upcomingBooking && (
          <View style={styles.upcomingSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Active Reservation</Text>
              <TouchableOpacity onPress={onNavigateToBookings}>
                <Text style={styles.viewAllText}>Manage</Text>
              </TouchableOpacity>
            </View>
            <Card onPress={onNavigateToBookings} style={styles.activeBookingCard}>
              <View style={styles.activeBookingHeader}>
                <Badge status={upcomingBooking.status} size="sm" />
                <Text style={styles.bookingCodeText}>{upcomingBooking.bookingCode}</Text>
              </View>
              <Text style={styles.activeBookingTitle}>{upcomingBooking.resourceId?.name}</Text>
              <View style={styles.activeBookingDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="time-outline" size={15} color={Colors.body} />
                  <Text style={styles.detailText}>
                    {new Date(upcomingBooking.startAt).toLocaleDateString()} •{' '}
                    {new Date(upcomingBooking.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                    {new Date(upcomingBooking.endAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="location-outline" size={15} color={Colors.body} />
                  <Text style={styles.detailText}>
                    {upcomingBooking.resourceId?.location || 'Campus'}
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        )}

        {/* Featured Available Resources */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available for Reservation</Text>
          <TouchableOpacity onPress={() => onNavigateToExplore()}>
            <Text style={styles.viewAllText}>Explore</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: 24 }} />
        ) : (
          <View style={styles.resourceGrid}>
            {featuredResources.map((item) => {
              const avail = Math.min(
                Math.max(0, item.availableQuantity ?? item.totalQuantity),
                item.totalQuantity
              );
              const isAvailable = avail > 0 && item.operationalStatus === 'available';

              return (
                <TouchableOpacity
                  key={item._id}
                  activeOpacity={0.85}
                  onPress={() => onSelectResource(item)}
                  style={styles.gridCard}>
                  <View style={styles.gridImageContainer}>
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={styles.gridImage}
                      resizeMode="cover"
                    />
                    <View style={styles.statusDotWrapper}>
                      <View
                        style={[
                          styles.statusDot,
                          { backgroundColor: isAvailable ? Colors.semanticUp : Colors.semanticDown },
                        ]}
                      />
                    </View>
                  </View>

                  <View style={styles.gridContent}>
                    <Text style={styles.gridName} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <View style={styles.availabilityRow}>
                      <Ionicons
                        name={isAvailable ? 'checkmark-circle' : 'close-circle'}
                        size={13}
                        color={isAvailable ? Colors.semanticUp : Colors.semanticDown}
                      />
                      <Text
                        style={[
                          styles.availabilityText,
                          { color: isAvailable ? Colors.semanticUp : Colors.semanticDown },
                        ]}
                        numberOfLines={1}>
                        {isAvailable ? `${avail} Available` : 'Reserved'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
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
    letterSpacing: 0.5,
  },
  userNameText: {
    ...Typography.titleLg,
    color: Colors.ink,
    fontWeight: '700',
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  notificationIconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.hairlineSoft,
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.base,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSoft,
    borderWidth: 1,
    borderColor: Colors.hairline,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.base,
    height: 48,
    marginVertical: Spacing.base,
  },
  searchPlaceholder: {
    ...Typography.bodyMd,
    color: Colors.muted,
    marginLeft: Spacing.sm,
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.titleMd,
    color: Colors.ink,
  },
  viewAllText: {
    ...Typography.bodySm,
    color: Colors.primary,
    fontWeight: '600',
  },
  categoryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.base,
  },
  categoryCard: {
    width: '23%',
    alignItems: 'center',
    backgroundColor: Colors.surfaceCard,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.hairlineSoft,
  },
  categoryIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  categoryName: {
    ...Typography.caption,
    color: Colors.ink,
    fontWeight: '600',
    textAlign: 'center',
  },
  upcomingSection: {
    marginBottom: Spacing.sm,
  },
  activeBookingCard: {
    backgroundColor: '#f8fafc',
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  activeBookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  bookingCodeText: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.body,
  },
  activeBookingTitle: {
    ...Typography.titleSm,
    color: Colors.ink,
    marginBottom: Spacing.xs,
  },
  activeBookingDetails: {
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    ...Typography.caption,
    color: Colors.body,
  },
  resourceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: Spacing.sm,
  },
  gridCard: {
    width: '48.5%',
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.hairlineSoft,
    overflow: 'hidden',
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: Spacing.xs,
  },
  gridImageContainer: {
    width: '100%',
    height: 124,
    backgroundColor: Colors.surfaceSoft,
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  statusDotWrapper: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: Radius.full,
    padding: 5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 1,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  gridContent: {
    padding: Spacing.sm,
    justifyContent: 'space-between',
    minHeight: 68,
  },
  gridName: {
    ...Typography.bodyMd,
    fontWeight: '700',
    color: Colors.ink,
    lineHeight: 18,
    marginBottom: 6,
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  availabilityText: {
    ...Typography.caption,
    fontWeight: '600',
    fontSize: 12,
  },
});


import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { resourceService, Resource, AvailabilityResult } from '../../services/resourceService';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';

interface ResourceDetailScreenProps {
  resource: Resource;
  onBack: () => void;
  onOpenBookingForm: (resource: Resource) => void;
}

export const ResourceDetailScreen: React.FC<ResourceDetailScreenProps> = ({
  resource,
  onBack,
  onOpenBookingForm,
}) => {
  const insets = useSafeAreaInsets();
  const [details, setDetails] = useState<Resource>(resource);
  const [currentAvailable, setCurrentAvailable] = useState<number>(resource.totalQuantity);
  const [loading, setLoading] = useState<boolean>(true);

  // Quick availability check for tomorrow's daytime slot
  const [slotAvailability, setSlotAvailability] = useState<AvailabilityResult | null>(null);
  const [checkingSlot, setCheckingSlot] = useState<boolean>(false);

  useEffect(() => {
    loadDetails();
  }, [resource._id]);

  const loadDetails = async () => {
    try {
      setLoading(true);
      const res = await resourceService.getResourceById(resource._id);
      setDetails(res.data.resource);
      setCurrentAvailable(res.data.currentAvailable);

      // Check default upcoming window (tomorrow 10 AM to 1 PM)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      const tomorrowEnd = new Date(tomorrow);
      tomorrowEnd.setHours(13, 0, 0, 0);

      setCheckingSlot(true);
      const availRes = await resourceService.checkAvailability(
        resource._id,
        tomorrow.toISOString(),
        tomorrowEnd.toISOString()
      );
      setSlotAvailability(availRes.data);
    } catch (e) {
      console.warn('[Resource Details Error]:', e);
    } finally {
      setLoading(false);
      setCheckingSlot(false);
    }
  };

  const isBookable = details.operationalStatus === 'available' && !details.isArchived;

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      {/* Top Navigation */}
      <View style={styles.topBar}>
        <TouchableOpacity activeOpacity={0.7} onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.ink} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle} numberOfLines={1}>
          {details.name}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Resource Hero Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: details.imageUrl }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.imageOverlayBadge}>
            <Badge status={details.operationalStatus} />
          </View>
        </View>

        {/* Title & Metadata */}
        <View style={styles.bodyContainer}>
          <Text style={styles.categoryLabel}>{details.category.toUpperCase()}</Text>
          <Text style={styles.titleText}>{details.name}</Text>

          {/* Quick Info Grid */}
          <View style={styles.infoGrid}>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Total Inventory</Text>
              <Text style={styles.infoValue}>
                {details.totalQuantity} {details.totalQuantity === 1 ? 'Unit' : 'Units'}
              </Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Condition</Text>
              <Text style={styles.infoValue}>{details.condition}</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Workflow</Text>
              <Text style={styles.infoValue}>
                {details.requiresIssueReturn ? 'Physical Handout' : 'Room Access'}
              </Text>
            </View>
          </View>

          {/* Location & Department */}
          <Card style={styles.locationCard}>
            <View style={styles.metaRow}>
              <Ionicons name="location" size={20} color={Colors.primary} />
              <View style={styles.metaTextCol}>
                <Text style={styles.metaTitle}>Campus Location</Text>
                <Text style={styles.metaSubtitle}>{details.location}</Text>
              </View>
            </View>
            <View style={[styles.metaRow, { marginTop: Spacing.sm }]}>
              <Ionicons name="business" size={20} color={Colors.primary} />
              <View style={styles.metaTextCol}>
                <Text style={styles.metaTitle}>Custodian Department</Text>
                <Text style={styles.metaSubtitle}>{details.department}</Text>
              </View>
            </View>
          </Card>

          {/* Real-Time Availability Widget */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Real-Time Availability</Text>
          </View>
          <Card style={styles.availCard}>
            <View style={styles.availHeader}>
              <Ionicons name="time" size={20} color={Colors.semanticUp} />
              <Text style={styles.availTitle}>Tomorrow 10:00 AM – 1:00 PM</Text>
            </View>
            {checkingSlot ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : slotAvailability ? (
              <View style={styles.availDetails}>
                <Text style={styles.availStat}>
                  {slotAvailability.availableQuantity} of {slotAvailability.totalQuantity} units currently free
                </Text>
                <Text style={styles.availDesc}>
                  Calculated dynamically with sweep-line conflict prevention algorithm.
                </Text>
              </View>
            ) : null}
          </Card>

          {/* Full Description */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Description & Guidelines</Text>
          </View>
          <Text style={styles.descriptionText}>{details.description}</Text>

          {/* Policy Notice */}
          <View style={styles.noticeBox}>
            <Ionicons name="shield-checkmark-outline" size={20} color={Colors.body} />
            <Text style={styles.noticeText}>
              All reservations require institutional administrator approval. Equipment must be inspected upon pickup and return.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, Spacing.sm) }]}>
        <View style={styles.bottomBarInfo}>
          <Text style={styles.bottomPriceLabel}>Available Inventory</Text>
          <Text style={styles.bottomPriceValue}>
            {isBookable
              ? `${Math.min(Math.max(0, details.availableQuantity ?? details.totalQuantity), details.totalQuantity)} of ${details.totalQuantity} Units Free`
              : 'Unavailable'}
          </Text>
        </View>
        <Button
          title={isBookable ? 'Reserve Now' : 'Not Bookable'}
          onPress={() => onOpenBookingForm(details)}
          disabled={!isBookable}
          size="lg"
          style={styles.bookButton}
        />
      </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    height: 52,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairlineSoft,
  },
  backBtn: {
    padding: 6,
  },
  topBarTitle: {
    ...Typography.titleSm,
    color: Colors.ink,
    flex: 1,
    textAlign: 'center',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 240,
    backgroundColor: Colors.surfaceSoft,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlayBadge: {
    position: 'absolute',
    top: Spacing.base,
    right: Spacing.base,
  },
  bodyContainer: {
    padding: Spacing.base,
  },
  categoryLabel: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  titleText: {
    ...Typography.displayMd,
    color: Colors.ink,
    lineHeight: 30,
    marginBottom: Spacing.base,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceSoft,
    borderRadius: Radius.md,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.hairlineSoft,
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    ...Typography.caption,
    color: Colors.body,
    marginBottom: 2,
  },
  infoValue: {
    ...Typography.titleSm,
    color: Colors.ink,
  },
  locationCard: {
    marginBottom: Spacing.base,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  metaTextCol: {
    flex: 1,
  },
  metaTitle: {
    ...Typography.caption,
    color: Colors.muted,
  },
  metaSubtitle: {
    ...Typography.bodySm,
    fontWeight: '600',
    color: Colors.ink,
  },
  sectionHeader: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    ...Typography.titleSm,
    color: Colors.ink,
  },
  availCard: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
    marginBottom: Spacing.base,
  },
  availHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  availTitle: {
    ...Typography.bodySm,
    fontWeight: '700',
    color: '#166534',
  },
  availDetails: {
    gap: 2,
  },
  availStat: {
    ...Typography.bodySm,
    fontWeight: '600',
    color: '#15803d',
  },
  availDesc: {
    ...Typography.caption,
    color: '#4b5563',
  },
  descriptionText: {
    ...Typography.bodyMd,
    color: Colors.body,
    lineHeight: 22,
    marginBottom: Spacing.base,
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceSoft,
    padding: Spacing.base,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.hairlineSoft,
  },
  noticeText: {
    ...Typography.caption,
    color: Colors.body,
    flex: 1,
    lineHeight: 18,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.canvas,
    borderTopWidth: 1,
    borderTopColor: Colors.hairline,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  bottomBarInfo: {
    flex: 1,
  },
  bottomPriceLabel: {
    ...Typography.caption,
    color: Colors.body,
  },
  bottomPriceValue: {
    ...Typography.titleSm,
    fontWeight: '700',
    color: Colors.ink,
  },
  bookButton: {
    flex: 1,
    marginLeft: Spacing.base,
  },
});


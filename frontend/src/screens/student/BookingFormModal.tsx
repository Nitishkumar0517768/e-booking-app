import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Resource, resourceService } from '../../services/resourceService';
import { bookingService, Booking } from '../../services/bookingService';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';

interface BookingFormModalProps {
  visible: boolean;
  resource: Resource | null;
  onClose: () => void;
  onBookingSuccess: (booking: Booking) => void;
}

const TIME_SLOTS = [
  { id: 'morning', label: 'Morning (09:00 – 12:00)', startHour: 9, endHour: 12 },
  { id: 'afternoon', label: 'Afternoon (13:00 – 16:00)', startHour: 13, endHour: 16 },
  { id: 'evening', label: 'Evening (16:30 – 19:30)', startHour: 16.5, endHour: 19.5 },
  { id: 'fullday', label: 'Full Day (09:00 – 17:00)', startHour: 9, endHour: 17 },
];

export const BookingFormModal: React.FC<BookingFormModalProps> = ({
  visible,
  resource,
  onClose,
  onBookingSuccess,
}) => {
  if (!resource) return null;

  // Date Offset: 1 = Tomorrow, 2 = Day After, 3 = +3 Days
  const [dayOffset, setDayOffset] = useState<number>(1);
  const [selectedSlotId, setSelectedSlotId] = useState<string>('morning');
  const [quantity, setQuantity] = useState<number>(1);
  const [purpose, setPurpose] = useState<string>('');

  const [checkingAvailability, setCheckingAvailability] = useState<boolean>(false);
  const [availableQty, setAvailableQty] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Compute actual startAt and endAt dates
  const calculateDates = () => {
    const slot = TIME_SLOTS.find((s) => s.id === selectedSlotId) || TIME_SLOTS[0];
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + dayOffset);

    const startAt = new Date(targetDate);
    const startHourInt = Math.floor(slot.startHour);
    const startMin = (slot.startHour % 1) * 60;
    startAt.setHours(startHourInt, startMin, 0, 0);

    const endAt = new Date(targetDate);
    const endHourInt = Math.floor(slot.endHour);
    const endMin = (slot.endHour % 1) * 60;
    endAt.setHours(endHourInt, endMin, 0, 0);

    return { startAt, endAt };
  };

  useEffect(() => {
    if (visible && resource) {
      checkLiveAvailability();
    }
  }, [visible, dayOffset, selectedSlotId, resource?._id]);

  const checkLiveAvailability = async () => {
    try {
      setCheckingAvailability(true);
      setError(null);
      const { startAt, endAt } = calculateDates();
      const res = await resourceService.checkAvailability(
        resource._id,
        startAt.toISOString(),
        endAt.toISOString()
      );
      setAvailableQty(res.data.availableQuantity);
    } catch (e: any) {
      console.warn('[Check Availability Error]:', e);
      setAvailableQty(null);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const getDayLabel = (offset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    if (offset === 1) return 'Tomorrow';
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const handleSubmit = async () => {
    if (!purpose.trim()) {
      setError('Please provide a booking purpose for institutional verification.');
      return;
    }

    if (purpose.trim().length < 5) {
      setError('Purpose must be at least 5 characters.');
      return;
    }

    if (availableQty !== null && quantity > availableQty) {
      setError(`Cannot request ${quantity} units. Only ${availableQty} units available.`);
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const { startAt, endAt } = calculateDates();
      const res = await bookingService.createBooking({
        resourceId: resource._id,
        quantity,
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
        purpose: purpose.trim(),
      });

      onBookingSuccess(res.data.booking);
    } catch (err: any) {
      setError(err.message || 'Failed to submit booking. Overlap conflict detected.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
          style={styles.keyboardView}>
          
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={Colors.ink} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Reserve Resource</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            showsVerticalScrollIndicator={false}>
            {/* Resource summary banner */}
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryCategory}>{resource.category.toUpperCase()}</Text>
              <Text style={styles.summaryTitle}>{resource.name}</Text>
              <Text style={styles.summaryMeta}>
                Location: {resource.location} • Total Inventory: {resource.totalQuantity} units
              </Text>
            </Card>

            {error && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={18} color={Colors.semanticDown} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* 1. Date Selector */}
            <Text style={styles.fieldLabel}>Select Date</Text>
            <View style={styles.daySelectorRow}>
              {[1, 2, 3, 4].map((offset) => {
                const isSelected = dayOffset === offset;
                return (
                  <TouchableOpacity
                    key={offset}
                    activeOpacity={0.8}
                    onPress={() => setDayOffset(offset)}
                    style={[styles.dayButton, isSelected ? styles.dayButtonSelected : undefined]}>
                    <Text style={[styles.dayButtonText, isSelected ? styles.dayButtonTextSelected : undefined]}>
                      {getDayLabel(offset)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 2. Time Slot Selector */}
            <Text style={styles.fieldLabel}>Select Time Interval</Text>
            <View style={styles.slotGrid}>
              {TIME_SLOTS.map((slot) => {
                const isSelected = selectedSlotId === slot.id;
                return (
                  <TouchableOpacity
                    key={slot.id}
                    activeOpacity={0.8}
                    onPress={() => setSelectedSlotId(slot.id)}
                    style={[styles.slotItem, isSelected ? styles.slotItemSelected : undefined]}>
                    <Ionicons
                      name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                      size={18}
                      color={isSelected ? Colors.primary : Colors.muted}
                    />
                    <Text style={[styles.slotLabel, isSelected ? styles.slotLabelSelected : undefined]}>
                      {slot.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 3. Live Interval Availability Indicator */}
            <View style={styles.liveAvailBox}>
              <View style={styles.liveAvailHeader}>
                <Ionicons
                  name={checkingAvailability ? 'hourglass-outline' : 'shield-checkmark'}
                  size={18}
                  color={availableQty && availableQty > 0 ? Colors.semanticUp : Colors.semanticDown}
                />
                <Text style={styles.liveAvailTitle}>
                  {checkingAvailability
                    ? 'Verifying interval availability...'
                    : availableQty !== null
                    ? `${availableQty} of ${resource.totalQuantity} units available for this slot`
                    : 'Availability check ready'}
                </Text>
              </View>
              <Text style={styles.liveAvailSubtitle}>
                Guaranteed by backend concurrency sweep-line engine.
              </Text>
            </View>

            {/* 4. Quantity Selector */}
            <Text style={styles.fieldLabel}>Required Quantity</Text>
            <View style={styles.quantityRow}>
              <TouchableOpacity
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                style={[styles.qtyBtn, quantity <= 1 ? styles.qtyBtnDisabled : undefined]}>
                <Ionicons name="remove" size={20} color={quantity <= 1 ? Colors.muted : Colors.ink} />
              </TouchableOpacity>
              <View style={styles.qtyDisplay}>
                <Text style={styles.qtyDisplayText}>{quantity}</Text>
                <Text style={styles.qtyUnitLabel}>{quantity === 1 ? 'Unit' : 'Units'}</Text>
              </View>
              <TouchableOpacity
                onPress={() =>
                  setQuantity((q) => {
                    const maxAllowed = availableQty !== null ? Math.min(resource.totalQuantity, availableQty) : resource.totalQuantity;
                    return Math.min(maxAllowed, q + 1);
                  })
                }
                disabled={availableQty !== null && quantity >= availableQty}
                style={[
                  styles.qtyBtn,
                  availableQty !== null && quantity >= availableQty ? styles.qtyBtnDisabled : undefined,
                ]}>
                <Ionicons
                  name="add"
                  size={20}
                  color={availableQty !== null && quantity >= availableQty ? Colors.muted : Colors.ink}
                />
              </TouchableOpacity>
            </View>

            {/* 5. Purpose */}
            <Input
              label="Booking Purpose *"
              placeholder="State the academic project, lab session, or event purpose..."
              value={purpose}
              onChangeText={(t) => {
                setPurpose(t);
                setError(null);
              }}
              multiline
              numberOfLines={3}
              containerStyle={{ minHeight: 80 }}
            />

            {/* Submit Button */}
            <Button
              title="Confirm & Submit Booking"
              onPress={handleSubmit}
              loading={submitting}
              disabled={availableQty === 0 || checkingAvailability}
              size="lg"
              style={styles.submitButton}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
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
    paddingBottom: 220,
  },
  summaryCard: {
    backgroundColor: Colors.surfaceSoft,
    borderColor: Colors.hairline,
    marginBottom: Spacing.base,
  },
  summaryCategory: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: Colors.muted,
  },
  summaryTitle: {
    ...Typography.titleSm,
    color: Colors.ink,
    marginTop: 2,
    marginBottom: 4,
  },
  summaryMeta: {
    ...Typography.caption,
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
  errorText: {
    ...Typography.bodySm,
    color: Colors.semanticDown,
    flex: 1,
  },
  fieldLabel: {
    ...Typography.bodySm,
    fontWeight: '700',
    color: Colors.ink,
    marginBottom: Spacing.xs,
    marginTop: Spacing.xs,
  },
  daySelectorRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.base,
  },
  dayButton: {
    flex: 1,
    backgroundColor: Colors.surfaceSoft,
    borderRadius: Radius.md,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.hairlineSoft,
  },
  dayButtonSelected: {
    backgroundColor: Colors.ink,
    borderColor: Colors.ink,
  },
  dayButtonText: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.body,
  },
  dayButtonTextSelected: {
    color: Colors.canvas,
  },
  slotGrid: {
    gap: Spacing.xs,
    marginBottom: Spacing.base,
  },
  slotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.hairline,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  slotItemSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#eff6ff',
  },
  slotLabel: {
    ...Typography.bodySm,
    color: Colors.ink,
  },
  slotLabelSelected: {
    fontWeight: '700',
    color: Colors.primary,
  },
  liveAvailBox: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: Radius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.base,
  },
  liveAvailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  liveAvailTitle: {
    ...Typography.bodySm,
    fontWeight: '700',
    color: '#15803d',
  },
  liveAvailSubtitle: {
    ...Typography.caption,
    color: '#4b5563',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceSoft,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.hairlineSoft,
  },
  qtyBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.hairline,
  },
  qtyBtnDisabled: {
    backgroundColor: Colors.surfaceSoft,
    borderColor: Colors.hairlineSoft,
  },
  qtyDisplay: {
    alignItems: 'center',
    marginHorizontal: Spacing.xl,
  },
  qtyDisplayText: {
    ...Typography.titleLg,
    color: Colors.ink,
    fontWeight: '700',
  },
  qtyUnitLabel: {
    ...Typography.caption,
    color: Colors.body,
  },
  submitButton: {
    marginTop: Spacing.base,
  },
});


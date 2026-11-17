import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { notificationService, AppNotification } from '../../services/notificationService';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import { Card } from '../../components/common/Card';
import { EmptyState } from '../../components/common/EmptyState';
import { ProfileAvatar } from '../../components/common/ProfileAvatar';
import { useAuth } from '../../context/AuthContext';

interface NotificationsScreenProps {
  onSelectNotification?: (notification: AppNotification) => void;
  onNavigateToProfile?: () => void;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  onSelectNotification,
  onNavigateToProfile,
}) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationService.getNotifications();
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (e) {
      console.warn('[Fetch Notifications Error]:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleMarkAsRead = async (notif: AppNotification) => {
    if (!notif.isRead) {
      try {
        await notificationService.markAsRead(notif._id);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch (e) {
        console.warn('Mark read error:', e);
      }
    }
    if (onSelectNotification) {
      onSelectNotification(notif);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      console.warn('Mark all read error:', e);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking_approved':
        return { name: 'checkmark-circle', color: Colors.semanticUp };
      case 'booking_rejected':
        return { name: 'close-circle', color: Colors.semanticDown };
      case 'equipment_issued':
        return { name: 'cube', color: Colors.primary };
      case 'equipment_returned':
        return { name: 'arrow-down-circle', color: Colors.semanticUp };
      case 'booking_cancelled':
        return { name: 'ban', color: Colors.body };
      default:
        return { name: 'notifications', color: Colors.primary };
    }
  };

  const renderItem = ({ item }: { item: AppNotification }) => {
    const icon = getNotificationIcon(item.type);

    return (
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() => handleMarkAsRead(item)}
        style={[styles.itemCard, !item.isRead ? styles.itemUnread : undefined]}>
        <View style={styles.iconCircle}>
          <Ionicons name={icon.name as any} size={22} color={icon.color} />
        </View>
        <View style={styles.contentCol}>
          <View style={styles.titleRow}>
            <Text style={[styles.itemTitle, !item.isRead ? styles.itemTitleUnread : undefined]}>
              {item.title}
            </Text>
            {!item.isRead && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.itemMessage}>{item.message}</Text>
          <Text style={styles.itemTime}>
            {new Date(item.createdAt).toLocaleDateString()} at{' '}
            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.header}>
        <View style={{ flex: 1, marginRight: Spacing.sm }}>
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.subtitle}>
            {unreadCount > 0 ? `${unreadCount} unread update(s)` : 'All caught up'}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllBtn}>
              <Text style={styles.markAllText}>Mark all as read</Text>
            </TouchableOpacity>
          )}
          <ProfileAvatar
            name={user?.name || 'Student'}
            onPress={onNavigateToProfile}
          />
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <EmptyState
              icon="notifications-off-outline"
              title="No notifications yet"
              description="Updates regarding your booking requests, approvals, and reminders will appear here."
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
    justifyContent: 'space-between',
    alignItems: 'center',
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
  markAllBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  markAllText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
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
  itemCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surfaceCard,
    padding: Spacing.base,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.hairlineSoft,
    marginBottom: Spacing.sm,
  },
  itemUnread: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  iconCircle: {
    marginRight: Spacing.sm,
    marginTop: 2,
  },
  contentCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemTitle: {
    ...Typography.titleSm,
    color: Colors.ink,
    flex: 1,
  },
  itemTitleUnread: {
    fontWeight: '700',
    color: Colors.primary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginLeft: 6,
  },
  itemMessage: {
    ...Typography.bodySm,
    color: Colors.body,
    lineHeight: 18,
    marginBottom: 6,
  },
  itemTime: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.muted,
  },
});


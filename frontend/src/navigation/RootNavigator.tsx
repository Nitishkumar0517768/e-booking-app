import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';
import { AppSplashScreen } from '../components/common/AppSplashScreen';
import { Resource } from '../services/resourceService';
import { Booking } from '../services/bookingService';

// Auth Screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';

// Student Screens
import { StudentHomeScreen } from '../screens/student/StudentHomeScreen';
import { ExploreScreen } from '../screens/student/ExploreScreen';
import { ResourceDetailScreen } from '../screens/student/ResourceDetailScreen';
import { BookingFormModal } from '../screens/student/BookingFormModal';
import { MyBookingsScreen } from '../screens/student/MyBookingsScreen';
import { BookingDetailModal } from '../screens/student/BookingDetailModal';
import { NotificationsScreen } from '../screens/student/NotificationsScreen';
import { ProfileScreen } from '../screens/student/ProfileScreen';

// Admin Screens
import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import { AdminResourcesScreen } from '../screens/admin/AdminResourcesScreen';
import { AddEditResourceModal } from '../screens/admin/AddEditResourceModal';
import { AdminRequestsScreen } from '../screens/admin/AdminRequestsScreen';
import { AdminHistoryScreen } from '../screens/admin/AdminHistoryScreen';
import { AdminProfileScreen } from '../screens/admin/AdminProfileScreen';

type StudentTab = 'home' | 'explore' | 'bookings' | 'notifications' | 'profile';
type AdminTab = 'dashboard' | 'resources' | 'requests' | 'history' | 'profile';

export const RootNavigator: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 12 : 8);

  // Initial App Startup Splash Screen
  const [showSplash, setShowSplash] = useState(true);

  // Auth Flow state
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Student Navigation state
  const [studentTab, setStudentTab] = useState<StudentTab>('home');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [activeResource, setActiveResource] = useState<Resource | null>(null);
  const [bookingFormResource, setBookingFormResource] = useState<Resource | null>(null);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);

  // Admin Navigation state
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const [addEditModalVisible, setAddEditModalVisible] = useState(false);
  const [resourceToEdit, setResourceToEdit] = useState<Resource | null>(null);

  // 1. Initial Animated Splash Screen on App Launch
  if (showSplash || isLoading) {
    return <AppSplashScreen onFinish={() => setShowSplash(false)} durationMs={1800} />;
  }

  // 2. Unauthenticated Flow
  if (!isAuthenticated) {
    if (authMode === 'register') {
      return <RegisterScreen onNavigateToLogin={() => setAuthMode('login')} />;
    }
    return <LoginScreen onNavigateToRegister={() => setAuthMode('register')} />;
  }

  // 3. Admin Experience
  if (user?.role === 'admin') {
    return (
      <View style={styles.container}>
        <View style={styles.screenArea}>
          {adminTab === 'dashboard' && (
            <AdminDashboardScreen
              onNavigateToRequests={() => setAdminTab('requests')}
              onNavigateToResources={() => setAdminTab('resources')}
              onNavigateToHistory={() => setAdminTab('history')}
              onAddNewResource={() => {
                setResourceToEdit(null);
                setAddEditModalVisible(true);
              }}
              onNavigateToProfile={() => setAdminTab('profile')}
            />
          )}
          {adminTab === 'resources' && (
            <AdminResourcesScreen
              onAddNewResource={() => {
                setResourceToEdit(null);
                setAddEditModalVisible(true);
              }}
              onEditResource={(res) => {
                setResourceToEdit(res);
                setAddEditModalVisible(true);
              }}
              onNavigateToProfile={() => setAdminTab('profile')}
            />
          )}
          {adminTab === 'requests' && (
            <AdminRequestsScreen onNavigateToProfile={() => setAdminTab('profile')} />
          )}
          {adminTab === 'history' && (
            <AdminHistoryScreen onNavigateToProfile={() => setAdminTab('profile')} />
          )}
          {adminTab === 'profile' && (
            <AdminProfileScreen onBack={() => setAdminTab('dashboard')} />
          )}
        </View>

        {/* Admin Bottom Navigation Bar */}
        <View style={[styles.bottomNavContainer, { paddingBottom: bottomInset }]}>
          <View style={styles.tabBar}>
            <TouchableOpacity
              onPress={() => setAdminTab('dashboard')}
              style={styles.tabItem}>
              <Ionicons
                name={adminTab === 'dashboard' ? 'home' : 'home-outline'}
                size={22}
                color={adminTab === 'dashboard' ? Colors.primary : Colors.body}
              />
              <Text style={[styles.tabLabel, adminTab === 'dashboard' ? styles.tabLabelActive : undefined]}>
                Home
              </Text>
            </TouchableOpacity>

            {/* 2. Resources */}
            <TouchableOpacity
              onPress={() => setAdminTab('resources')}
              style={styles.tabItem}>
              <Ionicons
                name={adminTab === 'resources' ? 'cube' : 'cube-outline'}
                size={22}
                color={adminTab === 'resources' ? Colors.primary : Colors.body}
              />
              <Text style={[styles.tabLabel, adminTab === 'resources' ? styles.tabLabelActive : undefined]}>
                Resources
              </Text>
            </TouchableOpacity>

            {/* 3. Add Item (Centered Button between Resources and Requests) */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                setResourceToEdit(null);
                setAddEditModalVisible(true);
              }}
              style={styles.centerAddItemBtn}>
              <View style={styles.centerAddIconCircle}>
                <Ionicons name="add" size={26} color="#ffffff" />
              </View>
              <Text style={styles.centerAddLabel}>Add Item</Text>
            </TouchableOpacity>

            {/* 4. Requests */}
            <TouchableOpacity
              onPress={() => setAdminTab('requests')}
              style={styles.tabItem}>
              <Ionicons
                name={adminTab === 'requests' ? 'clipboard' : 'clipboard-outline'}
                size={22}
                color={adminTab === 'requests' ? Colors.primary : Colors.body}
              />
              <Text style={[styles.tabLabel, adminTab === 'requests' ? styles.tabLabelActive : undefined]}>
                Requests
              </Text>
            </TouchableOpacity>

            {/* 5. History */}
            <TouchableOpacity
              onPress={() => setAdminTab('history')}
              style={styles.tabItem}>
              <Ionicons
                name={adminTab === 'history' ? 'time' : 'time-outline'}
                size={22}
                color={adminTab === 'history' ? Colors.primary : Colors.body}
              />
              <Text style={[styles.tabLabel, adminTab === 'history' ? styles.tabLabelActive : undefined]}>
                History
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Admin Add/Edit Resource Modal */}
        <AddEditResourceModal
          visible={addEditModalVisible}
          resource={resourceToEdit}
          onClose={() => setAddEditModalVisible(false)}
          onSaved={() => {
            setAddEditModalVisible(false);
          }}
        />
      </View>
    );
  }

  // 4. Student Experience
  return (
    <View style={styles.container}>
      <View style={styles.screenArea}>
        {studentTab === 'home' && (
          <StudentHomeScreen
            onSelectResource={(res) => setActiveResource(res)}
            onNavigateToExplore={(cat) => {
              setSelectedCategory(cat);
              setStudentTab('explore');
            }}
            onNavigateToBookings={() => setStudentTab('bookings')}
            onNavigateToNotifications={() => setStudentTab('notifications')}
            onNavigateToProfile={() => setStudentTab('profile')}
          />
        )}
        {studentTab === 'explore' && (
          <ExploreScreen
            initialCategory={selectedCategory}
            onSelectResource={(res) => setActiveResource(res)}
            onNavigateToProfile={() => setStudentTab('profile')}
          />
        )}
        {studentTab === 'bookings' && (
          <MyBookingsScreen
            onSelectBooking={(b) => setActiveBooking(b)}
            onNavigateToExplore={() => setStudentTab('explore')}
            onNavigateToProfile={() => setStudentTab('profile')}
          />
        )}
        {studentTab === 'notifications' && (
          <NotificationsScreen onNavigateToProfile={() => setStudentTab('profile')} />
        )}
        {studentTab === 'profile' && (
          <ProfileScreen onBack={() => setStudentTab('home')} />
        )}
      </View>

      {/* Student Bottom Navigation Bar */}
      <View style={[styles.bottomNavContainer, { paddingBottom: bottomInset }]}>
        <View style={styles.tabBar}>
          <TouchableOpacity
            onPress={() => setStudentTab('home')}
            style={styles.tabItem}>
            <Ionicons
              name={studentTab === 'home' ? 'home' : 'home-outline'}
              size={22}
              color={studentTab === 'home' ? Colors.primary : Colors.body}
            />
            <Text style={[styles.tabLabel, studentTab === 'home' ? styles.tabLabelActive : undefined]}>
              Home
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setSelectedCategory(undefined);
              setStudentTab('explore');
            }}
            style={styles.tabItem}>
            <Ionicons
              name={studentTab === 'explore' ? 'compass' : 'compass-outline'}
              size={22}
              color={studentTab === 'explore' ? Colors.primary : Colors.body}
            />
            <Text style={[styles.tabLabel, studentTab === 'explore' ? styles.tabLabelActive : undefined]}>
              Explore
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setStudentTab('bookings')}
            style={styles.tabItem}>
            <Ionicons
              name={studentTab === 'bookings' ? 'calendar' : 'calendar-outline'}
              size={22}
              color={studentTab === 'bookings' ? Colors.primary : Colors.body}
            />
            <Text style={[styles.tabLabel, studentTab === 'bookings' ? styles.tabLabelActive : undefined]}>
              Bookings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setStudentTab('notifications')}
            style={styles.tabItem}>
            <Ionicons
              name={studentTab === 'notifications' ? 'notifications' : 'notifications-outline'}
              size={22}
              color={studentTab === 'notifications' ? Colors.primary : Colors.body}
            />
            <Text style={[styles.tabLabel, studentTab === 'notifications' ? styles.tabLabelActive : undefined]}>
              Alerts
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sub-Screen / Modal: Resource Details */}
      {activeResource && (
        <View style={StyleSheet.absoluteFill}>
          <ResourceDetailScreen
            resource={activeResource}
            onBack={() => setActiveResource(null)}
            onOpenBookingForm={(res) => {
              setBookingFormResource(res);
            }}
          />
        </View>
      )}

      {/* Sub-Screen / Modal: Booking Form */}
      <BookingFormModal
        visible={!!bookingFormResource}
        resource={bookingFormResource}
        onClose={() => setBookingFormResource(null)}
        onBookingSuccess={(booking) => {
          setBookingFormResource(null);
          setActiveResource(null);
          setStudentTab('bookings');
          setActiveBooking(booking);
        }}
      />

      {/* Sub-Screen / Modal: Booking Detail */}
      <BookingDetailModal
        visible={!!activeBooking}
        booking={activeBooking}
        onClose={() => setActiveBooking(null)}
        onBookingCancelled={() => {
          setActiveBooking(null);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.canvas,
  },
  screenArea: {
    flex: 1,
  },
  splashContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.canvas,
    padding: Spacing.xl,
  },
  splashIcon: {
    width: 80,
    height: 80,
    borderRadius: Radius.xl,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.base,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  splashTitle: {
    ...Typography.displayMd,
    color: Colors.ink,
    fontWeight: '700',
  },
  splashSubtitle: {
    ...Typography.bodyMd,
    color: Colors.body,
    marginTop: 4,
    textAlign: 'center',
  },
  bottomNavContainer: {
    backgroundColor: Colors.surfaceCard,
    borderTopWidth: 1,
    borderTopColor: Colors.hairlineSoft,
  },
  tabBar: {
    flexDirection: 'row',
    height: 56,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.xs,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabLabel: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.body,
    marginTop: 2,
  },
  tabLabelActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  centerAddItemBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -8,
  },
  centerAddIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  centerAddLabel: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 2,
  },
});


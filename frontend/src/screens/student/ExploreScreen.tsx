import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { resourceService, Resource } from '../../services/resourceService';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { ProfileAvatar } from '../../components/common/ProfileAvatar';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = [
  'All',
  'Electronics',
  'Laboratory Equipment',
  'Sports Equipment',
  'Rooms and Facilities',
  'Other Resources',
];

interface ExploreScreenProps {
  initialCategory?: string;
  onSelectResource: (resource: Resource) => void;
  onNavigateToProfile?: () => void;
}

export const ExploreScreen: React.FC<ExploreScreenProps> = ({
  initialCategory,
  onSelectResource,
  onNavigateToProfile,
}) => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  useEffect(() => {
    fetchResources();
  }, [selectedCategory, searchQuery]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const res = await resourceService.getResources({
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        search: searchQuery.trim() || undefined,
        status: 'available',
      });
      setResources(res.data.resources || []);
    } catch (e) {
      console.warn('[Explore Fetch Error]:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchResources();
  };

  const renderResourceCard = ({ item }: { item: Resource }) => (
    <Card onPress={() => onSelectResource(item)} style={styles.card}>
      <Image source={{ uri: item.imageUrl }} style={styles.cardImage} resizeMode="cover" />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.categoryBadge}>{item.category.toUpperCase()}</Text>
          <Badge status={item.operationalStatus} size="sm" />
        </View>

        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.name}
        </Text>

        <Text style={styles.cardDesc} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={14} color={Colors.body} />
            <Text style={styles.metaText} numberOfLines={1}>
              {item.location}
            </Text>
          </View>
          <View
            style={[
              styles.qtyBadge,
              Math.min(item.availableQuantity ?? item.totalQuantity, item.totalQuantity) === 0 ? { backgroundColor: '#fee2e2' } : undefined,
            ]}>
            <Text
              style={[
                styles.qtyBadgeText,
                Math.min(item.availableQuantity ?? item.totalQuantity, item.totalQuantity) === 0 ? { color: Colors.semanticDown } : undefined,
              ]}>
              {Math.min(item.availableQuantity ?? item.totalQuantity, item.totalQuantity) === 0
                ? 'Out of Stock'
                : `${Math.min(Math.max(0, item.availableQuantity ?? item.totalQuantity), item.totalQuantity)} of ${item.totalQuantity} available`}
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      {/* Title */}
      <View style={styles.header}>
        <View style={{ flex: 1, marginRight: Spacing.sm }}>
          <Text style={styles.title}>Explore Resources</Text>
          <Text style={styles.subtitle}>Discover equipment and facilities for your academic work</Text>
        </View>
        <ProfileAvatar
          name={user?.name || 'Student'}
          onPress={onNavigateToProfile}
        />
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.muted} style={styles.searchIcon} />
        <TextInput
          placeholder="Search by name, department, or keyword..."
          placeholderTextColor={Colors.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={Colors.muted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Pills Filter */}
      <View style={styles.pillsContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.pillsList}
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item;
            return (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setSelectedCategory(item)}
                style={[styles.pill, isSelected ? styles.pillSelected : undefined]}>
                <Text style={[styles.pillText, isSelected ? styles.pillTextSelected : undefined]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Resource Listing */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={resources}
          keyExtractor={(item) => item._id}
          renderItem={renderResourceCard}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <EmptyState
              icon="search-outline"
              title="No resources found"
              description="Try adjusting your search terms or selecting a different category filter."
              actionTitle="Clear Filters"
              onAction={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSoft,
    borderRadius: Radius.md,
    marginHorizontal: Spacing.base,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    height: 44,
    borderWidth: 1,
    borderColor: Colors.hairline,
  },
  searchIcon: {
    marginRight: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    ...Typography.bodyMd,
    color: Colors.ink,
  },
  pillsContainer: {
    marginVertical: Spacing.sm,
  },
  pillsList: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.xs,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surfaceSoft,
    borderWidth: 1,
    borderColor: Colors.hairlineSoft,
  },
  pillSelected: {
    backgroundColor: Colors.ink,
    borderColor: Colors.ink,
  },
  pillText: {
    ...Typography.caption,
    color: Colors.body,
    fontWeight: '600',
  },
  pillTextSelected: {
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
    padding: 0,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 160,
    backgroundColor: Colors.surfaceSoft,
  },
  cardContent: {
    padding: Spacing.base,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  categoryBadge: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: Colors.muted,
  },
  cardTitle: {
    ...Typography.titleSm,
    color: Colors.ink,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardDesc: {
    ...Typography.bodySm,
    color: Colors.body,
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.hairlineSoft,
    paddingTop: Spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  metaText: {
    ...Typography.caption,
    color: Colors.body,
    fontSize: 12,
  },
  qtyBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.xs,
  },
  qtyBadgeText: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.primary,
  },
});


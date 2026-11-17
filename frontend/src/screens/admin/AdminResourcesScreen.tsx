import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { resourceService, Resource } from '../../services/resourceService';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { ProfileAvatar } from '../../components/common/ProfileAvatar';
import { useAuth } from '../../context/AuthContext';

interface AdminResourcesScreenProps {
  onAddNewResource: () => void;
  onEditResource: (resource: Resource) => void;
  onNavigateToProfile?: () => void;
}

export const AdminResourcesScreen: React.FC<AdminResourcesScreenProps> = ({
  onAddNewResource,
  onEditResource,
  onNavigateToProfile,
}) => {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchResources();
  }, [search]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const res = await resourceService.getResources({
        search: search.trim() || undefined,
      });
      setResources(res.data.resources || []);
    } catch (e) {
      console.warn('[Admin Resources Error]:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchResources();
  };

  const handleToggleStatus = (resource: Resource) => {
    Alert.alert(
      'Update Operational Status',
      `Change operational status for "${resource.name}"`,
      [
        {
          text: 'Available',
          onPress: async () => {
            await resourceService.updateResourceStatus(resource._id, 'available');
            fetchResources();
          },
        },
        {
          text: 'Maintenance',
          onPress: async () => {
            await resourceService.updateResourceStatus(resource._id, 'maintenance');
            fetchResources();
          },
        },
        {
          text: 'Inactive',
          onPress: async () => {
            await resourceService.updateResourceStatus(resource._id, 'inactive');
            fetchResources();
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleArchive = (resource: Resource) => {
    Alert.alert(
      'Archive Resource',
      `Are you sure you want to archive "${resource.name}"? It will no longer be available for student booking requests.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          style: 'destructive',
          onPress: async () => {
            try {
              await resourceService.archiveResource(resource._id);
              fetchResources();
            } catch (err: any) {
              Alert.alert('Archive Error', err.message);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Resource }) => (
    <Card style={styles.card}>
      <View style={styles.cardHeaderRow}>
        <Image source={{ uri: item.imageUrl }} style={styles.thumb} resizeMode="cover" />
        <View style={styles.headerInfo}>
          <View style={styles.badgeRow}>
            <Text style={styles.catLabel}>{item.category.toUpperCase()}</Text>
            <Badge status={item.operationalStatus} size="sm" />
          </View>
          <Text style={styles.nameText} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.locationText}>
            {item.location} • {item.department}
          </Text>
        </View>
      </View>

      <View style={styles.inventoryRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={styles.invText}>Units:</Text>
          <Text
            style={{
              fontWeight: '700',
              color: (item.availableQuantity ?? item.totalQuantity) > 0 ? Colors.semanticUp : Colors.semanticDown,
              fontSize: 13,
            }}>
            {item.availableQuantity ?? item.totalQuantity} / {item.totalQuantity} Available
          </Text>
        </View>
        <Text style={styles.invText}>Condition: {item.condition}</Text>
      </View>

      <View style={styles.cardActions}>
        <Button
          title="Status"
          onPress={() => handleToggleStatus(item)}
          variant="outline"
          size="sm"
          style={styles.actionBtn}
        />
        <Button
          title="Edit"
          onPress={() => onEditResource(item)}
          variant="secondary"
          size="sm"
          style={styles.actionBtn}
        />
        <Button
          title="Archive"
          onPress={() => handleArchive(item)}
          variant="outline"
          size="sm"
          textStyle={{ color: Colors.semanticDown }}
          style={styles.actionBtn}
        />
      </View>
    </Card>
  );

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.topBar}>
        <View style={{ flex: 1, marginRight: Spacing.sm }}>
          <Text style={styles.title}>Resource Inventory</Text>
          <Text style={styles.subtitle} numberOfLines={1}>Manage campus equipment and room facilities</Text>
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
          placeholder="Filter resources by name, location..."
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

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={resources}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <EmptyState
              icon="cube-outline"
              title="No resources found"
              description="No resources match your search criteria."
              actionTitle="Add New Resource"
              onAction={onAddNewResource}
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
  topBar: {
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSoft,
    borderWidth: 1,
    borderColor: Colors.hairline,
    borderRadius: Radius.md,
    marginHorizontal: Spacing.base,
    marginVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    height: 44,
  },
  searchInput: {
    flex: 1,
    ...Typography.bodyMd,
    color: Colors.ink,
    marginLeft: Spacing.xs,
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
  cardHeaderRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceSoft,
  },
  headerInfo: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  catLabel: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: Colors.muted,
  },
  nameText: {
    ...Typography.titleSm,
    color: Colors.ink,
    fontWeight: '700',
  },
  locationText: {
    ...Typography.caption,
    color: Colors.body,
    marginTop: 2,
  },
  inventoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceSoft,
    borderRadius: Radius.sm,
    padding: Spacing.xs,
    marginVertical: Spacing.xs,
  },
  invText: {
    ...Typography.caption,
    color: Colors.body,
  },
  cardActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  actionBtn: {
    flex: 1,
  },
});


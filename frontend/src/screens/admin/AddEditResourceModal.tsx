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
  Switch,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Resource, resourceService } from '../../services/resourceService';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

interface AddEditResourceModalProps {
  visible: boolean;
  resource: Resource | null; // if null, creating new
  onClose: () => void;
  onSaved: () => void;
}

const CATEGORIES: Resource['category'][] = [
  'Electronics',
  'Laboratory Equipment',
  'Sports Equipment',
  'Rooms and Facilities',
  'Other Resources',
];

const CONDITIONS: Resource['condition'][] = ['New', 'Good', 'Fair', 'Maintenance Required'];

export const AddEditResourceModal: React.FC<AddEditResourceModalProps> = ({
  visible,
  resource,
  onClose,
  onSaved,
}) => {
  const isEditing = !!resource;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Resource['category']>('Electronics');
  const [totalQuantity, setTotalQuantity] = useState('1');
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('');
  const [condition, setCondition] = useState<Resource['condition']>('Good');
  const [operationalStatus, setOperationalStatus] = useState<Resource['operationalStatus']>('available');
  const [requiresIssueReturn, setRequiresIssueReturn] = useState(true);
  const [imageUrl, setImageUrl] = useState('');

  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (resource) {
      setName(resource.name);
      setDescription(resource.description);
      setCategory(resource.category);
      setTotalQuantity(resource.totalQuantity.toString());
      setDepartment(resource.department);
      setLocation(resource.location);
      setCondition(resource.condition);
      setOperationalStatus(resource.operationalStatus);
      setRequiresIssueReturn(resource.requiresIssueReturn);
      setImageUrl(resource.imageUrl || '');
    } else {
      setName('');
      setDescription('');
      setCategory('Electronics');
      setTotalQuantity('1');
      setDepartment('');
      setLocation('');
      setCondition('Good');
      setOperationalStatus('available');
      setRequiresIssueReturn(true);
      setImageUrl('');
    }
    setError(null);
  }, [resource, visible]);

  // Direct Image Capture / Picker without popups
  const handlePickImage = async (useCamera: boolean) => {
    try {
      setError(null);
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          const msg = 'Camera permission is required to take photos of resources.';
          setError(msg);
          Alert.alert('Permission Required', msg);
          return;
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          const msg = 'Media library permission is required to select photos.';
          setError(msg);
          Alert.alert('Permission Required', msg);
          return;
        }
      }

      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ['images'],
        allowsEditing: false, // Directly use taken/picked photo without crop/edit popup
        quality: 0.7,
        base64: true,
      };

      const result = useCamera
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        // Instantly display preview of selected/captured image
        if (asset.uri) {
          setImageUrl(asset.uri);
        }

        if (asset.base64) {
          setUploadingImage(true);
          const base64DataUri = `data:image/jpeg;base64,${asset.base64}`;
          
          // Directly upload to Cloudinary via backend without popups
          const uploadRes = await resourceService.uploadImage(base64DataUri);
          if (uploadRes.data?.imageUrl) {
            setImageUrl(uploadRes.data.imageUrl);
          }
        }
      }
    } catch (err: any) {
      console.warn('Image picker error:', err);
      const errMsg = err.message || 'Image upload failed. You can paste an image URL directly.';
      setError(errMsg);
      // Only show popup when upload fails
      Alert.alert('Upload Failed', errMsg);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !description.trim() || !department.trim() || !location.trim()) {
      setError('Please fill in all mandatory text fields.');
      return;
    }

    const qty = parseInt(totalQuantity, 10);
    if (isNaN(qty) || qty < 1) {
      setError('Total quantity must be a positive integer.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const payload: Partial<Resource> = {
        name: name.trim(),
        description: description.trim(),
        category,
        totalQuantity: qty,
        department: department.trim(),
        location: location.trim(),
        condition,
        operationalStatus,
        requiresIssueReturn,
        imageUrl: imageUrl.trim() || undefined,
      };

      if (isEditing && resource) {
        await resourceService.updateResource(resource._id, payload);
      } else {
        await resourceService.createResource(payload);
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save resource.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
          style={{ flex: 1 }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={Colors.ink} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{isEditing ? 'Edit Resource' : 'Add New Resource'}</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            showsVerticalScrollIndicator={false}>
            {error && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={18} color={Colors.semanticDown} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Direct Image Capture with Cloudinary */}
            <Text style={styles.label}>Resource Photo </Text>
            <View style={styles.photoSection}>
              {imageUrl ? (
                <View style={styles.previewContainer}>
                  <Image source={{ uri: imageUrl }} style={styles.imagePreview} resizeMode="cover" />
                  {uploadingImage && (
                    <View style={styles.uploadingOverlay}>
                      <ActivityIndicator size="small" color="#ffffff" />
                      <Text style={styles.uploadingOverlayText}>Uploading to Cloudinary...</Text>
                    </View>
                  )}
                  {!uploadingImage && (
                    <TouchableOpacity onPress={() => setImageUrl('')} style={styles.removeImageBtn}>
                      <Ionicons name="close-circle" size={22} color={Colors.semanticDown} />
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <View style={styles.noPhotoPlaceholder}>
                  <Ionicons name="camera-outline" size={36} color={Colors.muted} />
                  <Text style={styles.noPhotoText}>No image selected yet</Text>
                </View>
              )}

              <View style={styles.imageButtonsRow}>
                <Button
                  title={uploadingImage ? 'Uploading...' : 'Take Photo'}
                  onPress={() => handlePickImage(true)}
                  variant="primary"
                  size="sm"
                  disabled={uploadingImage}
                  icon={<Ionicons name="camera" size={16} color="#ffffff" />}
                  style={{ flex: 1 }}
                />
                <Button
                  title="Choose Gallery"
                  onPress={() => handlePickImage(false)}
                  variant="outline"
                  size="sm"
                  disabled={uploadingImage}
                  icon={<Ionicons name="images-outline" size={16} color={Colors.ink} />}
                  style={{ flex: 1 }}
                />
              </View>
            </View>

            <Input
              label="Or Image URL"
              placeholder="https://images.unsplash.com/..."
              value={imageUrl}
              onChangeText={setImageUrl}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Input label="Resource Name *" placeholder="e.g. Dell Precision Workstation" value={name} onChangeText={setName} />

            <Input
              label="Description *"
              placeholder="Technical specs, accessories included, instructions..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />

            {/* Category Selector */}
            <Text style={styles.label}>Category *</Text>
            <View style={styles.pillsWrap}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={[styles.pill, category === cat ? styles.pillSelected : undefined]}>
                  <Text style={[styles.pillText, category === cat ? styles.pillTextSelected : undefined]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Input
              label="Total Quantity In Inventory *"
              placeholder="e.g. 5"
              value={totalQuantity}
              onChangeText={setTotalQuantity}
              keyboardType="number-pad"
            />

            <Input
              label="Custodian Department *"
              placeholder="e.g. Computer Science Lab"
              value={department}
              onChangeText={setDepartment}
            />

            <Input
              label="Storage Location / Room *"
              placeholder="e.g. Room 402, Technology Building"
              value={location}
              onChangeText={setLocation}
            />

            {/* Condition Selector */}
            <Text style={styles.label}>Condition</Text>
            <View style={styles.pillsWrap}>
              {CONDITIONS.map((cond) => (
                <TouchableOpacity
                  key={cond}
                  onPress={() => setCondition(cond)}
                  style={[styles.pill, condition === cond ? styles.pillSelected : undefined]}>
                  <Text style={[styles.pillText, condition === cond ? styles.pillTextSelected : undefined]}>
                    {cond}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Requires physical issue & return */}
            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchTitle}>Physical Issue & Return Required</Text>
                <Text style={styles.switchSubtitle}>
                  Enable for borrowable hardware/kits; disable for seminar rooms.
                </Text>
              </View>
              <Switch
                value={requiresIssueReturn}
                onValueChange={setRequiresIssueReturn}
                trackColor={{ false: Colors.hairline, true: Colors.primary }}
              />
            </View>

            <Button
              title={isEditing ? 'Save Changes' : 'Create Resource'}
              onPress={handleSave}
              loading={saving}
              size="lg"
              style={styles.saveBtn}
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
    fontWeight: '700',
    color: Colors.ink,
  },
  content: {
    padding: Spacing.base,
    paddingBottom: 220,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fee2e2',
    borderRadius: Radius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.base,
    gap: 8,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.semanticDown,
    flex: 1,
  },
  label: {
    ...Typography.bodySm,
    fontWeight: '600',
    color: Colors.ink,
    marginBottom: Spacing.xs,
    marginTop: Spacing.xs,
  },
  photoSection: {
    backgroundColor: Colors.surfaceSoft,
    borderRadius: Radius.md,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.hairlineSoft,
    marginBottom: Spacing.base,
  },
  previewContainer: {
    position: 'relative',
    height: 160,
    borderRadius: Radius.md,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: Colors.canvas,
    borderRadius: 12,
  },
  noPhotoPlaceholder: {
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.hairline,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
  },
  noPhotoText: {
    ...Typography.caption,
    color: Colors.muted,
    marginTop: 4,
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  uploadingOverlayText: {
    ...Typography.caption,
    color: '#ffffff',
    fontWeight: '600',
  },
  uploadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  uploadingText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
  imageButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  pillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.base,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
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
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSoft,
    borderRadius: Radius.md,
    padding: Spacing.base,
    marginBottom: Spacing.base,
  },
  switchTitle: {
    ...Typography.bodySm,
    fontWeight: '600',
    color: Colors.ink,
  },
  switchSubtitle: {
    ...Typography.caption,
    color: Colors.body,
    marginTop: 2,
  },
  saveBtn: {
    marginTop: Spacing.sm,
  },
});

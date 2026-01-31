import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Card,
  Text,
  Button,
  useTheme,
  TextInput,
  Menu,
  Divider,
  Chip,
  ActivityIndicator,
} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import apiClient from '../../services/apiClient';

const ComplaintCreateScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const { orderId, customerId } = route.params || {};
  
  const [formData, setFormData] = useState({
    category: '',
    subject: '',
    description: '',
    priority: 'Medium',
    orderId: orderId || '',
    tags: [],
  });
  
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);
  const [priorityMenuVisible, setPriorityMenuVisible] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const categories = [
    'Product Quality',
    'Delivery Issue',
    'Customer Service',
    'Payment Issue',
    'Return/Refund',
    'Website/App Issue',
    'Other',
  ];

  const priorities = ['Low', 'Medium', 'High', 'Critical'];

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove),
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.subject || formData.subject.trim().length < 5) {
      newErrors.subject = 'Subject must be at least 5 characters';
    }

    if (!formData.description || formData.description.trim().length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields correctly');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        category: formData.category,
        subject: formData.subject.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
      };

      if (formData.orderId) {
        payload.orderId = formData.orderId;
      }

      if (formData.tags.length > 0) {
        payload.tags = formData.tags;
      }

      const response = await apiClient.post('http://192.168.0.4:5004/api/complaints', payload);

      if (response.ok) {
        const data = await response.json();
        Alert.alert('Success', 'Complaint created successfully', [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
            },
          },
        ]);
      } else {
        const error = await response.json().catch(() => ({}));
        Alert.alert('Error', error.message || 'Failed to create complaint');
      }
    } catch (err) {
      console.error('Error creating complaint:', err);
      Alert.alert('Error', 'Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={styles.formCard} mode="elevated">
        <Card.Title
          title="New Complaint"
          subtitle="Fill in the details below"
          left={(props) => <MaterialCommunityIcons name="alert-circle-outline" {...props} />}
        />
        <Card.Content>
          {/* Category Dropdown */}
          <Menu
            visible={categoryMenuVisible}
            onDismiss={() => setCategoryMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setCategoryMenuVisible(true)}
                style={styles.dropdownButton}
                contentStyle={styles.dropdownContent}
                icon="tag"
              >
                {formData.category || 'Select Category *'}
              </Button>
            }
          >
            {categories.map((category) => (
              <Menu.Item
                key={category}
                onPress={() => {
                  setFormData({ ...formData, category });
                  setCategoryMenuVisible(false);
                  setErrors({ ...errors, category: undefined });
                }}
                title={category}
              />
            ))}
          </Menu>
          {errors.category && (
            <Text style={styles.errorText}>{errors.category}</Text>
          )}

          {/* Priority Dropdown */}
          <Menu
            visible={priorityMenuVisible}
            onDismiss={() => setPriorityMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setPriorityMenuVisible(true)}
                style={styles.dropdownButton}
                contentStyle={styles.dropdownContent}
                icon="alert-circle"
              >
                Priority: {formData.priority}
              </Button>
            }
          >
            {priorities.map((priority) => (
              <Menu.Item
                key={priority}
                onPress={() => {
                  setFormData({ ...formData, priority });
                  setPriorityMenuVisible(false);
                }}
                title={priority}
              />
            ))}
          </Menu>

          {/* Order ID (Optional) */}
          <TextInput
            label="Order ID (Optional)"
            value={formData.orderId}
            onChangeText={(text) => setFormData({ ...formData, orderId: text })}
            mode="outlined"
            style={styles.input}
            left={<TextInput.Icon icon="package" />}
            placeholder="ORD-2026-000001"
          />

          {/* Subject */}
          <TextInput
            label="Subject *"
            value={formData.subject}
            onChangeText={(text) => {
              setFormData({ ...formData, subject: text });
              setErrors({ ...errors, subject: undefined });
            }}
            mode="outlined"
            style={styles.input}
            left={<TextInput.Icon icon="text-short" />}
            placeholder="Brief description of the issue"
            error={!!errors.subject}
          />
          {errors.subject && (
            <Text style={styles.errorText}>{errors.subject}</Text>
          )}

          {/* Description */}
          <TextInput
            label="Description *"
            value={formData.description}
            onChangeText={(text) => {
              setFormData({ ...formData, description: text });
              setErrors({ ...errors, description: undefined });
            }}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={6}
            left={<TextInput.Icon icon="text" />}
            placeholder="Detailed description of the issue (minimum 20 characters)"
            error={!!errors.description}
          />
          {errors.description && (
            <Text style={styles.errorText}>{errors.description}</Text>
          )}

          {/* Tags */}
          <View style={styles.tagsContainer}>
            <Text variant="labelLarge" style={{ marginBottom: 8 }}>
              Tags (Optional)
            </Text>
            <View style={styles.tagInputRow}>
              <TextInput
                value={tagInput}
                onChangeText={setTagInput}
                mode="outlined"
                style={styles.tagInput}
                placeholder="Add tag"
                onSubmitEditing={handleAddTag}
              />
              <Button
                mode="contained"
                onPress={handleAddTag}
                style={styles.addTagButton}
                icon="plus"
              >
                Add
              </Button>
            </View>
            <View style={styles.tagsDisplay}>
              {formData.tags.map((tag) => (
                <Chip
                  key={tag}
                  mode="outlined"
                  onClose={() => handleRemoveTag(tag)}
                  style={styles.tag}
                >
                  {tag}
                </Chip>
              ))}
            </View>
          </View>

          <Divider style={styles.divider} />

          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            * Required fields
          </Text>
        </Card.Content>
      </Card>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.actionButton}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.actionButton}
          loading={loading}
          disabled={loading}
          icon="check"
        >
          Submit
        </Button>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formCard: {
    margin: 16,
  },
  dropdownButton: {
    marginTop: 8,
    marginBottom: 8,
    justifyContent: 'flex-start',
  },
  dropdownContent: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  input: {
    marginTop: 8,
    marginBottom: 8,
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: -4,
    marginBottom: 8,
    marginLeft: 12,
  },
  tagsContainer: {
    marginTop: 16,
  },
  tagInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tagInput: {
    flex: 1,
  },
  addTagButton: {
    justifyContent: 'center',
  },
  tagsDisplay: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  tag: {
    marginRight: 4,
    marginBottom: 4,
  },
  divider: {
    marginVertical: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  actionButton: {
    flex: 1,
  },
  bottomPadding: {
    height: 20,
  },
});

export default ComplaintCreateScreen;

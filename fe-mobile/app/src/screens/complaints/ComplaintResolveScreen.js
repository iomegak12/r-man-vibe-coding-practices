import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Card,
  Text,
  Button,
  TextInput,
  useTheme,
  Chip,
  Surface,
  RadioButton,
  List,
  Checkbox,
  ActivityIndicator,
} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import apiClient from '../../services/apiClient';

// Mock data - will be replaced with API calls
const mockComplaintDetails = {
  id: 'CMP-001',
  subject: 'Late Delivery',
  status: 'Open',
  priority: 'High',
  category: 'Shipping',
  customer: {
    name: 'John Doe',
    email: 'john.doe@example.com',
  },
};

const resolutionOptions = [
  {
    id: 'refund',
    title: 'Issue Refund',
    description: 'Process a full or partial refund to the customer',
    icon: 'cash-refund',
  },
  {
    id: 'replacement',
    title: 'Send Replacement',
    description: 'Send a replacement item to the customer',
    icon: 'package-variant-closed',
  },
  {
    id: 'credit',
    title: 'Store Credit',
    description: 'Provide store credit for future purchases',
    icon: 'credit-card',
  },
  {
    id: 'apology',
    title: 'Formal Apology',
    description: 'Send a formal apology and goodwill gesture',
    icon: 'email',
  },
  {
    id: 'escalate',
    title: 'Escalate to Management',
    description: 'Escalate the issue to higher management',
    icon: 'account-tie',
  },
  {
    id: 'close',
    title: 'Close Complaint',
    description: 'Mark the complaint as resolved without further action',
    icon: 'check-circle',
  },
];

const ComplaintResolveScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const { complaintId } = route.params;
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);

  // Form state
  const [selectedResolution, setSelectedResolution] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [notifyCustomer, setNotifyCustomer] = useState(true);
  const [internalNotes, setInternalNotes] = useState('');

  useEffect(() => {
    const fetchComplaintDetails = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(`http://192.168.0.4:5004/api/complaints/${complaintId}`);
        if (response.ok) {
          const data = await response.json();
          setComplaint(data.data || data);
        } else {
          const errText = await response.text();
          console.error('Failed to load complaint:', response.status, errText);
          Alert.alert('Error', 'Failed to load complaint details');
        }
      } catch (error) {
        console.error('Error fetching complaint details:', error);
        Alert.alert('Error', 'Network error: ' + error.message);
      }
      setLoading(false);
    };

    fetchComplaintDetails();
  }, [complaintId]);

  const handleResolve = async () => {
    if (!resolutionNotes.trim()) {
      Alert.alert('Notes Required', 'Please provide resolution notes (20-2000 characters).');
      return;
    }

    if (resolutionNotes.trim().length < 20 || resolutionNotes.trim().length > 2000) {
      Alert.alert('Invalid Length', 'Resolution notes must be between 20 and 2000 characters.');
      return;
    }

    setResolving(true);
    try {
      const resolutionData = {
        resolutionNotes: resolutionNotes.trim(),
      };

      // Add tags if internal notes provided
      if (internalNotes.trim()) {
        resolutionData.tags = [internalNotes.trim()];
      }

      const response = await apiClient.post(
        `http://192.168.0.4:5004/api/complaints/${complaintId}/resolve`,
        resolutionData
      );

      if (response.ok) {
        Alert.alert(
          'Success',
          `Complaint ${complaint.complaintId || complaint.id} has been resolved`,
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        const error = await response.json().catch(() => ({}));
        Alert.alert('Error', error.message || 'Failed to resolve complaint');
      }
    } catch (error) {
      console.error('Error resolving complaint:', error);
      Alert.alert('Error', 'Network error: ' + error.message);
    } finally {
      setResolving(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Discard Resolution',
      'Are you sure you want to cancel? Any entered information will be lost.',
      [
        { text: 'Keep Resolving', style: 'cancel' },
        { text: 'Discard', onPress: () => navigation.goBack() },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Loading complaint details...</Text>
      </View>
    );
  }

  if (!complaint) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.colors.background }]}>
        <Text>Complaint not found</Text>
        <Button onPress={() => navigation.goBack()}>Go Back</Button>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        {/* Complaint Info */}
        <Card style={styles.complaintCard} mode="elevated">
          <Card.Content>
            <Text variant="headlineSmall" style={{ fontWeight: 'bold', marginBottom: 8 }}>
              Resolve Complaint {complaint.complaintId || complaint.id}
            </Text>
            <Text variant="titleMedium" style={{ marginBottom: 4 }}>
              {complaint.subject}
            </Text>
            <View style={styles.complaintMeta}>
              <Chip mode="flat" style={{ backgroundColor: '#FF9800', marginRight: 8 }}>
                {complaint.status}
              </Chip>
              <Chip mode="outlined" style={{ borderColor: '#F44336' }}>
                {complaint.priority} Priority
              </Chip>
            </View>
            {(complaint.customerName || complaint.customer?.name) && (
              <Text variant="bodyMedium" style={{ marginTop: 8, color: theme.colors.onSurfaceVariant }}>
                Customer: {complaint.customerName || complaint.customer?.name}
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Resolution Options */}
        <Card style={styles.sectionCard} mode="elevated">
          <Card.Title
            title="Select Resolution Method"
            left={(props) => <MaterialCommunityIcons name="check-circle" {...props} />}
          />
          <Card.Content>
            {resolutionOptions.map((option) => (
              <View key={option.id} style={styles.optionContainer}>
                <View style={styles.optionHeader}>
                  <View style={styles.optionInfo}>
                    <MaterialCommunityIcons
                      name={option.icon}
                      size={24}
                      color={theme.colors.onSurfaceVariant}
                      style={{ marginRight: 12 }}
                    />
                    <View style={styles.optionText}>
                      <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                        {option.title}
                      </Text>
                      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                        {option.description}
                      </Text>
                    </View>
                  </View>
                  <RadioButton
                    value={option.id}
                    status={selectedResolution === option.id ? 'checked' : 'unchecked'}
                    onPress={() => setSelectedResolution(option.id)}
                  />
                </View>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Resolution Notes */}
        <Card style={styles.sectionCard} mode="elevated">
          <Card.Title
            title="Resolution Notes"
            left={(props) => <MaterialCommunityIcons name="note-text" {...props} />}
          />
          <Card.Content>
            <TextInput
              label="Notes for Customer (Required)"
              value={resolutionNotes}
              onChangeText={setResolutionNotes}
              multiline
              numberOfLines={4}
              style={styles.input}
              placeholder="Explain the resolution to the customer..."
            />
          </Card.Content>
        </Card>

        {/* Internal Notes */}
        <Card style={styles.sectionCard} mode="elevated">
          <Card.Title
            title="Internal Notes (Optional)"
            left={(props) => <MaterialCommunityIcons name="note-text-outline" {...props} />}
          />
          <Card.Content>
            <TextInput
              label="Internal Notes"
              value={internalNotes}
              onChangeText={setInternalNotes}
              multiline
              numberOfLines={3}
              style={styles.input}
              placeholder="Add any internal notes for the team..."
            />
          </Card.Content>
        </Card>

        {/* Notification Settings */}
        <Card style={styles.sectionCard} mode="elevated">
          <Card.Title
            title="Notification Settings"
            left={(props) => <MaterialCommunityIcons name="bell" {...props} />}
          />
          <Card.Content>
            <View style={styles.checkboxContainer}>
              <Checkbox
                status={notifyCustomer ? 'checked' : 'unchecked'}
                onPress={() => setNotifyCustomer(!notifyCustomer)}
              />
              <View style={styles.checkboxText}>
                <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                  Notify Customer
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Send resolution details to {complaint.customer.email}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Action Buttons */}
      <Surface style={styles.actionBar} elevation={4}>
        <Button
          mode="outlined"
          onPress={handleCancel}
          style={styles.cancelButton}
          disabled={resolving}
        >
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={handleResolve}
          style={styles.resolveButton}
          loading={resolving}
          disabled={resolving || !selectedResolution || !resolutionNotes.trim()}
        >
          Resolve Complaint
        </Button>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  complaintCard: {
    margin: 16,
    marginBottom: 8,
  },
  complaintMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  optionContainer: {
    marginBottom: 16,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionText: {
    flex: 1,
  },
  input: {
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkboxText: {
    flex: 1,
    marginLeft: 8,
  },
  bottomPadding: {
    height: 100,
  },
  actionBar: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 24,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  resolveButton: {
    flex: 1,
    marginLeft: 8,
  },
});

export default ComplaintResolveScreen;
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Card,
  Text,
  Button,
  useTheme,
  Chip,
  Surface,
  IconButton,
  Divider,
  List,
  Avatar,
  ActivityIndicator,
} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import apiClient from '../../services/apiClient';

// Mock data - will be replaced with API calls
const mockComplaintDetails = {
  id: 'CMP-001',
  customer: {
    id: 'CUST-001',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    avatar: null,
  },
  subject: 'Late Delivery',
  description: 'I ordered my package on January 10th and was told it would arrive by January 15th. It is now January 16th and I still haven\'t received my order. The tracking information shows it was delivered but I never received it. Please help me resolve this issue.',
  status: 'Open',
  priority: 'High',
  category: 'Shipping',
  createdDate: '2024-01-15T10:30:00Z',
  lastUpdated: '2024-01-16T14:20:00Z',
  assignedTo: null,
  orderReference: 'ORD-001',
  attachments: [],
  conversation: [
    {
      id: 'msg-1',
      sender: 'Customer',
      senderName: 'John Doe',
      message: 'I ordered my package on January 10th and was told it would arrive by January 15th. It is now January 16th and I still haven\'t received my order. The tracking information shows it was delivered but I never received it. Please help me resolve this issue.',
      timestamp: '2024-01-15T10:30:00Z',
      isInternal: false,
    },
    {
      id: 'msg-2',
      sender: 'Support',
      senderName: 'Support Team',
      message: 'Thank you for reaching out. I apologize for the inconvenience. Let me check the tracking information for your order ORD-001. I\'ll get back to you within 24 hours with an update.',
      timestamp: '2024-01-15T11:45:00Z',
      isInternal: false,
    },
    {
      id: 'msg-3',
      sender: 'Support',
      senderName: 'Support Team',
      message: 'Internal note: Contacted shipping carrier. They confirmed the package was delivered to the wrong address. Working on resolution.',
      timestamp: '2024-01-16T09:30:00Z',
      isInternal: true,
    },
    {
      id: 'msg-4',
      sender: 'Support',
      senderName: 'Support Team',
      message: 'Hi John, I\'ve investigated your order and found that the package was unfortunately delivered to the wrong address. We\'ve arranged for a replacement to be sent out immediately. You should receive it within 2-3 business days. We apologize for this inconvenience.',
      timestamp: '2024-01-16T14:20:00Z',
      isInternal: false,
    },
  ],
};

const MessageBubble = ({ message, theme }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isCustomer = message.sender === 'Customer';

  return (
    <View style={[
      styles.messageContainer,
      isCustomer ? styles.customerMessage : styles.supportMessage
    ]}>
      <View style={styles.messageHeader}>
        <Text variant="bodySmall" style={{ fontWeight: 'bold' }}>
          {message.senderName}
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {formatDate(message.timestamp)}
        </Text>
      </View>
      {message.isInternal && (
        <Chip
          mode="flat"
          style={{ backgroundColor: '#FFF3E0', alignSelf: 'flex-start', marginBottom: 4 }}
          textStyle={{ color: '#E65100', fontSize: 10 }}
        >
          Internal Note
        </Chip>
      )}
      <Text variant="bodyMedium" style={styles.messageText}>
        {message.message}
      </Text>
    </View>
  );
};

const ComplaintDetailsScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const { complaintId } = route.params;
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaintDetails = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(`http://192.168.0.4:5004/api/complaints/${complaintId}`);
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched complaint details:', data);
          setComplaint(data.data || data);
        } else {
          const errText = await response.text();
          console.error('Failed to load complaint details:', response.status, errText);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return '#FF9800';
      case 'In Progress': return '#2196F3';
      case 'Resolved': return '#4CAF50';
      case 'Closed': return '#757575';
      default: return '#757575';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return '#F44336';
      case 'Medium': return '#FF9800';
      case 'Low': return '#4CAF50';
      default: return '#757575';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleAssignComplaint = () => {
    navigation.navigate('ComplaintAssign', { complaintId: complaint.complaintId || complaint.id });
  };

  const handleResolveComplaint = () => {
    navigation.navigate('ComplaintResolve', { complaintId: complaint.complaintId || complaint.id });
  };

  const handleReply = () => {
    // TODO: Implement reply functionality
    Alert.alert('Reply', 'Reply functionality will be implemented');
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
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Complaint Header */}
      <Card style={styles.headerCard} mode="elevated">
        <Card.Content>
          <View style={styles.headerRow}>
            <View style={styles.complaintInfo}>
              <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>
                {complaint.complaintId || complaint.id}
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Created on {formatDate(complaint.createdAt || complaint.createdDate)}
              </Text>
            </View>
            <View style={styles.statusContainer}>
              <Chip
                mode="flat"
                style={{ backgroundColor: getStatusColor(complaint.status), marginBottom: 4 }}
                textStyle={{ color: 'white' }}
              >
                {complaint.status}
              </Chip>
              <Chip
                mode="outlined"
                style={{ borderColor: getPriorityColor(complaint.priority) }}
                textStyle={{ color: getPriorityColor(complaint.priority) }}
              >
                {complaint.priority}
              </Chip>
            </View>
          </View>
          <Text variant="titleLarge" style={{ fontWeight: 'bold', marginTop: 16 }}>
            {complaint.subject}
          </Text>
        </Card.Content>
      </Card>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {!(complaint.assignedTo || complaint.assignedToName) && (
          <Button
            mode="contained"
            onPress={handleAssignComplaint}
            style={styles.actionButton}
            icon="account-plus"
          >
            Assign
          </Button>
        )}
        <Button
          mode="outlined"
          onPress={handleReply}
          style={styles.actionButton}
          icon="reply"
        >
          Reply
        </Button>
        {complaint.status !== 'Resolved' && complaint.status !== 'Closed' && (
          <Button
            mode="contained"
            onPress={handleResolveComplaint}
            style={styles.actionButton}
            icon="check-circle"
          >
            Resolve
          </Button>
        )}
      </View>

      {/* Customer Information */}
      <Card style={styles.sectionCard} mode="elevated">
        <Card.Title
          title="Customer Information"
          left={(props) => <MaterialCommunityIcons name="account" {...props} />}
        />
        <Card.Content>
          <View style={styles.customerRow}>
            <Avatar.Text
              size={40}
              label={(complaint.customerName || complaint.customer?.name || 'U').split(' ').map(n => n[0]).join('')}
              style={{ marginRight: 12 }}
            />
            <View style={styles.customerInfo}>
              <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                {complaint.customerName || complaint.customer?.name || 'Unknown'}
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {complaint.customerEmail || complaint.customer?.email || 'N/A'}
              </Text>
              {(complaint.customer?.phone) && (
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  {complaint.customer.phone}
                </Text>
              )}
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Complaint Details */}
      <Card style={styles.sectionCard} mode="elevated">
        <Card.Title
          title="Complaint Details"
          left={(props) => <MaterialCommunityIcons name="information" {...props} />}
        />
        <Card.Content>
          <List.Item
            title={complaint.category}
            description="Category"
            left={(props) => <List.Icon {...props} icon="tag" />}
          />
          <Divider />
          <List.Item
            title={complaint.priority}
            description="Priority"
            left={(props) => <List.Icon {...props} icon="alert-circle" />}
          />
          <Divider />
          {(complaint.orderId || complaint.orderReference) && (
            <>
              <List.Item
                title={complaint.orderId || complaint.orderReference}
                description="Related Order (tap to view)"
                left={(props) => <List.Icon {...props} icon="package" />}
                right={(props) => <List.Icon {...props} icon="chevron-right" />}
                onPress={() => navigation.navigate('OrderDetails', { orderId: complaint.orderId || complaint.orderReference })}
              />
              <Divider />
            </>
          )}
          <List.Item
            title={formatDate(complaint.updatedAt || complaint.lastUpdated)}
            description="Last Updated"
            left={(props) => <List.Icon {...props} icon="update" />}
          />
          {(complaint.assignedToName || complaint.assignedTo) && (
            <>
              <Divider />
              <List.Item
                title={complaint.assignedToName || complaint.assignedTo}
                description="Assigned To"
                left={(props) => <List.Icon {...props} icon="account-check" />}
              />
            </>
          )}
        </Card.Content>
      </Card>

      {/* Description */}
      <Card style={styles.sectionCard} mode="elevated">
        <Card.Title
          title="Description"
          left={(props) => <MaterialCommunityIcons name="text" {...props} />}
        />
        <Card.Content>
          <Text variant="bodyMedium">{complaint.description}</Text>
        </Card.Content>
      </Card>

      {/* Conversation */}
      {complaint.conversation && complaint.conversation.length > 0 && (
        <Card style={styles.sectionCard} mode="elevated">
          <Card.Title
            title="Conversation"
            left={(props) => <MaterialCommunityIcons name="message" {...props} />}
          />
          <Card.Content>
            {complaint.conversation.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                theme={theme}
              />
            ))}
          </Card.Content>
        </Card>
      )}

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
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
  headerCard: {
    margin: 16,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  complaintInfo: {
    flex: 1,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  sectionCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerInfo: {
    flex: 1,
  },
  messageContainer: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
  },
  customerMessage: {
    backgroundColor: '#E3F2FD',
    alignSelf: 'flex-start',
    marginRight: '20%',
  },
  supportMessage: {
    backgroundColor: '#F5F5F5',
    alignSelf: 'flex-end',
    marginLeft: '20%',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  messageText: {
    lineHeight: 20,
  },
  bottomPadding: {
    height: 32,
  },
});

export default ComplaintDetailsScreen;
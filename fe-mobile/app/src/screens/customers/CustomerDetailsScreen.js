import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import { ScrollView, View, StyleSheet, Alert } from 'react-native';
import {
  Card,
  Text,
  Button,
  useTheme,
  Avatar,
  IconButton,
  Chip,
  Divider,
  Surface,
} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// Mock customer data - will be replaced with API call
// ...existing code...

const CustomerDetailsScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const { customerId } = route.params;
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomer = async () => {
      console.log('Fetching customer details for:', customerId);
      setLoading(true);
      setError(null);
      try {
        // Replace with your actual API endpoint
        const response = await apiClient.get(`http://192.168.0.4:5002/api/customers/${customerId}`);
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched customer details:', data);
          setCustomer(data.data);
        } else {
          const errText = await response.text();
          console.error('Failed to load customer details:', response.status, errText);
          setError('Failed to load customer details');
        }
      } catch (err) {
        console.error('Network error fetching customer details:', err);
        setError('Network error');
      }
      setLoading(false);
    };
    fetchCustomer();
  }, [customerId]);

  const getStatusColor = (status) => {
    return status === 'Active' ? '#4CAF50' : '#F44336';
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '';
  };

  const handleEdit = () => {
    console.log('Edit requested for customerId:', customerId);
    navigation.navigate('CustomerEdit', { customerId });
  };

  const handleViewOrders = () => {
    // TODO: Navigate to customer's orders
    navigation.navigate('Orders', { 
      screen: 'OrdersList', 
      params: { customerId }
    });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Customer',
      'Are you sure you want to delete this customer? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: confirmDelete },
      ]
    );
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      const response = await apiClient.delete(`http://192.168.0.4:5002/api/customers/${customerId}`);
      if (response.ok) {
        Alert.alert('Deleted', 'Customer has been deleted', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        const data = await response.json();
        Alert.alert('Error', data.message || 'Failed to delete customer');
      }
    } catch (err) {
      console.error('Delete error:', err);
      Alert.alert('Error', 'Network error while deleting customer');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }]}> 
        <MaterialCommunityIcons name="account" size={64} color={theme.colors.onSurfaceVariant} />
        <Text variant="headlineSmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 16 }}>
          Loading customer details...
        </Text>
      </View>
    );
  }
  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }]}> 
        <Text style={{ color: theme.colors.error }}>{error}</Text>
      </View>
    );
  }
  if (!customer) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }]}> 
        <Text variant="headlineSmall" style={{ color: theme.colors.onSurfaceVariant }}>
          Customer not found
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 96 }} style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Customer Header */}
      <Surface style={styles.headerCard} elevation={2}>
        <View style={styles.headerContent}>
          <Avatar.Text
            size={80}
            label={getInitials(customer.fullName)}
            style={{ backgroundColor: theme.colors.primary }}
          />
          <View style={styles.headerInfo}>
            <Text variant="headlineMedium" style={{ fontWeight: 'bold' }}>
              {customer.fullName}
            </Text>
            <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
              {customer.email}
            </Text>
            {customer.contactNumber && (
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
                {customer.contactNumber}
              </Text>
            )}
            <View style={styles.statusContainer}>
              <Chip
                mode="flat"
                compact={true}
                style={[styles.statusChip, { backgroundColor: getStatusColor(customer.customerStatus) }]}
              >
                <Text style={styles.statusText}>
                  {(customer.customerStatus || 'UNKNOWN').toUpperCase()}
                </Text>
              </Chip>
              {customer.customerType && (
                <Chip
                  mode="outlined"
                  compact
                  style={{ marginLeft: 8 }}
                  textStyle={{ fontSize: 11 }}
                >
                  {customer.customerType}
                </Chip>
              )}
            </View>
          </View>
        </View>
      </Surface>

      {/* Spacer (action buttons moved to bottom bar) */}
      <View style={{ height: 8 }} />

      {/* Customer Information */}
      <View style={styles.section}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Contact Information
        </Text>

        <Card style={styles.infoCard} mode="elevated">
          <Card.Content>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="email" size={24} color={theme.colors.onSurfaceVariant} />
              <View style={styles.infoContent}>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Email
                </Text>
                <Text variant="bodyLarge">{customer.email}</Text>
              </View>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="phone" size={24} color={theme.colors.onSurfaceVariant} />
              <View style={styles.infoContent}>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Phone
                </Text>
                <Text variant="bodyLarge">{customer.contactNumber || 'N/A'}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </View>

      {/* Address Information */}
      {customer.address && (
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Address
          </Text>

          <Card style={styles.infoCard} mode="elevated">
            <Card.Content>
              {customer.address.street && (
                <Text variant="bodyLarge" style={{ marginBottom: 8 }}>
                  {customer.address.street}
                </Text>
              )}
              <Text variant="bodyLarge">
                {customer.address.city || ''}{customer.address.city && customer.address.state ? ', ' : ''}{customer.address.state || ''} {customer.address.zipCode || ''}
              </Text>
              {customer.address.country && (
                <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                  {customer.address.country}
                </Text>
              )}
            </Card.Content>
          </Card>
        </View>
      )}

      {/* Statistics */}
      <View style={styles.section}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Statistics
        </Text>

        <View style={styles.statsGrid}>
          <Card style={styles.statCard} mode="elevated">
            <Card.Content style={styles.statContent}>
              <MaterialCommunityIcons name="package-variant" size={32} color="#2196F3" />
              <View style={styles.statInfo}>
                <Text variant="headlineMedium" style={{ fontWeight: 'bold', fontSize: 18 }}>
                  {customer.totalOrders}
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  Total Orders
                </Text>
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.statCard} mode="elevated">
            <Card.Content style={styles.statContent}>
              <MaterialCommunityIcons name="cash" size={32} color="#4CAF50" />
              <View style={styles.statInfo}>
                <Text variant="headlineMedium" style={{ fontWeight: 'bold', fontSize: 18 }}>
                  ${(customer.totalOrderValue || 0).toFixed(2)}
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  Total Spent
                </Text>
              </View>
            </Card.Content>
          </Card>
        </View>

        <Card style={styles.infoCard} mode="elevated">
          <Card.Content>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="calendar" size={24} color={theme.colors.onSurfaceVariant} />
              <View style={styles.infoContent}>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Last Order
                </Text>
                <Text variant="bodyLarge">{customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString() : 'No orders yet'}</Text>
              </View>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="account-plus" size={24} color={theme.colors.onSurfaceVariant} />
              <View style={styles.infoContent}>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Member Since
                </Text>
                <Text variant="bodyLarge">{customer.customerSince ? new Date(customer.customerSince).toLocaleDateString() : '-'}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </View>

      {/* Bottom actions bar */}
      <View style={[styles.bottomBar, { backgroundColor: theme.colors.surface }]}> 
        <Button mode="outlined" icon="pencil" onPress={handleEdit}>
          Edit
        </Button>
        <Button mode="outlined" icon="package-variant" onPress={handleViewOrders}>
          Orders
        </Button>
        <Button mode="contained" icon="delete" onPress={handleDelete} style={{ backgroundColor: theme.colors.error }} textColor={theme.colors.onPrimary}>
          Delete
        </Button>
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerCard: {
    margin: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  statusChip: {
    height: 24,
    paddingHorizontal: 8,
    minWidth: 64,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  iconButton: {
    borderRadius: 8,
    marginHorizontal: 4,
    elevation: 0,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopColor: '#E0E0E0',
    borderTopWidth: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  infoCard: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoContent: {
    marginLeft: 12,
  },
  divider: {
    marginVertical: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    marginRight: 8,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statInfo: {
    marginLeft: 12,
  },
});

export default CustomerDetailsScreen;
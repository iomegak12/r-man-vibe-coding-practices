import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import {
  Card,
  Text,
  Searchbar,
  FAB,
  useTheme,
  Avatar,
  IconButton,
  Chip,
  Surface,
} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// ...existing code...

// Customer Card Component
const CustomerCard = ({ customer, onPress, theme }) => {
  const getStatusColor = (status) => {
    return status === 'Active' ? '#4CAF50' : '#F44336';
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Card 
      style={styles.customerCard} 
      mode="elevated"
      elevation={2}
      onPress={() => onPress(customer)}
    >
      <Card.Content style={styles.cardContent}>
        {/* Header with Avatar and Info */}
        <View style={styles.customerHeader}>
          <Avatar.Text
            size={56}
            label={getInitials(customer.fullName)}
            style={{ backgroundColor: theme.colors.primary }}
            labelStyle={{ fontSize: 20, fontWeight: 'bold' }}
          />
          <View style={styles.customerInfo}>
            <View style={styles.nameStatusRow}>
              <Text variant="titleMedium" style={styles.customerName} numberOfLines={1}>
                {customer.fullName}
              </Text>
              <Chip
                mode="flat"
                compact={true}
                style={[styles.statusChip, { backgroundColor: getStatusColor(customer.customerStatus || customer.status) }]}
              >
                <Text style={[styles.statusText, { color: 'white' }]}>
                  {(customer.customerStatus || customer.status || 'UNKNOWN').toUpperCase()}
                </Text>
              </Chip>
            </View>
            <View style={styles.contactInfo}>
              <MaterialCommunityIcons name="email" size={14} color={theme.colors.onSurfaceVariant} />
              <Text variant="bodySmall" style={styles.contactText} numberOfLines={1}>
                {customer.email}
              </Text>
            </View>
            {customer.contactNumber && (
              <View style={styles.contactInfo}>
                <MaterialCommunityIcons name="phone" size={14} color={theme.colors.onSurfaceVariant} />
                <Text variant="bodySmall" style={styles.contactText}>
                  {customer.contactNumber}
                </Text>
              </View>
            )}
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />
        </View>

        {/* Stats Section */}
        <Surface style={[styles.statsContainer, { backgroundColor: theme.colors.surfaceVariant }]} elevation={0}>
          <View style={styles.statBox}>
            <MaterialCommunityIcons name="package-variant" size={18} color={theme.colors.primary} />
            <View style={styles.statContent}>
              <Text variant="labelSmall" style={styles.statLabel}>
                Orders
              </Text>
              <Text variant="titleMedium" style={styles.statValue}>
                {customer.totalOrders || 0}
              </Text>
            </View>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <MaterialCommunityIcons name="cash" size={18} color="#4CAF50" />
            <View style={styles.statContent}>
              <Text variant="labelSmall" style={styles.statLabel}>
                Total Spent
              </Text>
              <Text variant="titleMedium" style={styles.statValue}>
                {customer.totalOrderValue != null ? `$${customer.totalOrderValue.toFixed(2)}` : '$0.00'}
              </Text>
            </View>
          </View>
        </Surface>
      </Card.Content>
    </Card>
  );
};

const CustomersListScreen = ({ navigation }) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch customers from API
  const fetchCustomers = React.useCallback(async () => {
    console.log('Fetching customers...');
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('http://192.168.0.4:5002/api/customers');
      console.log('Customer response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Customer data received:', data);
        setCustomers(data.items || []);
      } else {
        const errorText = await response.text();
        console.error('Failed to load customers:', response.status, errorText);
        setError('Failed to load customers');
      }
    } catch (err) {
      console.error('Network error:', err);
      setError('Network error: ' + err.message);
    }
    setLoading(false);
  }, []);

  // Fetch when mounted and when screen is focused
  useEffect(() => {
    fetchCustomers();
    const unsubscribe = navigation.addListener('focus', fetchCustomers);
    return unsubscribe;
  }, [fetchCustomers, navigation]);

  // Filter customers based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter(customer =>
        customer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCustomers(filtered);
    }
  }, [searchQuery, customers]);

  const handleCustomerPress = (customer) => {
    console.log('Navigating to customer:', customer.customerId);
    navigation.navigate('CustomerDetails', { customerId: customer.customerId });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    try {
      const response = await apiClient.get('http://192.168.0.4:5002/api/customers');
      if (response.ok) {
        const data = await response.json();
        setCustomers(data.items || []);
      } else {
        setError('Failed to refresh customers');
      }
    } catch (err) {
      setError('Network error');
    }
    setRefreshing(false);
  };

  const handleAddCustomer = () => {
    navigation.navigate('CustomerCreate');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search customers..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      {/* Error State */}
      {error && (
        <Surface style={{ padding: 16, margin: 16, backgroundColor: theme.colors.errorContainer }}>
          <Text style={{ color: theme.colors.error }}>{error}</Text>
        </Surface>
      )}

      {/* Loading State */}
      {loading ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="account-group" size={64} color={theme.colors.onSurfaceVariant} />
          <Text variant="headlineSmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 16 }}>
            Loading customers...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredCustomers}
          keyExtractor={(item) => item.customerId}
          renderItem={({ item }) => (
            <CustomerCard
              customer={item}
              onPress={handleCustomerPress}
              theme={theme}
            />
          )}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="account-group"
                size={64}
                color={theme.colors.onSurfaceVariant}
              />
              <Text variant="headlineSmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 16 }}>
                No customers found
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 8 }}>
                {searchQuery ? 'Try adjusting your search criteria' : 'Add your first customer to get started'}
              </Text>
            </View>
          }
        />
      )}

      {/* Add Customer FAB */}
      <FAB
        icon="plus"
        onPress={handleAddCustomer}
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="white"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchbar: {
    elevation: 2,
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  customerCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  cardContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  customerInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  nameStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  customerName: {
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  statusChip: {
    height: 22,
    paddingHorizontal: 8,
    minWidth: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  contactText: {
    marginLeft: 6,
    color: '#666',
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  statBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statContent: {
    marginLeft: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
  },
  statValue: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default CustomersListScreen;
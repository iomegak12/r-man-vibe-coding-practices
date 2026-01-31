import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import {
  Card,
  Text,
  Searchbar,
  FAB,
  useTheme,
  Chip,
  Surface,
  IconButton,
  Button,
} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// Mock data - will be replaced with API calls
const mockOrders = [
  {
    id: 'ORD-001',
    customerName: 'John Doe',
    customerEmail: 'john.doe@example.com',
    status: 'Processing',
    totalAmount: 245.99,
    orderDate: '2024-01-15T10:30:00Z',
    items: 3,
  },
  {
    id: 'ORD-002',
    customerName: 'Jane Smith',
    customerEmail: 'jane.smith@example.com',
    status: 'Shipped',
    totalAmount: 89.50,
    orderDate: '2024-01-14T14:20:00Z',
    items: 2,
  },
  {
    id: 'ORD-003',
    customerName: 'Bob Johnson',
    customerEmail: 'bob.johnson@example.com',
    status: 'Delivered',
    totalAmount: 156.75,
    orderDate: '2024-01-13T09:15:00Z',
    items: 4,
  },
  {
    id: 'ORD-004',
    customerName: 'Alice Brown',
    customerEmail: 'alice.brown@example.com',
    status: 'Pending',
    totalAmount: 67.25,
    orderDate: '2024-01-12T16:45:00Z',
    items: 1,
  },
];

// Order Card Component
const OrderCard = ({ order, onPress, theme }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Placed': return '#FF9800';
      case 'Processing': return '#2196F3';
      case 'Shipped': return '#9C27B0';
      case 'Delivered': return '#4CAF50';
      case 'Cancelled': return '#F44336';
      case 'Return Requested': return '#FFC107';
      case 'Returned': return '#795548';
      default: return '#757575';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const orderId = order.orderId || order.id;
  const total = order.totalAmount || order.totalOrderValue || 0;
  const itemsCount = order.itemCount || order.items || 0;

  return (
    <Card style={styles.orderCard} mode="elevated" onPress={() => onPress(order)}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
              {orderId}
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {order.customerName || order.customer?.name}
            </Text>
          </View>
          <Chip
            mode="flat"
            style={{ backgroundColor: getStatusColor(order.status || order.orderStatus) }}
            textStyle={{ color: 'white', fontSize: 12 }}
          >
            {(order.status || order.orderStatus || '').toUpperCase()}
          </Chip>
        </View>

        <View style={styles.orderDetails}>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="calendar" size={16} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 4 }}>
              {formatDate(order.orderDate || order.createdAt)}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="package-variant" size={16} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 4 }}>
              {itemsCount} items
            </Text>
          </View>
        </View>

        <View style={styles.orderFooter}>
          <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
            ${total.toFixed(2)}</Text>
          <IconButton
            icon="chevron-right"
            size={24}
            onPress={() => onPress(order)}
          />
        </View>
      </Card.Content>
    </Card>
  );
};

const OrdersListScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const { customerId } = route.params || {};
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = React.useCallback(async () => {
    console.log('Fetching orders...');
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('http://192.168.0.4:5003/api/admin/orders');
      console.log('Orders response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Orders data:', data);
        const items = data.items || data.data || data;
        setOrders(items || []);
      } else {
        const text = await response.text();
        console.error('Failed to load orders:', response.status, text);
        setError('Failed to load orders');
      }
    } catch (err) {
      console.error('Network error fetching orders:', err);
      setError('Network error: ' + err.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders();
    const unsub = navigation.addListener('focus', fetchOrders);
    return unsub;
  }, [fetchOrders, navigation]);

  // Filter orders based on search query and status
  useEffect(() => {
    let filtered = orders;

    // Filter by customerId if provided via route params
    if (customerId) {
      filtered = filtered.filter(order => 
        order.customerId === customerId || 
        order.customer?.customerId === customerId ||
        order.customer?.id === customerId
      );
    }

    if (statusFilter !== 'All') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  }, [searchQuery, orders, statusFilter, customerId]);

  const handleOrderPress = (order) => {
    navigation.navigate('OrderDetails', { orderId: order.orderId || order.id });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const handleAddOrder = () => {
    // TODO: Navigate to order creation screen
    // navigation.navigate('OrderCreate');
  };

  const statusOptions = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search orders..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      {/* Status Filter */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          data={statusOptions}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <Chip
              mode={statusFilter === item ? 'flat' : 'outlined'}
              onPress={() => setStatusFilter(item)}
              style={[
                styles.filterChip,
                statusFilter === item && { backgroundColor: theme.colors.primary }
              ]}
              textStyle={statusFilter === item ? { color: 'white' } : {}}
            >
              {item}
            </Chip>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
        />
      </View>

      {/* Order List */}
      {loading ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="package-variant"
            size={64}
            color={theme.colors.onSurfaceVariant}
          />
          <Text variant="headlineSmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 16 }}>
            Loading orders...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.emptyContainer}>
          <Text variant="headlineSmall" style={{ color: theme.colors.error }}>{error}</Text>
          <Button mode="contained" onPress={fetchOrders} style={{ marginTop: 12 }}>Retry</Button>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => (item.orderId || item.id)}
          renderItem={({ item }) => (
            <OrderCard
              order={item}
              onPress={handleOrderPress}
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
                name="package-variant"
                size={64}
                color={theme.colors.onSurfaceVariant}
              />
              <Text variant="headlineSmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 16 }}>
                No orders found
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 8 }}>
                {searchQuery || statusFilter !== 'All' ? 'Try adjusting your search or filter criteria' : 'Orders will appear here when customers place them'}
              </Text>
            </View>
          }
        />
      )}

      {/* Add Order FAB - Only show for admin users */}
      <FAB
        icon="plus"
        onPress={handleAddOrder}
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
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
  filterContainer: {
    marginBottom: 8,
  },
  filterList: {
    paddingHorizontal: 16,
  },
  filterChip: {
    marginRight: 8,
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  orderCard: {
    marginBottom: 12,
  },
  cardContent: {
    padding: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderDetails: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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

export default OrdersListScreen;
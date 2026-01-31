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
  Dialog,
  Portal,
  RadioButton,
  TextInput,
  ActivityIndicator,
} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import apiClient from '../../services/apiClient';

// Mock data - will be replaced with API calls
const mockOrderDetails = {
  id: 'ORD-001',
  customer: {
    id: 'CUST-001',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main St, Anytown, USA 12345',
  },
  status: 'Processing',
  orderDate: '2024-01-15T10:30:00Z',
  shippingDate: null,
  deliveryDate: null,
  totalAmount: 245.99,
  shippingCost: 10.00,
  taxAmount: 19.68,
  items: [
    {
      id: 'ITEM-001',
      name: 'Wireless Headphones',
      sku: 'WH-001',
      quantity: 1,
      unitPrice: 99.99,
      totalPrice: 99.99,
    },
    {
      id: 'ITEM-002',
      name: 'Phone Case',
      sku: 'PC-002',
      quantity: 2,
      unitPrice: 35.00,
      totalPrice: 70.00,
    },
    {
      id: 'ITEM-003',
      name: 'Screen Protector',
      sku: 'SP-003',
      quantity: 1,
      unitPrice: 76.00,
      totalPrice: 76.00,
    },
  ],
  shippingAddress: {
    name: 'John Doe',
    street: '123 Main St',
    city: 'Anytown',
    state: 'CA',
    zipCode: '12345',
    country: 'USA',
  },
  paymentMethod: 'Credit Card (**** **** **** 1234)',
  notes: 'Please handle with care - fragile items',
};

const OrderDetailsScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusDialogVisible, setStatusDialogVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(`http://192.168.0.4:5003/api/orders/${orderId}`);
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched order details:', data);
          setOrder(data.data || data);
        } else {
          const errText = await response.text();
          console.error('Failed to load order details:', response.status, errText);
          Alert.alert('Error', 'Failed to load order details');
        }
      } catch (err) {
        console.error('Error fetching order details:', err);
        Alert.alert('Error', 'Failed to load order details');
      }
      setLoading(false);
    };

    fetchOrderDetails();
  }, [orderId]);

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
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleEditOrder = () => {
    navigation.navigate('OrderEdit', { orderId: order.id });
  };

  const handleTrackOrder = () => {
    navigation.navigate('OrderTracking', { orderId: order.id });
  };

  const handleUpdateStatus = () => {
    setSelectedStatus(order.status);
    setStatusDialogVisible(true);
  };

  const submitStatusUpdate = async () => {
    if (!selectedStatus || selectedStatus === order.status) {
      setStatusDialogVisible(false);
      return;
    }
    setStatusLoading(true);
    try {
      const orderId = order.orderId || order.id;
      const response = await apiClient.patch(`http://192.168.0.4:5003/api/admin/orders/${orderId}/status`, { 
        status: selectedStatus,
        changeReason: 'Status updated by admin'
      });
      if (response.ok) {
        const data = await response.json();
        setOrder(data.data || data);
        setStatusDialogVisible(false);
      } else {
        const err = await response.json();
        Alert.alert('Error', err.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Status update error:', err);
      Alert.alert('Error', 'Network error while updating status');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleCancelOrder = () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes, cancel', style: 'destructive', onPress: confirmCancel },
      ]
    );
  };

  const confirmCancel = async () => {
    try {
      setLoading(true);
      const orderId = order.orderId || order.id;
      const response = await apiClient.post(`http://192.168.0.4:5003/api/orders/${orderId}/cancel`, {
        reason: 'Customer requested cancellation',
        reasonCategory: 'Customer Request'
      });
      if (response.ok) {
        const data = await response.json();
        setOrder(data.data || data);
        Alert.alert('Cancelled', 'Order has been cancelled successfully', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      } else {
        const err = await response.json().catch(() => ({}));
        Alert.alert('Error', err.message || 'Failed to cancel order');
      }
    } catch (err) {
      console.error('Cancel error:', err);
      Alert.alert('Error', 'Network error while cancelling order');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <Text>Loading order details...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.colors.background }]}>
        <Text>Order not found</Text>
        <Button onPress={() => navigation.goBack()}>Go Back</Button>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Order Header */}
      <Card style={styles.headerCard} mode="elevated">
        <Card.Content>
          <View style={styles.headerRow}>
            <View style={styles.orderInfo}>
              <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>
                {order.orderId || order.id}
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Ordered on {formatDate(order.orderDate)}
              </Text>
            </View>
            <Chip
              mode="flat"
              style={{ backgroundColor: getStatusColor(order.status) }}
              textStyle={{ color: 'white' }}
            >
              {order.status}
            </Chip>
          </View>
        </Card.Content>
      </Card>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <View style={styles.actionRow}>
          <Button
            mode="contained"
            onPress={handleEditOrder}
            style={styles.actionButton}
            icon="pencil"
          >
            Edit
          </Button>
          <Button
            mode="outlined"
            onPress={handleTrackOrder}
            style={styles.actionButton}
            icon="map-marker-path"
          >
            Track
          </Button>
        </View>
        <View style={styles.actionRow}>
          <Button
            mode="outlined"
            onPress={handleUpdateStatus}
            style={styles.actionButton}
            icon="refresh"
          >
            Status
          </Button>
          <Button
            mode="outlined"
            onPress={handleCancelOrder}
            style={[styles.actionButton, { borderColor: '#F44336' }]}
            icon="close-circle"
            textColor="#F44336"
          >
            Cancel
          </Button>
        </View>
        <View style={styles.actionRow}>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('Complaints', { 
              screen: 'ComplaintsList', 
              params: { orderId: order.orderId || order.id }
            })}
            style={[styles.actionButton, { width: '100%' }]}
            icon="alert-circle"
          >
            View Complaints
          </Button>
        </View>
      </View>

      {/* Customer Information */}
      <Card style={styles.sectionCard} mode="elevated">
        <Card.Title
          title="Customer Information"
          left={(props) => <MaterialCommunityIcons name="account" {...props} />}
        />
        <Card.Content>
          <List.Item
            title={order.customerName}
            description="Customer Name"
            left={(props) => <List.Icon {...props} icon="account" />}
          />
          <Divider />
          <List.Item
            title={order.customerEmail}
            description="Email Address"
            left={(props) => <List.Icon {...props} icon="email" />}
          />
        </Card.Content>
      </Card>

      {/* Order Items */}
      <Card style={styles.sectionCard} mode="elevated">
        <Card.Title
          title="Order Items"
          left={(props) => <MaterialCommunityIcons name="package-variant" {...props} />}
        />
        <Card.Content>
          {order.items && order.items.map((item, index) => (
            <View key={item.orderItemId || item.id}>
              <View style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                    {item.productName || item.name}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    SKU: {item.sku}
                  </Text>
                </View>
                <View style={styles.itemPricing}>
                  <Text variant="bodyMedium">
                    Qty: {item.quantity}
                  </Text>
                  <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                    ${(item.totalPrice || 0).toFixed(2)}
                  </Text>
                </View>
              </View>
              {index < order.items.length - 1 && <Divider style={styles.itemDivider} />}
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* Shipping Information */}
      <Card style={styles.sectionCard} mode="elevated">
        <Card.Title
          title="Shipping Information"
          left={(props) => <MaterialCommunityIcons name="truck-delivery" {...props} />}
        />
        <Card.Content>
          {order.deliveryAddress && (
            <>
              <List.Item
                title={order.deliveryAddress.fullName}
                description="Recipient"
                left={(props) => <List.Icon {...props} icon="account" />}
              />
              <Divider />
              <List.Item
                title={order.deliveryAddress.phoneNumber}
                description="Contact Number"
                left={(props) => <List.Icon {...props} icon="phone" />}
              />
              <Divider />
              <List.Item
                title={
                  [
                    order.deliveryAddress.addressLine1,
                    order.deliveryAddress.addressLine2,
                    order.deliveryAddress.city,
                    order.deliveryAddress.state,
                    order.deliveryAddress.postalCode,
                    order.deliveryAddress.country
                  ].filter(Boolean).join(', ')
                }
                description="Shipping Address"
                left={(props) => <List.Icon {...props} icon="map-marker" />}
              />
              {order.deliveryAddress.landmark && (
                <>
                  <Divider />
                  <List.Item
                    title={order.deliveryAddress.landmark}
                    description="Landmark"
                    left={(props) => <List.Icon {...props} icon="map-marker-radius" />}
                  />
                </>
              )}
            </>
          )}
          <Divider />
          <List.Item
            title={formatDate(order.estimatedDeliveryDate)}
            description="Estimated Delivery"
            left={(props) => <List.Icon {...props} icon="calendar-clock" />}
          />
          {order.actualDeliveryDate && (
            <>
              <Divider />
              <List.Item
                title={formatDate(order.actualDeliveryDate)}
                description="Actual Delivery"
                left={(props) => <List.Icon {...props} icon="calendar-check" />}
              />
            </>
          )}
        </Card.Content>
      </Card>

      {/* Order Summary */}
      <Card style={styles.sectionCard} mode="elevated">
        <Card.Title
          title="Order Summary"
          left={(props) => <MaterialCommunityIcons name="receipt" {...props} />}
        />
        <Card.Content>
          <View style={styles.summaryRow}>
            <Text variant="bodyMedium">Subtotal:</Text>
            <Text variant="bodyMedium">${(order.subtotal || 0).toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text variant="bodyMedium">Discount:</Text>
            <Text variant="bodyMedium">-${(order.discount || 0).toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text variant="bodyMedium">Tax:</Text>
            <Text variant="bodyMedium">${(order.tax || 0).toFixed(2)}</Text>
          </View>
          <Divider style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>Total:</Text>
            <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
              ${(order.totalAmount || 0).toFixed(2)}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Notes */}
      {order.notes && (
        <Card style={styles.sectionCard} mode="elevated">
          <Card.Title
            title="Notes"
            left={(props) => <MaterialCommunityIcons name="note-text" {...props} />}
          />
          <Card.Content>
            <Text variant="bodyMedium">{order.notes}</Text>
          </Card.Content>
        </Card>
      )}

      <View style={styles.bottomPadding} />

      <Portal>
        <Dialog visible={statusDialogVisible} onDismiss={() => setStatusDialogVisible(false)}>
          <Dialog.Title>Update Status</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group onValueChange={v => setSelectedStatus(v)} value={selectedStatus}>
              <RadioButton.Item label="Placed" value="Placed" />
              <RadioButton.Item label="Processing" value="Processing" />
              <RadioButton.Item label="Shipped" value="Shipped" />
              <RadioButton.Item label="Delivered" value="Delivered" />
              <RadioButton.Item label="Cancelled" value="Cancelled" />
            </RadioButton.Group>
            {statusLoading && <ActivityIndicator style={{ marginTop: 12 }} />}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setStatusDialogVisible(false)}>Cancel</Button>
            <Button onPress={submitStatusUpdate} loading={statusLoading}>Update</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

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
  orderInfo: {
    flex: 1,
  },
  actionButtons: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  sectionCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemPricing: {
    alignItems: 'flex-end',
  },
  itemDivider: {
    marginVertical: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  summaryDivider: {
    marginVertical: 8,
  },
  bottomPadding: {
    height: 32,
  },
});

export default OrderDetailsScreen;
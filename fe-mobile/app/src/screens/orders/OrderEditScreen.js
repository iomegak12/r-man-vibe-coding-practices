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
  IconButton,
  Divider,
  List,
  Menu,
  Portal,
  Modal,
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

const OrderEditScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [status, setStatus] = useState('');
  const [shippingDate, setShippingDate] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });

  // Menu state
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);

  const statusOptions = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(`http://192.168.0.4:5003/api/orders/${orderId}`);
        if (response.ok) {
          const data = await response.json();
          const orderData = data.data || data;
          setOrder(orderData);
          setStatus(orderData.status || '');
          setShippingDate(orderData.shippingDate || '');
          setDeliveryDate(orderData.deliveryDate || '');
          setNotes(orderData.notes || '');
          if (orderData.deliveryAddress) {
            setShippingAddress({
              name: orderData.deliveryAddress.fullName || '',
              street: orderData.deliveryAddress.addressLine1 || '',
              city: orderData.deliveryAddress.city || '',
              state: orderData.deliveryAddress.state || '',
              zipCode: orderData.deliveryAddress.postalCode || '',
              country: orderData.deliveryAddress.country || '',
            });
          }
        } else {
          const errText = await response.text();
          console.error('Failed to load order:', response.status, errText);
          Alert.alert('Error', 'Failed to load order details');
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
        Alert.alert('Error', 'Network error: ' + error.message);
      }
      setLoading(false);
    };

    fetchOrderDetails();
  }, [orderId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedOrder = {
        status,
        notes,
        deliveryAddress: {
          fullName: shippingAddress.name,
          addressLine1: shippingAddress.street,
          city: shippingAddress.city,
          state: shippingAddress.state,
          postalCode: shippingAddress.zipCode,
          country: shippingAddress.country,
        },
      };

      if (shippingDate) updatedOrder.shippingDate = shippingDate;
      if (deliveryDate) updatedOrder.deliveryDate = deliveryDate;

      const response = await apiClient.patch(
        `http://192.168.0.4:5003/api/admin/orders/${orderId}`,
        updatedOrder
      );

      if (response.ok) {
        Alert.alert(
          'Success',
          'Order updated successfully',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        const error = await response.json().catch(() => ({}));
        Alert.alert('Error', error.message || 'Failed to update order');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      Alert.alert('Error', 'Network error: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Discard Changes',
      'Are you sure you want to discard your changes?',
      [
        { text: 'Keep Editing', style: 'cancel' },
        { text: 'Discard', onPress: () => navigation.goBack() },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Loading order details...</Text>
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
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        {/* Order Header */}
        <Card style={styles.headerCard} mode="elevated">
          <Card.Content>
            <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>
              Edit Order {order.id}
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
              Ordered on {new Date(order.orderDate).toLocaleDateString()}
            </Text>
          </Card.Content>
        </Card>

        {/* Status */}
        <Card style={styles.sectionCard} mode="elevated">
          <Card.Title title="Order Status" />
          <Card.Content>
            <Menu
              visible={statusMenuVisible}
              onDismiss={() => setStatusMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setStatusMenuVisible(true)}
                  style={styles.statusButton}
                  icon="chevron-down"
                  contentStyle={{ justifyContent: 'space-between' }}
                >
                  {status}
                </Button>
              }
            >
              {statusOptions.map((option) => (
                <Menu.Item
                  key={option}
                  onPress={() => {
                    setStatus(option);
                    setStatusMenuVisible(false);
                  }}
                  title={option}
                />
              ))}
            </Menu>
          </Card.Content>
        </Card>

        {/* Shipping Information */}
        <Card style={styles.sectionCard} mode="elevated">
          <Card.Title
            title="Shipping Information"
            left={(props) => <MaterialCommunityIcons name="truck-delivery" {...props} />}
          />
          <Card.Content>
            <TextInput
              label="Recipient Name"
              value={shippingAddress.name}
              onChangeText={(text) => setShippingAddress({ ...shippingAddress, name: text })}
              style={styles.input}
            />
            <TextInput
              label="Street Address"
              value={shippingAddress.street}
              onChangeText={(text) => setShippingAddress({ ...shippingAddress, street: text })}
              style={styles.input}
            />
            <View style={styles.row}>
              <TextInput
                label="City"
                value={shippingAddress.city}
                onChangeText={(text) => setShippingAddress({ ...shippingAddress, city: text })}
                style={[styles.input, styles.halfInput]}
              />
              <TextInput
                label="State"
                value={shippingAddress.state}
                onChangeText={(text) => setShippingAddress({ ...shippingAddress, state: text })}
                style={[styles.input, styles.halfInput]}
              />
            </View>
            <View style={styles.row}>
              <TextInput
                label="ZIP Code"
                value={shippingAddress.zipCode}
                onChangeText={(text) => setShippingAddress({ ...shippingAddress, zipCode: text })}
                style={[styles.input, styles.halfInput]}
              />
              <TextInput
                label="Country"
                value={shippingAddress.country}
                onChangeText={(text) => setShippingAddress({ ...shippingAddress, country: text })}
                style={[styles.input, styles.halfInput]}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Dates */}
        <Card style={styles.sectionCard} mode="elevated">
          <Card.Title
            title="Important Dates"
            left={(props) => <MaterialCommunityIcons name="calendar" {...props} />}
          />
          <Card.Content>
            <TextInput
              label="Shipping Date (Optional)"
              value={shippingDate}
              onChangeText={setShippingDate}
              placeholder="YYYY-MM-DD"
              style={styles.input}
            />
            <TextInput
              label="Delivery Date (Optional)"
              value={deliveryDate}
              onChangeText={setDeliveryDate}
              placeholder="YYYY-MM-DD"
              style={styles.input}
            />
          </Card.Content>
        </Card>

        {/* Notes */}
        <Card style={styles.sectionCard} mode="elevated">
          <Card.Title
            title="Notes"
            left={(props) => <MaterialCommunityIcons name="note-text" {...props} />}
          />
          <Card.Content>
            <TextInput
              label="Order Notes"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              style={styles.input}
            />
          </Card.Content>
        </Card>

        {/* Order Items (Read-only for now) */}
        <Card style={styles.sectionCard} mode="elevated">
          <Card.Title
            title="Order Items"
            left={(props) => <MaterialCommunityIcons name="package-variant" {...props} />}
          />
          <Card.Content>
            {order.items.map((item, index) => (
              <View key={item.id} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                    {item.name}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    SKU: {item.sku} | Qty: {item.quantity}
                  </Text>
                </View>
                <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                  ${item.totalPrice.toFixed(2)}
                </Text>
              </View>
            ))}
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
              * Item editing will be available in a future update
            </Text>
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
          disabled={saving}
        >
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={handleSave}
          style={styles.saveButton}
          loading={saving}
          disabled={saving}
        >
          Save Changes
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
  headerCard: {
    margin: 16,
    marginBottom: 8,
  },
  sectionCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  statusButton: {
    marginTop: 8,
  },
  input: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 0.48,
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
  saveButton: {
    flex: 1,
    marginLeft: 8,
  },
});

export default OrderEditScreen;
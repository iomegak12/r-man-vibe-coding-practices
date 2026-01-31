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
  ProgressBar,
  ActivityIndicator,
} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import apiClient from '../../services/apiClient';

// Mock tracking data - will be replaced with API calls
const mockTrackingData = {
  orderId: 'ORD-001',
  status: 'Shipped',
  trackingNumber: 'TRK123456789',
  carrier: 'FedEx',
  estimatedDelivery: '2024-01-20T17:00:00Z',
  currentLocation: 'Distribution Center, Los Angeles, CA',
  events: [
    {
      id: '1',
      status: 'Order Placed',
      description: 'Order has been placed successfully',
      timestamp: '2024-01-15T10:30:00Z',
      location: 'Online Store',
      completed: true,
    },
    {
      id: '2',
      status: 'Order Confirmed',
      description: 'Order payment confirmed and processing started',
      timestamp: '2024-01-15T11:00:00Z',
      location: 'Warehouse, Anytown, CA',
      completed: true,
    },
    {
      id: '3',
      status: 'Order Packed',
      description: 'Order has been packed and ready for shipment',
      timestamp: '2024-01-16T09:15:00Z',
      location: 'Warehouse, Anytown, CA',
      completed: true,
    },
    {
      id: '4',
      status: 'Shipped',
      description: 'Order has been shipped via FedEx',
      timestamp: '2024-01-16T14:30:00Z',
      location: 'Warehouse, Anytown, CA',
      completed: true,
    },
    {
      id: '5',
      status: 'In Transit',
      description: 'Package is in transit to destination',
      timestamp: '2024-01-17T08:45:00Z',
      location: 'Distribution Center, Los Angeles, CA',
      completed: true,
    },
    {
      id: '6',
      status: 'Out for Delivery',
      description: 'Package is out for delivery',
      timestamp: '2024-01-19T10:20:00Z',
      location: 'Local Delivery Station, San Francisco, CA',
      completed: false,
    },
    {
      id: '7',
      status: 'Delivered',
      description: 'Package has been delivered successfully',
      timestamp: null,
      location: 'Customer Address, San Francisco, CA',
      completed: false,
    },
  ],
};

const TrackingEvent = ({ event, isLast, theme }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.eventContainer}>
      <View style={styles.eventTimeline}>
        <View style={[
          styles.eventDot,
          event.completed && { backgroundColor: theme.colors.primary }
        ]} />
        {!isLast && (
          <View style={[
            styles.eventLine,
            event.completed && { backgroundColor: theme.colors.primary }
          ]} />
        )}
      </View>
      <View style={styles.eventContent}>
        <View style={styles.eventHeader}>
          <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
            {event.status}
          </Text>
          {event.timestamp && (
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {formatDate(event.timestamp)}
            </Text>
          )}
        </View>
        <Text variant="bodyMedium" style={{ marginVertical: 4 }}>
          {event.description}
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          📍 {event.location}
        </Text>
      </View>
    </View>
  );
};

const OrderTrackingScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const { orderId } = route.params;
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrackingData = async () => {
      setLoading(true);
      try {
        // Fetch order details which includes tracking information
        const response = await apiClient.get(`http://192.168.0.4:5003/api/orders/${orderId}`);
        if (response.ok) {
          const data = await response.json();
          const orderData = data.data || data;
          
          // Build tracking data from order information
          const tracking = {
            orderId: orderData.orderId || orderData.id,
            status: orderData.status,
            trackingNumber: orderData.trackingNumber || 'N/A',
            carrier: orderData.carrier || 'Standard',
            estimatedDelivery: orderData.estimatedDeliveryDate || orderData.deliveryDate,
            currentLocation: orderData.currentLocation || 'Processing',
            events: buildTrackingEvents(orderData),
          };
          
          setTrackingData(tracking);
        } else {
          const errText = await response.text();
          console.error('Failed to load tracking data:', response.status, errText);
          Alert.alert('Error', 'Failed to load tracking information');
        }
      } catch (error) {
        console.error('Error fetching tracking data:', error);
        Alert.alert('Error', 'Network error: ' + error.message);
      }
      setLoading(false);
    };

    fetchTrackingData();
  }, [orderId]);

  const buildTrackingEvents = (order) => {
    const events = [];
    const now = new Date();
    
    // Order Placed
    events.push({
      id: '1',
      status: 'Order Placed',
      description: 'Order has been placed successfully',
      timestamp: order.orderDate || order.createdAt,
      location: 'Online Store',
      completed: true,
    });
    
    // Processing
    if (['Processing', 'Shipped', 'Delivered'].includes(order.status)) {
      events.push({
        id: '2',
        status: 'Processing',
        description: 'Order is being processed',
        timestamp: order.processingDate || order.orderDate,
        location: 'Warehouse',
        completed: true,
      });
    }
    
    // Shipped
    if (['Shipped', 'Delivered'].includes(order.status)) {
      events.push({
        id: '3',
        status: 'Shipped',
        description: 'Order has been shipped',
        timestamp: order.shippingDate,
        location: 'Distribution Center',
        completed: true,
      });
    }
    
    // Delivered
    events.push({
      id: '4',
      status: 'Delivered',
      description: 'Package delivered successfully',
      timestamp: order.deliveryDate,
      location: 'Customer Address',
      completed: order.status === 'Delivered',
    });
    
    return events;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#FF9800';
      case 'Processing': return '#2196F3';
      case 'Shipped': return '#9C27B0';
      case 'Delivered': return '#4CAF50';
      case 'Cancelled': return '#F44336';
      default: return '#757575';
    }
  };

  const getProgressValue = (status) => {
    switch (status) {
      case 'Pending': return 0.1;
      case 'Processing': return 0.3;
      case 'Shipped': return 0.6;
      case 'Delivered': return 1.0;
      case 'Cancelled': return 0;
      default: return 0;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleRefreshTracking = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`http://192.168.0.4:5003/api/orders/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        const orderData = data.data || data;
        const tracking = {
          orderId: orderData.orderId || orderData.id,
          status: orderData.status,
          trackingNumber: orderData.trackingNumber || 'N/A',
          carrier: orderData.carrier || 'Standard',
          estimatedDelivery: orderData.estimatedDeliveryDate || orderData.deliveryDate,
          currentLocation: orderData.currentLocation || 'Processing',
          events: buildTrackingEvents(orderData),
        };
        setTrackingData(tracking);
      }
    } catch (error) {
      console.error('Error refreshing tracking:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Loading tracking information...</Text>
      </View>
    );
  }

  if (!trackingData) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.colors.background }]}>
        <Text>Tracking information not available</Text>
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
                Order {trackingData.orderId}
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Tracking: {trackingData.trackingNumber}
              </Text>
            </View>
            <Chip
              mode="flat"
              style={{ backgroundColor: getStatusColor(trackingData.status) }}
              textStyle={{ color: 'white' }}
            >
              {trackingData.status}
            </Chip>
          </View>
        </Card.Content>
      </Card>

      {/* Progress Bar */}
      <Card style={styles.progressCard} mode="elevated">
        <Card.Content>
          <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 8 }}>
            Delivery Progress
          </Text>
          <ProgressBar
            progress={getProgressValue(trackingData.status)}
            color={theme.colors.primary}
            style={styles.progressBar}
          />
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
            Estimated Delivery: {formatDate(trackingData.estimatedDelivery)}
          </Text>
        </Card.Content>
      </Card>

      {/* Shipping Information */}
      <Card style={styles.infoCard} mode="elevated">
        <Card.Title
          title="Shipping Details"
          left={(props) => <MaterialCommunityIcons name="truck-delivery" {...props} />}
        />
        <Card.Content>
          <List.Item
            title={trackingData.carrier}
            description="Shipping Carrier"
            left={(props) => <List.Icon {...props} icon="truck" />}
          />
          <Divider />
          <List.Item
            title={trackingData.trackingNumber}
            description="Tracking Number"
            left={(props) => <List.Icon {...props} icon="barcode" />}
          />
          <Divider />
          <List.Item
            title={trackingData.currentLocation}
            description="Current Location"
            left={(props) => <List.Icon {...props} icon="map-marker" />}
          />
        </Card.Content>
      </Card>

      {/* Tracking Timeline */}
      <Card style={styles.timelineCard} mode="elevated">
        <Card.Title
          title="Tracking History"
          left={(props) => <MaterialCommunityIcons name="timeline" {...props} />}
          right={(props) => (
            <IconButton
              {...props}
              icon="refresh"
              onPress={handleRefreshTracking}
            />
          )}
        />
        <Card.Content>
          {trackingData.events.map((event, index) => (
            <TrackingEvent
              key={event.id}
              event={event}
              isLast={index === trackingData.events.length - 1}
              theme={theme}
            />
          ))}
        </Card.Content>
      </Card>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.actionButton}
          icon="arrow-left"
        >
          Back to Order
        </Button>
        <Button
          mode="contained"
          onPress={handleRefreshTracking}
          style={styles.actionButton}
          icon="refresh"
        >
          Refresh Tracking
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
  progressCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  infoCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  timelineCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  eventContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  eventTimeline: {
    width: 20,
    alignItems: 'center',
    marginRight: 16,
  },
  eventDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E0E0E0',
    marginTop: 6,
  },
  eventLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E0E0E0',
    marginTop: 8,
  },
  eventContent: {
    flex: 1,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  bottomPadding: {
    height: 32,
  },
});

export default OrderTrackingScreen;
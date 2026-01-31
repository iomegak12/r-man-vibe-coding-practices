import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Order Screens
import OrdersListScreen from '../screens/orders/OrdersListScreen';
import OrderDetailsScreen from '../screens/orders/OrderDetailsScreen';
import OrderEditScreen from '../screens/orders/OrderEditScreen';
import OrderTrackingScreen from '../screens/orders/OrderTrackingScreen';

const Stack = createStackNavigator();

const OrderNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1B4B66',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="OrdersList"
        component={OrdersListScreen}
        options={{
          title: 'Orders',
          headerTitle: 'Order Management',
        }}
      />
      <Stack.Screen
        name="OrderDetails"
        component={OrderDetailsScreen}
        options={{
          title: 'Order Details',
        }}
      />
      <Stack.Screen
        name="OrderEdit"
        component={OrderEditScreen}
        options={{
          title: 'Edit Order',
        }}
      />
      <Stack.Screen
        name="OrderTracking"
        component={OrderTrackingScreen}
        options={{
          title: 'Order Tracking',
        }}
      />
    </Stack.Navigator>
  );
};

export default OrderNavigator;
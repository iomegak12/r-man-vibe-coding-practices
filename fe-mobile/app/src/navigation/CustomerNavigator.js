import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Customer Screens
import CustomersListScreen from '../screens/customers/CustomersListScreen';
import CustomerDetailsScreen from '../screens/customers/CustomerDetailsScreen';
import CustomerEditScreen from '../screens/customers/CustomerEditScreen';
import CustomerCreateScreen from '../screens/customers/CustomerCreateScreen';

const Stack = createStackNavigator();

const CustomerNavigator = () => {
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
        name="CustomersList"
        component={CustomersListScreen}
        options={{
          title: 'Customers',
          headerTitle: 'Customer Management',
        }}
      />
      <Stack.Screen
        name="CustomerDetails"
        component={CustomerDetailsScreen}
        options={{
          title: 'Customer Details',
        }}
      />
      <Stack.Screen
        name="CustomerEdit"
        component={CustomerEditScreen}
        options={{
          title: 'Edit Customer',
        }}
      />
      <Stack.Screen
        name="CustomerCreate"
        component={CustomerCreateScreen}
        options={{
          title: 'Add Customer',
        }}
      />
    </Stack.Navigator>
  );
};

export default CustomerNavigator;
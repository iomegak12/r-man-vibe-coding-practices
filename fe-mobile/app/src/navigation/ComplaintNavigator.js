import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Complaint Screens
import ComplaintsListScreen from '../screens/complaints/ComplaintsListScreen';
import ComplaintDetailsScreen from '../screens/complaints/ComplaintDetailsScreen';
import ComplaintCreateScreen from '../screens/complaints/ComplaintCreateScreen';
import ComplaintAssignScreen from '../screens/complaints/ComplaintAssignScreen';
import ComplaintResolveScreen from '../screens/complaints/ComplaintResolveScreen';

const Stack = createStackNavigator();

const ComplaintNavigator = () => {
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
        name="ComplaintsList"
        component={ComplaintsListScreen}
        options={{
          title: 'Complaints',
          headerTitle: 'Complaint Management',
        }}
      />
      <Stack.Screen
        name="ComplaintDetails"
        component={ComplaintDetailsScreen}
        options={{
          title: 'Complaint Details',
        }}
      />
      <Stack.Screen
        name="ComplaintCreate"
        component={ComplaintCreateScreen}
        options={{
          title: 'New Complaint',
        }}
      />
      <Stack.Screen
        name="ComplaintAssign"
        component={ComplaintAssignScreen}
        options={{
          title: 'Assign Complaint',
        }}
      />
      <Stack.Screen
        name="ComplaintResolve"
        component={ComplaintResolveScreen}
        options={{
          title: 'Resolve Complaint',
        }}
      />
    </Stack.Navigator>
  );
};

export default ComplaintNavigator;
import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import { ScrollView, View, StyleSheet, Alert } from 'react-native';
import {
  Card,
  Text,
  TextInput,
  Button,
  useTheme,
  Switch,
  Divider,
} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const CustomerEditScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const { customerId } = route.params;

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch customer data from API
  useEffect(() => {
    const fetchCustomer = async () => {
      setFetchLoading(true);
      setError(null);
      try {
        console.log('Fetching customer for edit:', customerId);
        const response = await apiClient.get(`http://192.168.0.4:5002/api/customers/${customerId}`);
        if (response.ok) {
          const data = await response.json();
          console.log('Customer data for edit:', data);
          const cust = data.data || data;
          // Ensure address object exists to avoid undefined access
          if (!cust.address) {
            cust.address = {};
          }
          setCustomer(cust);
        } else {
          setError('Failed to load customer data');
        }
      } catch (err) {
        console.error('Error fetching customer:', err);
        setError('Network error');
      }
      setFetchLoading(false);
    };
    fetchCustomer();
  }, [customerId]);

  const handleSave = async () => {
    if (!customer.fullName || !customer.email) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      console.log('Updating customer:', customerId, customer);
      const response = await apiClient.put(`http://192.168.0.4:5002/api/customers/${customerId}`, {
        fullName: customer.fullName,
        email: customer.email,
        contactNumber: customer.contactNumber,
        customerType: customer.customerType,
        customerStatus: customer.customerStatus,
        address: customer.address,
      });

      if (response.ok) {
        Alert.alert(
          'Success',
          'Customer updated successfully',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to update customer');
      }
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Error', 'Failed to update customer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateCustomer = (field, value) => {
    setCustomer(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateAddress = (field, value) => {
    setCustomer(prev => ({
      ...prev,
      address: {
        ...(prev.address || {}),
        [field]: value,
      },
    }));
  };

  if (fetchLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }]}>
        <MaterialCommunityIcons name="account-edit" size={64} color={theme.colors.onSurfaceVariant} />
        <Text variant="headlineSmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 16 }}>
          Loading customer data...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.error, marginBottom: 16 }}>{error}</Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Go Back
        </Button>
      </View>
    );
  }

  if (!customer) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }]}>
        <Text variant="headlineSmall" style={{ color: theme.colors.onSurfaceVariant }}>
          Customer not found
        </Text>
        <Button mode="contained" onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {/* Basic Information */}
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <Text variant="titleLarge" style={styles.cardTitle}>
              Basic Information
            </Text>

            <TextInput
              label="Full Name *"
              value={customer.fullName}
              onChangeText={(value) => updateCustomer('fullName', value)}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Email *"
              value={customer.email}
              onChangeText={(value) => updateCustomer('email', value)}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />

            <TextInput
              label="Phone"
              value={customer.contactNumber || ''}
              onChangeText={(value) => updateCustomer('contactNumber', value)}
              mode="outlined"
              keyboardType="phone-pad"
              style={styles.input}
            />

            <TextInput
              label="Customer Type"
              value={customer.customerType || ''}
              onChangeText={(value) => updateCustomer('customerType', value)}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Status"
              value={customer.customerStatus || ''}
              onChangeText={(value) => updateCustomer('customerStatus', value)}
              mode="outlined"
              style={styles.input}
            />

            <View style={styles.switchContainer}>
              <Text variant="bodyLarge">Active Status</Text>
              <Switch
                value={customer.customerStatus === 'Active'}
                onValueChange={(value) =>
                  updateCustomer('customerStatus', value ? 'Active' : 'Inactive')
                }
              />
            </View>
          </Card.Content>
        </Card>

        {/* Address Information */}
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <Text variant="titleLarge" style={styles.cardTitle}>
              Address Information
            </Text>

            <TextInput
              label="Street Address"
              value={customer.address?.street || ''}
              onChangeText={(value) => updateAddress('street', value)}
              mode="outlined"
              style={styles.input}
            />

            <View style={styles.row}>
              <TextInput
                label="City"
                value={customer.address?.city || ''}
                onChangeText={(value) => updateAddress('city', value)}
                mode="outlined"
                style={[styles.input, styles.halfInput]}
              />

              <TextInput
                label="State"
                value={customer.address?.state || ''}
                onChangeText={(value) => updateAddress('state', value)}
                mode="outlined"
                style={[styles.input, styles.halfInput]}
              />
            </View>

            <View style={styles.row}>
              <TextInput
                label="ZIP Code"
                value={customer.address?.zipCode || ''}
                onChangeText={(value) => updateAddress('zipCode', value)}
                mode="outlined"
                keyboardType="numeric"
                style={[styles.input, styles.halfInput]}
              />

              <TextInput
                label="Country"
                value={customer.address?.country || ''}
                onChangeText={(value) => updateAddress('country', value)}
                mode="outlined"
                style={[styles.input, styles.halfInput]}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.button}
          >
            Cancel
          </Button>

          <Button
            mode="contained"
            onPress={handleSave}
            loading={loading}
            disabled={loading}
            style={styles.button}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 32,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default CustomerEditScreen;
import React, { useState } from 'react';
import apiClient from '../../services/apiClient';
import { ScrollView, View, StyleSheet, Alert } from 'react-native';
import {
  Card,
  Text,
  TextInput,
  Button,
  useTheme,
  Switch,
} from 'react-native-paper';

const CustomerCreateScreen = ({ navigation }) => {
  const theme = useTheme();

  const [customer, setCustomer] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
    status: 'Active',
  });
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!customer.fullName || !customer.email) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        fullName: customer.fullName,
        email: customer.email,
        contactNumber: customer.phone || customer.contactNumber,
        customerType: customer.customerType || 'Regular',
        customerStatus: customer.status || 'Active',
        address: customer.address,
      };

      const response = await apiClient.post('http://192.168.0.4:5002/api/customers', payload);
      if (response.ok) {
        const data = await response.json();
        Alert.alert(
          'Success',
          'Customer created successfully',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        const errData = await response.json();
        Alert.alert('Error', errData.message || 'Failed to create customer');
      }
    } catch (error) {
      console.error('Create customer error:', error);
      Alert.alert('Error', 'Failed to create customer. Please try again.');
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
        ...prev.address,
        [field]: value,
      },
    }));
  };

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
              value={customer.phone}
              onChangeText={(value) => updateCustomer('phone', value)}
              mode="outlined"
              keyboardType="phone-pad"
              style={styles.input}
            />

            <View style={styles.switchContainer}>
              <Text variant="bodyLarge">Active Status</Text>
              <Switch
                value={customer.status === 'Active'}
                onValueChange={(value) =>
                  updateCustomer('status', value ? 'Active' : 'Inactive')
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
              value={customer.address.street}
              onChangeText={(value) => updateAddress('street', value)}
              mode="outlined"
              style={styles.input}
            />

            <View style={styles.row}>
              <TextInput
                label="City"
                value={customer.address.city}
                onChangeText={(value) => updateAddress('city', value)}
                mode="outlined"
                style={[styles.input, styles.halfInput]}
              />

              <TextInput
                label="State"
                value={customer.address.state}
                onChangeText={(value) => updateAddress('state', value)}
                mode="outlined"
                style={[styles.input, styles.halfInput]}
              />
            </View>

            <View style={styles.row}>
              <TextInput
                label="ZIP Code"
                value={customer.address.zipCode}
                onChangeText={(value) => updateAddress('zipCode', value)}
                mode="outlined"
                keyboardType="numeric"
                style={[styles.input, styles.halfInput]}
              />

              <TextInput
                label="Country"
                value={customer.address.country}
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
            onPress={handleCreate}
            loading={loading}
            disabled={loading}
            style={styles.button}
          >
            {loading ? 'Creating...' : 'Create Customer'}
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

export default CustomerCreateScreen;
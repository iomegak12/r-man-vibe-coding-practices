import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Card,
  Text,
  Switch,
  List,
  Divider,
  useTheme,
  Button,
  RadioButton,
  Dialog,
  Portal,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = ({ navigation }) => {
  const theme = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [orderNotifications, setOrderNotifications] = useState(true);
  const [complaintNotifications, setComplaintNotifications] = useState(true);
  const [customerNotifications, setCustomerNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('en');
  const [languageDialogVisible, setLanguageDialogVisible] = useState(false);
  const [dataUsage, setDataUsage] = useState('standard');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState('30');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('app_settings');
      if (settings) {
        const parsed = JSON.parse(settings);
        setNotifications(parsed.notifications ?? true);
        setOrderNotifications(parsed.orderNotifications ?? true);
        setComplaintNotifications(parsed.complaintNotifications ?? true);
        setCustomerNotifications(parsed.customerNotifications ?? false);
        setDarkMode(parsed.darkMode ?? false);
        setLanguage(parsed.language ?? 'en');
        setDataUsage(parsed.dataUsage ?? 'standard');
        setAutoRefresh(parsed.autoRefresh ?? true);
        setRefreshInterval(parsed.refreshInterval ?? '30');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem('app_settings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleNotificationToggle = async (value) => {
    setNotifications(value);
    await saveSettings({
      notifications: value,
      orderNotifications,
      complaintNotifications,
      customerNotifications,
      darkMode,
      language,
      dataUsage,
      autoRefresh,
      refreshInterval,
    });
  };

  const handleOrderNotificationToggle = async (value) => {
    setOrderNotifications(value);
    await saveSettings({
      notifications,
      orderNotifications: value,
      complaintNotifications,
      customerNotifications,
      darkMode,
      language,
      dataUsage,
      autoRefresh,
      refreshInterval,
    });
  };

  const handleComplaintNotificationToggle = async (value) => {
    setComplaintNotifications(value);
    await saveSettings({
      notifications,
      orderNotifications,
      complaintNotifications: value,
      customerNotifications,
      darkMode,
      language,
      dataUsage,
      autoRefresh,
      refreshInterval,
    });
  };

  const handleCustomerNotificationToggle = async (value) => {
    setCustomerNotifications(value);
    await saveSettings({
      notifications,
      orderNotifications,
      complaintNotifications,
      customerNotifications: value,
      darkMode,
      language,
      dataUsage,
      autoRefresh,
      refreshInterval,
    });
  };

  const handleAutoRefreshToggle = async (value) => {
    setAutoRefresh(value);
    await saveSettings({
      notifications,
      orderNotifications,
      complaintNotifications,
      customerNotifications,
      darkMode,
      language,
      dataUsage,
      autoRefresh: value,
      refreshInterval,
    });
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'Are you sure you want to clear the app cache? This will remove temporarily stored data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear specific cache items but keep settings and auth
              const keysToKeep = ['app_settings', 'auth_token', 'user_data'];
              const allKeys = await AsyncStorage.getAllKeys();
              const keysToRemove = allKeys.filter(key => !keysToKeep.includes(key));
              await AsyncStorage.multiRemove(keysToRemove);
              Alert.alert('Success', 'Cache cleared successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear cache');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Notifications */}
      <Card style={styles.card} mode="elevated">
        <Card.Title title="Notifications" />
        <Card.Content>
          <List.Item
            title="Enable Notifications"
            description="Receive push notifications"
            left={(props) => <List.Icon {...props} icon="bell" />}
            right={() => (
              <Switch value={notifications} onValueChange={handleNotificationToggle} />
            )}
          />
          <Divider />
          <List.Item
            title="Order Updates"
            description="Notifications for order status changes"
            left={(props) => <List.Icon {...props} icon="package-variant" />}
            right={() => (
              <Switch
                value={orderNotifications}
                onValueChange={handleOrderNotificationToggle}
                disabled={!notifications}
              />
            )}
          />
          <Divider />
          <List.Item
            title="Complaint Alerts"
            description="Notifications for new complaints"
            left={(props) => <List.Icon {...props} icon="alert-circle" />}
            right={() => (
              <Switch
                value={complaintNotifications}
                onValueChange={handleComplaintNotificationToggle}
                disabled={!notifications}
              />
            )}
          />
          <Divider />
          <List.Item
            title="Customer Activities"
            description="Notifications for customer registrations"
            left={(props) => <List.Icon {...props} icon="account-multiple" />}
            right={() => (
              <Switch
                value={customerNotifications}
                onValueChange={handleCustomerNotificationToggle}
                disabled={!notifications}
              />
            )}
          />
        </Card.Content>
      </Card>

      {/* Appearance */}
      <Card style={styles.card} mode="elevated">
        <Card.Title title="Appearance" />
        <Card.Content>
          <List.Item
            title="Dark Mode"
            description="Use dark theme (Coming Soon)"
            left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
            right={() => <Switch value={darkMode} disabled />}
          />
          <Divider />
          <List.Item
            title="Language"
            description="English (US)"
            left={(props) => <List.Icon {...props} icon="translate" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => setLanguageDialogVisible(true)}
          />
        </Card.Content>
      </Card>

      {/* Data & Sync */}
      <Card style={styles.card} mode="elevated">
        <Card.Title title="Data & Sync" />
        <Card.Content>
          <List.Item
            title="Auto Refresh"
            description="Automatically refresh data"
            left={(props) => <List.Icon {...props} icon="refresh" />}
            right={() => (
              <Switch value={autoRefresh} onValueChange={handleAutoRefreshToggle} />
            )}
          />
          <Divider />
          <List.Item
            title="Refresh Interval"
            description={`Every ${refreshInterval} seconds`}
            left={(props) => <List.Icon {...props} icon="timer" />}
            disabled={!autoRefresh}
          />
          <Divider />
          <List.Item
            title="Data Usage"
            description="Standard quality"
            left={(props) => <List.Icon {...props} icon="chart-donut" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
          />
        </Card.Content>
      </Card>

      {/* Storage */}
      <Card style={styles.card} mode="elevated">
        <Card.Title title="Storage" />
        <Card.Content>
          <List.Item
            title="Clear Cache"
            description="Remove temporary data"
            left={(props) => <List.Icon {...props} icon="delete-sweep" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={handleClearCache}
          />
        </Card.Content>
      </Card>

      {/* About */}
      <Card style={styles.card} mode="elevated">
        <Card.Title title="About" />
        <Card.Content>
          <List.Item
            title="Version"
            description="1.0.0"
            left={(props) => <List.Icon {...props} icon="information" />}
          />
          <Divider />
          <List.Item
            title="Terms of Service"
            left={(props) => <List.Icon {...props} icon="file-document" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => Alert.alert('Info', 'Terms of Service - Coming Soon')}
          />
          <Divider />
          <List.Item
            title="Privacy Policy"
            left={(props) => <List.Icon {...props} icon="shield-account" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => Alert.alert('Info', 'Privacy Policy - Coming Soon')}
          />
        </Card.Content>
      </Card>

      {/* Language Dialog */}
      <Portal>
        <Dialog visible={languageDialogVisible} onDismiss={() => setLanguageDialogVisible(false)}>
          <Dialog.Title>Select Language</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group value={language} onValueChange={setLanguage}>
              <RadioButton.Item label="English (US)" value="en" />
              <RadioButton.Item label="Spanish (Coming Soon)" value="es" disabled />
              <RadioButton.Item label="French (Coming Soon)" value="fr" disabled />
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setLanguageDialogVisible(false)}>Cancel</Button>
            <Button onPress={() => setLanguageDialogVisible(false)}>OK</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  card: {
    margin: 16,
    marginTop: 8,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default SettingsScreen;

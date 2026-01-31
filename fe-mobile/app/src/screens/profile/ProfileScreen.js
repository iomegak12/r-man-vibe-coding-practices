import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Card,
  Text,
  Button,
  TextInput,
  Avatar,
  useTheme,
  List,
  Divider,
  ActivityIndicator,
} from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../services/apiClient';

const ProfileScreen = ({ navigation }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await apiClient.get('http://192.168.0.4:5001/api/auth/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile({
          username: data.username || '',
          email: data.email || '',
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          phone: data.phone || '',
          role: data.role || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await apiClient.patch('http://192.168.0.4:5001/api/auth/profile', {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
      });

      if (response.ok) {
        Alert.alert('Success', 'Profile updated successfully');
        setEditing(false);
      } else {
        Alert.alert('Error', 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Network error: ' + error.message);
    }
    setSaving(false);
  };

  const getInitials = () => {
    const first = profile.firstName?.charAt(0) || '';
    const last = profile.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U';
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <Card style={styles.headerCard} mode="elevated">
        <Card.Content style={styles.headerContent}>
          <Avatar.Text
            size={80}
            label={getInitials()}
            style={{ backgroundColor: theme.colors.primary }}
          />
          <Text variant="headlineSmall" style={styles.userName}>
            {profile.firstName && profile.lastName
              ? `${profile.firstName} ${profile.lastName}`
              : profile.username}
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.primary }}>
            {profile.role}
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {profile.email}
          </Text>
        </Card.Content>
      </Card>

      {/* Profile Information */}
      <Card style={styles.card} mode="elevated">
        <Card.Title
          title="Personal Information"
          right={(props) =>
            !editing ? (
              <Button onPress={() => setEditing(true)}>Edit</Button>
            ) : null
          }
        />
        <Card.Content>
          <TextInput
            label="Username"
            value={profile.username}
            disabled
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Email"
            value={profile.email}
            disabled
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="First Name"
            value={profile.firstName}
            onChangeText={(text) => setProfile({ ...profile, firstName: text })}
            disabled={!editing}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Last Name"
            value={profile.lastName}
            onChangeText={(text) => setProfile({ ...profile, lastName: text })}
            disabled={!editing}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Phone"
            value={profile.phone}
            onChangeText={(text) => setProfile({ ...profile, phone: text })}
            disabled={!editing}
            mode="outlined"
            keyboardType="phone-pad"
            style={styles.input}
          />

          {editing && (
            <View style={styles.buttonRow}>
              <Button
                mode="outlined"
                onPress={() => {
                  setEditing(false);
                  fetchProfile();
                }}
                style={styles.button}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSave}
                loading={saving}
                disabled={saving}
                style={styles.button}
              >
                Save Changes
              </Button>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Account Information */}
      <Card style={styles.card} mode="elevated">
        <Card.Title title="Account Information" />
        <Card.Content>
          <List.Item
            title="Role"
            description={profile.role}
            left={(props) => <List.Icon {...props} icon="shield-account" />}
          />
          <Divider />
          <List.Item
            title="Change Password"
            description="Update your password"
            left={(props) => <List.Icon {...props} icon="lock-reset" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('ChangePassword')}
          />
        </Card.Content>
      </Card>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCard: {
    margin: 16,
    marginBottom: 8,
  },
  headerContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  userName: {
    marginTop: 12,
    fontWeight: 'bold',
  },
  card: {
    margin: 16,
    marginTop: 8,
  },
  input: {
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default ProfileScreen;

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { 
  Avatar, 
  Title, 
  Caption, 
  Drawer, 
  Divider, 
  useTheme,
  Text,
  Switch 
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Context
import { useAuth } from '../contexts/AuthContext';
import { useThemeContext } from '../contexts/ThemeContext';

const DrawerContent = (props) => {
  const theme = useTheme();
  const { user, signOut } = useAuth();
  const { isDarkMode, toggleTheme } = useThemeContext();
  const [active, setActive] = React.useState('Dashboard');

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <View style={[styles.drawerContent, { backgroundColor: theme.colors.surface }]}> 
      <DrawerContentScrollView {...props}>
        {/* User Profile Header */}
        <View style={styles.userInfoSection}>
          <View style={styles.userInfo}>
            <Avatar.Text 
              size={60} 
              label={user?.fullName?.split(' ').map(n => n[0]).join('') || 'U'}
              style={{ backgroundColor: theme.colors.primary }}
            />
            <View style={styles.userDetails}>
              <Title style={[styles.title, { color: theme.colors.onSurface }]}> 
                {user?.fullName || 'User'}
              </Title>
              <Caption style={[styles.caption, { color: theme.colors.onSurfaceVariant }]}> 
                {user?.email || 'user@example.com'}
              </Caption>
              <Caption style={[styles.caption, { color: theme.colors.primary }]}> 
                {user?.role || 'Administrator'}
              </Caption>
            </View>
          </View>
        </View>

        <Divider style={{ marginVertical: 10 }} />

        {/* Navigation Sections */}
        <Drawer.Section>
          <Drawer.Item
            icon={({ color, size }) => (
              <Icon name="view-dashboard" color={color} size={size} />
            )}
            label="Dashboard"
            active={active === 'Dashboard'}
            onPress={() => {
              setActive('Dashboard');
              props.navigation.navigate('Dashboard');
            }}
          />
          {/* Phase 4: Customer Management */}
          <Drawer.Item
            icon={({ color, size }) => (
              <Icon name="account-multiple" color={color} size={size} />
            )}
            label="Customers"
            active={active === 'Customers'}
            onPress={() => {
              setActive('Customers');
              props.navigation.navigate('Customers');
            }}
          />
          {/* Phase 5: Order Management */}
          <Drawer.Item
            icon={({ color, size }) => (
              <Icon name="cart" color={color} size={size} />
            )}
            label="Orders"
            active={active === 'Orders'}
            onPress={() => {
              setActive('Orders');
              props.navigation.navigate('Orders');
            }}
          />
          {/* Phase 6: Complaint Management */}
          <Drawer.Item
            icon={({ color, size }) => (
              <Icon name="alert-circle" color={color} size={size} />
            )}
            label="Complaints"
            active={active === 'Complaints'}
            onPress={() => {
              setActive('Complaints');
              props.navigation.navigate('Complaints');
            }}
          />
        </Drawer.Section>

        <Divider style={{ marginVertical: 10 }} />

        <Drawer.Section title="Preferences">
          <View style={styles.themeToggle}>
            <View style={styles.themeToggleLeft}>
              <Icon 
                name={isDarkMode ? "weather-night" : "weather-sunny"} 
                size={24} 
                color={theme.colors.onSurfaceVariant} 
              />
              <Text 
                variant="bodyMedium" 
                style={[styles.themeLabel, { color: theme.colors.onSurface }]}
              >
                {isDarkMode ? "Dark Mode" : "Light Mode"}
              </Text>
            </View>
            <Switch value={isDarkMode} onValueChange={toggleTheme} />
          </View>
        </Drawer.Section>

        <Divider style={{ marginVertical: 10 }} />

        <Drawer.Section title="Account">
          <Drawer.Item
            icon={({ color, size }) => (
              <Icon name="account" color={color} size={size} />
            )}
            label="Profile"
            active={active === 'Profile'}
            onPress={() => {
              setActive('Profile');
              props.navigation.navigate('Profile');
            }}
          />
          <Drawer.Item
            icon={({ color, size }) => (
              <Icon name="cog" color={color} size={size} />
            )}
            label="Settings"
            active={active === 'Settings'}
            onPress={() => {
              setActive('Settings');
              props.navigation.navigate('Settings');
            }}
          />
        </Drawer.Section>
      </DrawerContentScrollView>

      {/* Footer Section */}
      <Drawer.Section style={styles.bottomDrawerSection}>
        <Drawer.Item 
          icon={({ color, size }) => (
            <Icon name="exit-to-app" color={color} size={size} />
          )}
          label="Sign Out" 
          onPress={handleSignOut}
        />
        <View style={styles.versionInfo}>
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
            TradeEase Mobile v1.0.0
          </Text>
        </View>
      </Drawer.Section>
    </View>
  );
};

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
  },
  userInfoSection: {
    paddingLeft: 20,
    paddingTop: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userDetails: {
    marginLeft: 15,
    flex: 1,
  },
  title: {
    fontSize: 16,
    marginTop: 3,
    fontWeight: 'bold',
  },
  caption: {
    fontSize: 14,
    lineHeight: 14,
  },
  bottomDrawerSection: {
    marginBottom: 15,
    borderTopColor: '#f4f4f4',
    borderTopWidth: 1,
  },
  versionInfo: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  themeToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  themeToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  themeLabel: {
    fontSize: 16,
  },
});

export default DrawerContent;
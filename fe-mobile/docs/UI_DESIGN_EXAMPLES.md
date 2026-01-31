# Mobile UI Design Examples (Material Design 3)

This document provides reference implementations for key screens using **React Native** and **React Native Paper (v5)** which implements Material Design 3. 

> **Note to Developers:** These are presentational components meant to serve as design specifications. Logic and state management have been omitted for clarity.

## 1. Welcome / Login Screen
**Concept:** Clean, focused interface with prominent branding and clear input fields. Uses Material Design 3 "Surface" colors and "Outlined" text inputs.

```jsx
import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { Button, Text, TextInput, Surface, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const WelcomeScreen = () => {
  const theme = useTheme();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [secureTextEntry, setSecureTextEntry] = React.useState(true);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {/* Branding Section */}
        <View style={styles.header}>
          <Surface style={[styles.logoPlaceholder, { backgroundColor: theme.colors.primaryContainer }]} elevation={2}>
            <Text variant="displayLarge" style={{ color: theme.colors.onPrimaryContainer }}>T</Text>
          </Surface>
          <Text variant="headlineLarge" style={[styles.title, { color: theme.colors.primary }]}>
            TradeEase
          </Text>
          <Text variant="bodyLarge" style={{ color: theme.colors.secondary }}>
            Admin Portal
          </Text>
        </View>

        {/* Login Form */}
        <View style={styles.form}>
          <TextInput
            mode="outlined"
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            left={<TextInput.Icon icon="email" />}
            style={styles.input}
          />
          <TextInput
            mode="outlined"
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={secureTextEntry}
            left={<TextInput.Icon icon="lock" />}
            right={<TextInput.Icon icon={secureTextEntry ? "eye" : "eye-off"} onPress={() => setSecureTextEntry(!secureTextEntry)} />}
            style={styles.input}
          />
          
          <Button 
            mode="contained" 
            onPress={() => {}} 
            style={styles.button}
            contentStyle={{ height: 50 }}
          >
            Sign In
          </Button>

          <Button mode="text" onPress={() => {}}>
            Forgot Password?
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 48 },
  logoPlaceholder: { width: 80, height: 80, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { fontWeight: 'bold' },
  form: { gap: 16 },
  input: { backgroundColor: 'transparent' },
  button: { marginTop: 8, borderRadius: 8 },
});

export default WelcomeScreen;
```

---

## 2. Navigation Drawer Menu
**Concept:** A rich navigation drawer featuring a simplified user profile header, organized sections, and clear active states.

```jsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { Avatar, Title, Caption, Drawer, Divider, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const DrawerMenu = (props) => {
  const theme = useTheme();
  const [active, setActive] = React.useState('dashboard');

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.surface }}>
      <DrawerContentScrollView {...props}>
        {/* User Profile Header */}
        <View style={styles.userInfoSection}>
          <View style={{ flexDirection: 'row', marginTop: 15 }}>
            <Avatar.Image 
              source={{ uri: 'https://i.pravatar.cc/150?img=12' }} 
              size={50} 
            />
            <View style={{ marginLeft: 15, flexDirection: 'column' }}>
              <Title style={styles.title}>Admin User</Title>
              <Caption style={styles.caption}>admin@tradeease.com</Caption>
            </View>
          </View>
        </View>

        <Divider style={{ marginVertical: 10 }} />

        {/* Navigation Sections */}
        <Drawer.Section>
          <Drawer.Item
            icon={({color}) => <Icon name="view-dashboard" color={color} size={24} />}
            label="Dashboard"
            active={active === 'dashboard'}
            onPress={() => setActive('dashboard')}
          />
          <Drawer.Item
            icon={({color}) => <Icon name="account-group" color={color} size={24} />}
            label="Customers"
            active={active === 'customers'}
            onPress={() => setActive('customers')}
          />
          <Drawer.Item
            icon={({color}) => <Icon name="package-variant-closed" color={color} size={24} />}
            label="Orders"
            active={active === 'orders'}
            onPress={() => setActive('orders')}
          />
          <Drawer.Item
            icon={({color}) => <Icon name="alert-circle" color={color} size={24} />}
            label="Complaints"
            active={active === 'complaints'}
            onPress={() => setActive('complaints')}
          />
        </Drawer.Section>

        <Divider style={{ marginVertical: 10 }} />

        <Drawer.Section title="Preferences">
          <Drawer.Item
            icon="cog"
            label="Settings"
            onPress={() => {}}
          />
        </Drawer.Section>
      </DrawerContentScrollView>

      {/* Footer Section */}
      <Drawer.Section style={styles.bottomDrawerSection}>
        <Drawer.Item 
          icon="exit-to-app" 
          label="Sign Out" 
          onPress={() => {}}
        />
      </Drawer.Section>
    </View>
  );
};

const styles = StyleSheet.create({
  userInfoSection: { paddingLeft: 20 },
  title: { fontSize: 16, marginTop: 3, fontWeight: 'bold' },
  caption: { fontSize: 14, lineHeight: 14 },
  bottomDrawerSection: { marginBottom: 15, borderTopColor: '#f4f4f4', borderTopWidth: 1 },
});

export default DrawerMenu;
```

---

## 3. Dashboard (Home Screen)
**Concept:** An information-dense but organized "Overview" screen. Uses Cards for KPIs and specific container styling for charts (placeholders shown).

```jsx
import React from 'react';
import { ScrollView, View, StyleSheet, Dimensions } from 'react-native';
import { Card, Text, Avatar, IconButton, useTheme, Surface } from 'react-native-paper';

// Mock KPI Component
const StatCard = ({ icon, label, value, trend, color }) => {
  const theme = useTheme();
  return (
    <Card style={styles.statCard} mode="elevated">
      <Card.Content style={styles.statContent}>
        <View>
          <Text variant="labelMedium" style={{color: theme.colors.secondary}}>{label}</Text>
          <Text variant="headlineMedium" style={{fontWeight: 'bold'}}>{value}</Text>
          <Text variant="bodySmall" style={{color: 'green'}}>+{trend}% vs last week</Text>
        </View>
        <Avatar.Icon size={48} icon={icon} style={{backgroundColor: color}} />
      </Card.Content>
    </Card>
  );
};

const DashboardScreen = () => {
  const theme = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header Greeting */}
      <View style={styles.header}>
        <View>
          <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>Dashboard</Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.secondary }}>Overview of business performance</Text>
        </View>
        <IconButton icon="bell-outline" mode="contained-tonal" />
      </View>

      {/* KPI Section */}
      <View style={styles.kpiContainer}>
        <StatCard icon="account-multiple" label="Total Customers" value="1,240" trend="12" color={theme.colors.primaryContainer} />
        <StatCard icon="cart" label="Active Orders" value="45" trend="8" color={theme.colors.secondaryContainer} />
        <StatCard icon="alert-circle" label="Pending Complaints" value="5" trend="-2" color={theme.colors.errorContainer} />
      </View>

      {/* Chart Section Placeholder */}
      <Card style={styles.chartCard}>
        <Card.Title title="Weekly Revenue" subtitle="Last 7 days" left={(props) => <Avatar.Icon {...props} icon="chart-line" />} />
        <Card.Content>
          <Surface style={[styles.chartPlaceholder, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Text variant="bodyMedium">BarChart Component Area</Text>
            <Text variant="caption">React Native SVG Charts would render here</Text>
          </Surface>
        </Card.Content>
      </Card>

      {/* Recent Activity Section */}
      <View style={styles.sectionHeader}>
         <Text variant="titleMedium">Recent Activity</Text>
         <Button mode="text">View All</Button>
      </View>
      <Card mode="outlined" style={styles.activityCard}>
          <Card.Title 
            title="Order #ORD-2024-001" 
            subtitle="Placed by John Doe • 2 mins ago"
            left={(props) => <Avatar.Icon {...props} icon="cart-outline" size={40} />}
            right={(props) => <IconButton {...props} icon="chevron-right" />}
          />
          <Divider />
          <Card.Title 
            title="New Complaint" 
            subtitle="Product issue reported • 15 mins ago"
            left={(props) => <Avatar.Icon {...props} icon="alert-octagon-outline" size={40} style={{backgroundColor: theme.colors.errorContainer}} />}
            right={(props) => <IconButton {...props} icon="chevron-right" />}
          />
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  kpiContainer: { gap: 12, marginBottom: 20 },
  statCard: { marginBottom: 0 },
  statContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chartCard: { marginBottom: 20 },
  chartPlaceholder: { height: 180, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  activityCard: { marginBottom: 30 }
});

export default DashboardScreen;
```

---

## 4. Sample Screen (Customers List)
**Concept:** A standard "Management List" pattern. Features a search bar, filter chips, card-based list items with status styling, and a Floating Action Button (FAB) for creating new items.

```jsx
import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Searchbar, Chip, Card, Text, FAB, Badge, useTheme, Avatar } from 'react-native-paper';

// Mock Data
const CUSTOMERS = [
  { id: '1', name: 'Alice Smith', email: 'alice@example.com', status: 'Active', type: 'VIP', initials: 'AS' },
  { id: '2', name: 'Bob Jones', email: 'bob@example.com', status: 'Inactive', type: 'Regular', initials: 'BJ' },
  { id: '3', name: 'Charlie Day', email: 'charlie@example.com', status: 'Active', type: 'Premium', initials: 'CD' },
];

const CustomerListScreen = () => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = React.useState('');

  const renderItem = ({ item }) => (
    <Card style={styles.card} onPress={() => {}}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.userInfo}>
            <Avatar.Text size={40} label={item.initials} />
            <View style={{ marginLeft: 12 }}>
              <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{item.name}</Text>
              <Text variant="bodySmall" style={{ color: theme.colors.secondary }}>{item.email}</Text>
            </View>
          </View>
          <Badge 
            style={[
              styles.badge, 
              { backgroundColor: item.status === 'Active' ? theme.colors.primaryContainer : theme.colors.surfaceVariant,
                color: item.status === 'Active' ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant }
            ]}
          >
            {item.status}
          </Badge>
        </View>
        
        <View style={styles.cardFooter}>
          <Chip icon="star" mode="outlined" style={{ height: 32 }}>{item.type}</Chip>
          <Text variant="caption" style={{ alignSelf: 'center' }}>ID: {item.id}</Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Search & Filter Section */}
      <View style={styles.filterSection}>
        <Searchbar
          placeholder="Search customers..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          elevation={1}
        />
        <View style={styles.chipContainer}>
          <Chip onPress={() => {}} selected>All</Chip>
          <Chip onPress={() => {}}>Active</Chip>
          <Chip onPress={() => {}}>VIP</Chip>
        </View>
      </View>

      {/* List content */}
      <FlatList
        data={CUSTOMERS}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />

      {/* Primary Action */}
      <FAB
        icon="plus"
        label="New Customer"
        style={[styles.fab, { backgroundColor: theme.colors.primaryContainer }]}
        color={theme.colors.onPrimaryContainer}
        onPress={() => console.log('Pressed')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  filterSection: { padding: 16, paddingBottom: 8 },
  searchBar: { marginBottom: 12 },
  chipContainer: { flexDirection: 'row', gap: 8 },
  listContent: { padding: 16, paddingTop: 8 },
  card: { marginBottom: 12 },
  cardContent: { gap: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  badge: { alignSelf: 'flex-start' },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0 },
});

export default CustomerListScreen;
```


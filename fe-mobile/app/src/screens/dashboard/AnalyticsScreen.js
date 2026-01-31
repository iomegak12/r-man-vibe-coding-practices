import React from 'react';
import { ScrollView, View, StyleSheet, Dimensions } from 'react-native';
import {
  Card,
  Text,
  useTheme,
  Surface,
  Button,
  IconButton,
  Avatar,
} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

// Mock Chart Component (placeholder for actual charts)
const ChartPlaceholder = ({ title, icon, color }) => {
  const theme = useTheme();
  return (
    <Card style={styles.chartCard} mode="elevated">
      <Card.Content>
        <View style={styles.chartHeader}>
          <View style={styles.chartTitleContainer}>
            <Avatar.Icon size={32} icon={icon} style={{ backgroundColor: color }} />
            <Text variant="titleMedium" style={styles.chartTitle}>
              {title}
            </Text>
          </View>
          <IconButton
            icon="dots-vertical"
            size={20}
            onPress={() => {}}
          />
        </View>
        <View style={styles.chartPlaceholder}>
          <MaterialCommunityIcons
            name="chart-line-variant"
            size={48}
            color={theme.colors.onSurfaceVariant}
          />
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
            Chart visualization will be implemented here
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
};

// Analytics Card Component
const AnalyticsCard = ({ title, value, subtitle, icon, color, trend }) => {
  const theme = useTheme();
  return (
    <Card style={styles.analyticsCard} mode="elevated">
      <Card.Content>
        <View style={styles.analyticsHeader}>
          <View>
            <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {title}
            </Text>
            <Text variant="headlineMedium" style={{ fontWeight: 'bold', marginVertical: 4 }}>
              {value}
            </Text>
            {subtitle && (
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {subtitle}
              </Text>
            )}
          </View>
          <View style={styles.analyticsIcon}>
            <MaterialCommunityIcons name={icon} size={24} color={color} />
            {trend && (
              <Text variant="bodySmall" style={{ color: trend > 0 ? 'green' : 'red', marginTop: 4 }}>
                {trend > 0 ? '+' : ''}{trend}%
              </Text>
            )}
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

const AnalyticsScreen = ({ navigation }) => {
  const theme = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineMedium" style={{ fontWeight: 'bold' }}>
          Analytics & Reports
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
          Business insights and performance metrics
        </Text>
      </View>

      {/* Key Metrics */}
      <View style={styles.section}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Key Performance Indicators
        </Text>
        <View style={styles.metricsGrid}>
          <AnalyticsCard
            title="Revenue"
            value="$45,230"
            subtitle="This month"
            icon="cash-multiple"
            color="#4CAF50"
            trend={12.5}
          />
          <AnalyticsCard
            title="Orders"
            value="1,247"
            subtitle="This month"
            icon="package-variant-closed"
            color="#2196F3"
            trend={8.2}
          />
          <AnalyticsCard
            title="Customers"
            value="3,891"
            subtitle="Total active"
            icon="account-group"
            color="#FF9800"
            trend={15.3}
          />
          <AnalyticsCard
            title="Complaints"
            value="23"
            subtitle="Unresolved"
            icon="alert-circle"
            color="#F44336"
            trend={-5.1}
          />
        </View>
      </View>

      {/* Charts Section */}
      <View style={styles.section}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Trends & Analytics
        </Text>

        <ChartPlaceholder
          title="Revenue Trends"
          icon="trending-up"
          color="#4CAF50"
        />

        <ChartPlaceholder
          title="Order Status Distribution"
          icon="chart-pie"
          color="#2196F3"
        />

        <ChartPlaceholder
          title="Customer Satisfaction"
          icon="emoticon-happy"
          color="#FF9800"
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.section}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Quick Actions
        </Text>
        <View style={styles.actionsGrid}>
          <Button
            mode="contained"
            icon="file-pdf-box"
            onPress={() => {}}
            style={styles.actionButton}
            contentStyle={styles.actionButtonContent}
          >
            Export Report
          </Button>
          <Button
            mode="outlined"
            icon="email"
            onPress={() => {}}
            style={styles.actionButton}
            contentStyle={styles.actionButtonContent}
          >
            Email Report
          </Button>
          <Button
            mode="outlined"
            icon="calendar"
            onPress={() => {}}
            style={styles.actionButton}
            contentStyle={styles.actionButtonContent}
          >
            Schedule Report
          </Button>
          <Button
            mode="outlined"
            icon="settings"
            onPress={() => {}}
            style={styles.actionButton}
            contentStyle={styles.actionButtonContent}
          >
            Customize
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
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  analyticsCard: {
    flex: 1,
    minWidth: (width - 40 - 12) / 2, // 2 columns with gap
    marginBottom: 12,
  },
  analyticsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  analyticsIcon: {
    alignItems: 'center',
  },
  chartCard: {
    marginBottom: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartTitle: {
    marginLeft: 12,
    fontWeight: '600',
  },
  chartPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: (width - 40 - 24) / 2, // 2 columns with gap
  },
  actionButtonContent: {
    flexDirection: 'column',
    height: 60,
  },
});

export default AnalyticsScreen;
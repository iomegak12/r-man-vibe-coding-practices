import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Text, Card, Surface, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../constants';

// Context
import { useAuth } from '../../contexts/AuthContext';

const WelcomeDashboardScreen = ({ navigation }) => {
  const theme = useTheme();
  const { setWelcomeSeen } = useAuth();

  const handleGetStarted = async () => {
    try {
      // Mark welcome screens as completed using auth context
      await setWelcomeSeen();
      // Navigation will be handled automatically by AppNavigator
    } catch (error) {
      console.error('Error saving welcome completion:', error);
      // Still proceed even if there's an error
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const dashboardFeatures = [
    {
      icon: 'chart-line',
      title: 'Real-time Analytics',
      value: 'Live Business Insights',
      color: '#4CAF50'
    },
    {
      icon: 'speedometer',
      title: 'Performance Metrics',
      value: 'KPI Tracking',
      color: '#2196F3'
    },
    {
      icon: 'bell-ring',
      title: 'Smart Notifications',
      value: 'Priority Alerts',
      color: '#FF9800'
    }
  ];

  const mockChartData = [
    { day: 'Mon', value: 40 },
    { day: 'Tue', value: 65 },
    { day: 'Wed', value: 80 },
    { day: 'Thu', value: 45 },
    { day: 'Fri', value: 95 },
    { day: 'Sat', value: 70 },
    { day: 'Sun', value: 55 }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Icon 
              name="view-dashboard" 
              size={64} 
              color={theme.colors.primary}
              style={styles.headerIcon}
            />
            <Text 
              variant="headlineMedium" 
              style={[styles.title, { color: theme.colors.onBackground }]}
            >
              Intelligent Dashboard
            </Text>
            <Text 
              variant="bodyLarge" 
              style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
            >
              Get actionable insights and make data-driven decisions with comprehensive business analytics
            </Text>
          </View>

          {/* Dashboard Preview */}
          <Card style={styles.dashboardPreview} mode="elevated">
            <Card.Content style={styles.dashboardContent}>
              <Text 
                variant="titleMedium" 
                style={[styles.previewTitle, { color: theme.colors.onSurface }]}
              >
                Dashboard Preview
              </Text>

              {/* Mock KPI Cards */}
              <View style={styles.kpiContainer}>
                {dashboardFeatures.map((feature, index) => (
                  <Surface 
                    key={index}
                    style={[styles.kpiCard, { backgroundColor: theme.colors.surface }]}
                    elevation={1}
                  >
                    <Icon 
                      name={feature.icon} 
                      size={24} 
                      color={feature.color}
                    />
                    <Text 
                      variant="bodySmall" 
                      style={[styles.kpiLabel, { color: theme.colors.onSurfaceVariant }]}
                    >
                      {feature.title}
                    </Text>
                    <Text 
                      variant="labelMedium" 
                      style={[styles.kpiValue, { color: theme.colors.onSurface }]}
                    >
                      {feature.value}
                    </Text>
                  </Surface>
                ))}
              </View>

              {/* Mock Chart */}
              <Surface 
                style={[styles.chartContainer, { backgroundColor: theme.colors.surfaceVariant }]}
                elevation={1}
              >
                <View style={styles.chartHeader}>
                  <Icon 
                    name="chart-bar" 
                    size={20} 
                    color={theme.colors.primary}
                  />
                  <Text 
                    variant="labelMedium" 
                    style={[styles.chartTitle, { color: theme.colors.onSurfaceVariant }]}
                  >
                    Weekly Performance
                  </Text>
                </View>
                
                <View style={styles.chartBars}>
                  {mockChartData.map((item, index) => (
                    <View key={index} style={styles.chartBarContainer}>
                      <View 
                        style={[
                          styles.chartBar, 
                          { 
                            height: item.value,
                            backgroundColor: theme.colors.primary 
                          }
                        ]} 
                      />
                      <Text 
                        variant="labelSmall" 
                        style={[styles.chartLabel, { color: theme.colors.onSurfaceVariant }]}
                      >
                        {item.day}
                      </Text>
                    </View>
                  ))}
                </View>
              </Surface>
            </Card.Content>
          </Card>

          {/* Key Benefits */}
          <View style={styles.benefitsSection}>
            <Text 
              variant="titleLarge" 
              style={[styles.benefitsTitle, { color: theme.colors.onBackground }]}
            >
              Why Administrators Choose TradeEase
            </Text>
            
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <Icon 
                  name="lightning-bolt" 
                  size={24} 
                  color={theme.colors.secondary} 
                  style={styles.benefitIcon}
                />
                <View style={styles.benefitText}>
                  <Text 
                    variant="titleSmall" 
                    style={[styles.benefitTitle, { color: theme.colors.onBackground }]}
                  >
                    Increased Efficiency
                  </Text>
                  <Text 
                    variant="bodySmall" 
                    style={[styles.benefitDescription, { color: theme.colors.onSurfaceVariant }]}
                  >
                    Reduce administrative tasks by 60% with automated workflows
                  </Text>
                </View>
              </View>

              <View style={styles.benefitItem}>
                <Icon 
                  name="clock-time-four" 
                  size={24} 
                  color={theme.colors.secondary} 
                  style={styles.benefitIcon}
                />
                <View style={styles.benefitText}>
                  <Text 
                    variant="titleSmall" 
                    style={[styles.benefitTitle, { color: theme.colors.onBackground }]}
                  >
                    Real-time Access
                  </Text>
                  <Text 
                    variant="bodySmall" 
                    style={[styles.benefitDescription, { color: theme.colors.onSurfaceVariant }]}
                  >
                    Instant access to critical business data anywhere, anytime
                  </Text>
                </View>
              </View>

              <View style={styles.benefitItem}>
                <Icon 
                  name="shield-check" 
                  size={24} 
                  color={theme.colors.secondary} 
                  style={styles.benefitIcon}
                />
                <View style={styles.benefitText}>
                  <Text 
                    variant="titleSmall" 
                    style={[styles.benefitTitle, { color: theme.colors.onBackground }]}
                  >
                    Enterprise Security
                  </Text>
                  <Text 
                    variant="bodySmall" 
                    style={[styles.benefitDescription, { color: theme.colors.onSurfaceVariant }]}
                  >
                    Bank-grade security with role-based access controls
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer Navigation */}
      <View style={[styles.footer, { backgroundColor: theme.colors.background }]}>
        <Button 
          mode="outlined" 
          onPress={handleBack}
          style={styles.backButton}
          icon="arrow-left"
        >
          Back
        </Button>
        
        <View style={styles.pagination}>
          <View style={[styles.dot, { backgroundColor: theme.colors.outline }]} />
          <View style={[styles.dot, { backgroundColor: theme.colors.outline }]} />
          <View style={[styles.dot, styles.activeDot, { backgroundColor: theme.colors.primary }]} />
        </View>
        
        <Button 
          mode="contained" 
          onPress={handleGetStarted}
          style={styles.getStartedButton}
          icon="rocket-launch"
          contentStyle={styles.getStartedContent}
        >
          Get Started
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 100, // Space for footer
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  headerIcon: {
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 24,
  },
  dashboardPreview: {
    marginBottom: 32,
  },
  dashboardContent: {
    padding: 20,
  },
  previewTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  kpiContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  kpiCard: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  kpiLabel: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
  kpiValue: {
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 2,
    textAlign: 'center',
  },
  chartContainer: {
    padding: 16,
    borderRadius: 8,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  chartTitle: {
    marginLeft: 8,
    fontWeight: '500',
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 80,
  },
  chartBarContainer: {
    alignItems: 'center',
    flex: 1,
  },
  chartBar: {
    width: 16,
    borderRadius: 2,
    marginBottom: 4,
  },
  chartLabel: {
    fontSize: 10,
  },
  benefitsSection: {
    marginTop: 8,
  },
  benefitsTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  benefitsList: {
    gap: 20,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  benefitIcon: {
    marginRight: 16,
    marginTop: 2,
  },
  benefitText: {
    flex: 1,
  },
  benefitTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  benefitDescription: {
    lineHeight: 18,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    width: 100,
    borderRadius: 8,
  },
  pagination: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    width: 24,
  },
  getStartedButton: {
    width: 120,
    borderRadius: 8,
  },
  getStartedContent: {
    flexDirection: 'row-reverse',
    paddingVertical: 4,
  },
});

export default WelcomeDashboardScreen;
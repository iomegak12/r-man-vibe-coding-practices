import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Text, Card, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const WelcomeFeaturesScreen = ({ navigation }) => {
  const theme = useTheme();

  const handleNext = () => {
    navigation.navigate('WelcomeDashboard');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSkip = () => {
    navigation.replace('Auth', { screen: 'Login' });
  };

  const features = [
    {
      icon: 'account-multiple',
      title: 'Customer Management',
      description: 'Comprehensive customer profiles with order history, complaint tracking, and status management',
      highlights: [
        'View and edit customer information',
        'Track customer lifecycle and preferences',
        'Manage customer status and classifications',
        'Access complete order and complaint history'
      ]
    },
    {
      icon: 'cart',
      title: 'Order Management',
      description: 'Complete order lifecycle management from placement to delivery and returns',
      highlights: [
        'Real-time order status tracking',
        'Order modification and cancellation',
        'Return request processing',
        'Delivery management and updates'
      ]
    },
    {
      icon: 'alert-circle',
      title: 'Complaint Resolution',
      description: 'Streamlined complaint management system with assignment and resolution tracking',
      highlights: [
        'Priority-based complaint assignment',
        'Real-time resolution tracking',
        'Communication thread management',
        'Performance analytics and reporting'
      ]
    }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text 
              variant="headlineMedium" 
              style={[styles.title, { color: theme.colors.onBackground }]}
            >
              Powerful Management Tools
            </Text>
            <Text 
              variant="bodyLarge" 
              style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
            >
              Everything you need to manage your business operations efficiently
            </Text>
          </View>

          {/* Feature Cards */}
          <View style={styles.featuresContainer}>
            {features.map((feature, index) => (
              <Card key={index} style={styles.featureCard} mode="elevated">
                <Card.Content style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <View 
                      style={[
                        styles.iconContainer, 
                        { backgroundColor: theme.colors.primaryContainer }
                      ]}
                    >
                      <Icon 
                        name={feature.icon} 
                        size={32} 
                        color={theme.colors.primary} 
                      />
                    </View>
                    
                    <View style={styles.headerText}>
                      <Text 
                        variant="titleLarge" 
                        style={[styles.featureTitle, { color: theme.colors.onSurface }]}
                      >
                        {feature.title}
                      </Text>
                      <Text 
                        variant="bodyMedium" 
                        style={[styles.featureDescription, { color: theme.colors.onSurfaceVariant }]}
                      >
                        {feature.description}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.highlightsList}>
                    {feature.highlights.map((highlight, highlightIndex) => (
                      <View key={highlightIndex} style={styles.highlightItem}>
                        <Icon 
                          name="check" 
                          size={16} 
                          color={theme.colors.primary} 
                          style={styles.checkIcon}
                        />
                        <Text 
                          variant="bodySmall" 
                          style={[styles.highlightText, { color: theme.colors.onSurface }]}
                        >
                          {highlight}
                        </Text>
                      </View>
                    ))}
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>

          {/* Call to Action */}
          <Card style={styles.ctaCard} mode="outlined">
            <Card.Content style={styles.ctaContent}>
              <Icon 
                name="rocket-launch" 
                size={48} 
                color={theme.colors.secondary} 
                style={styles.ctaIcon}
              />
              <Text 
                variant="titleMedium" 
                style={[styles.ctaTitle, { color: theme.colors.onSurface }]}
              >
                Ready to Streamline Operations?
              </Text>
              <Text 
                variant="bodyMedium" 
                style={[styles.ctaDescription, { color: theme.colors.onSurfaceVariant }]}
              >
                Access real-time insights and manage your business from anywhere with TradeEase Mobile's intuitive interface.
              </Text>
            </Card.Content>
          </Card>
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
          <View style={[styles.dot, styles.activeDot, { backgroundColor: theme.colors.primary }]} />
          <View style={[styles.dot, { backgroundColor: theme.colors.outline }]} />
        </View>
        
        <Button 
          mode="contained" 
          onPress={handleNext}
          style={styles.nextButton}
          icon="arrow-right"
          contentStyle={styles.nextButtonContent}
        >
          Next
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
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresContainer: {
    gap: 20,
    marginBottom: 24,
  },
  featureCard: {
    marginBottom: 0,
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  featureTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  featureDescription: {
    lineHeight: 20,
  },
  highlightsList: {
    gap: 8,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  highlightText: {
    flex: 1,
    lineHeight: 18,
  },
  ctaCard: {
    marginTop: 8,
  },
  ctaContent: {
    alignItems: 'center',
    padding: 24,
  },
  ctaIcon: {
    marginBottom: 16,
  },
  ctaTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  ctaDescription: {
    textAlign: 'center',
    lineHeight: 20,
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
  nextButton: {
    width: 100,
    borderRadius: 8,
  },
  nextButtonContent: {
    flexDirection: 'row-reverse',
    paddingVertical: 4,
  },
});

export default WelcomeFeaturesScreen;
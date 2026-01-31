import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Button, Text, Surface, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Context
import { useAuth } from '../../contexts/AuthContext';

const WelcomeIntroScreen = ({ navigation }) => {
  const theme = useTheme();
  const { setWelcomeSeen } = useAuth();

  const handleNext = () => {
    navigation.navigate('WelcomeFeatures');
  };

  const handleSkip = async () => {
    try {
      await setWelcomeSeen();
      // Navigation will be handled automatically by AppNavigator
    } catch (error) {
      console.error('Error saving welcome completion:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {/* Header with Logo */}
        <View style={styles.header}>
          <Surface 
            style={[
              styles.logoContainer, 
              { backgroundColor: theme.colors.primaryContainer }
            ]} 
            elevation={3}
          >
            <Text 
              variant="displaySmall" 
              style={[styles.logoText, { color: theme.colors.primary }]}
            >
              TE
            </Text>
          </Surface>
          
          <Text 
            variant="headlineLarge" 
            style={[styles.title, { color: theme.colors.onBackground }]}
          >
            TradeEase Mobile
          </Text>
          
          <Text 
            variant="titleMedium" 
            style={[styles.tagline, { color: theme.colors.primary }]}
          >
            Your Work, Simplified
          </Text>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          <Surface 
            style={[
              styles.featureCard, 
              { backgroundColor: theme.colors.surface }
            ]} 
            elevation={2}
          >
            <Icon 
              name="briefcase-account" 
              size={64} 
              color={theme.colors.primary} 
              style={styles.featureIcon}
            />
            
            <Text 
              variant="headlineSmall" 
              style={[styles.featureTitle, { color: theme.colors.onSurface }]}
            >
              Administrator Portal
            </Text>
            
            <Text 
              variant="bodyLarge" 
              style={[styles.featureDescription, { color: theme.colors.onSurfaceVariant }]}
            >
              Comprehensive mobile solution designed for business administrators to manage customers, orders, and complaints with enterprise-grade efficiency.
            </Text>
          </Surface>

          {/* Key Benefits */}
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Icon 
                name="check-circle" 
                size={24} 
                color={theme.colors.primary} 
                style={styles.benefitIcon}
              />
              <Text 
                variant="bodyMedium" 
                style={[styles.benefitText, { color: theme.colors.onBackground }]}
              >
                Real-time business management on-the-go
              </Text>
            </View>
            
            <View style={styles.benefitItem}>
              <Icon 
                name="check-circle" 
                size={24} 
                color={theme.colors.primary} 
                style={styles.benefitIcon}
              />
              <Text 
                variant="bodyMedium" 
                style={[styles.benefitText, { color: theme.colors.onBackground }]}
              >
                Secure access to customer and order data
              </Text>
            </View>
            
            <View style={styles.benefitItem}>
              <Icon 
                name="check-circle" 
                size={24} 
                color={theme.colors.primary} 
                style={styles.benefitIcon}
              />
              <Text 
                variant="bodyMedium" 
                style={[styles.benefitText, { color: theme.colors.onBackground }]}
              >
                Streamlined complaint resolution workflow
              </Text>
            </View>
          </View>
        </View>

        {/* Footer Navigation */}
        <View style={styles.footer}>
          <Button 
            mode="text" 
            onPress={handleSkip}
            style={styles.skipButton}
          >
            Skip
          </Button>
          
          <View style={styles.pagination}>
            <View style={[styles.dot, styles.activeDot, { backgroundColor: theme.colors.primary }]} />
            <View style={[styles.dot, { backgroundColor: theme.colors.outline }]} />
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
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logoText: {
    fontWeight: 'bold',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tagline: {
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    marginVertical: 40,
  },
  featureCard: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  featureIcon: {
    marginBottom: 16,
  },
  featureTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  featureDescription: {
    textAlign: 'center',
    lineHeight: 24,
  },
  benefitsList: {
    gap: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitIcon: {
    marginRight: 12,
  },
  benefitText: {
    flex: 1,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 24,
  },
  skipButton: {
    width: 80,
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

export default WelcomeIntroScreen;
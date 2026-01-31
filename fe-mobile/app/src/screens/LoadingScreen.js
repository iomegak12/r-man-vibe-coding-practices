import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const LoadingScreen = () => {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <ActivityIndicator 
          size="large" 
          color={theme.colors.primary}
          style={styles.loader}
        />
        <Text 
          variant="titleMedium" 
          style={[styles.text, { color: theme.colors.onBackground }]}
        >
          Loading TradeEase...
        </Text>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    marginBottom: 16,
  },
  text: {
    textAlign: 'center',
  },
});

export default LoadingScreen;
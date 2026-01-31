import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, Text, TextInput, Surface, useTheme, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

// Context
import { useAuth } from '../../contexts/AuthContext';

const ForgotPasswordScreen = ({ navigation }) => {
  const theme = useTheme();
  const { forgotPassword } = useAuth();

  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [emailSent, setEmailSent] = React.useState(false);

  const handleSendResetEmail = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setLoading(true);

    try {
      const result = await forgotPassword(email);

      if (result.success) {
        setEmailSent(true);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      Alert.alert('Error', 'Network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.goBack();
  };

  if (emailSent) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Surface
              style={[styles.iconContainer, { backgroundColor: theme.colors.primaryContainer }]}
              elevation={2}
            >
              <IconButton
                icon="email-check"
                iconColor={theme.colors.primary}
                size={32}
              />
            </Surface>
            <Text
              variant="headlineSmall"
              style={[styles.title, { color: theme.colors.onBackground }]}
            >
              Check Your Email
            </Text>
            <Text
              variant="bodyMedium"
              style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
            >
              We've sent password reset instructions to {email}
            </Text>
          </View>

          <View style={styles.form}>
            <Text
              variant="bodySmall"
              style={[styles.note, { color: theme.colors.onSurfaceVariant }]}
            >
              Didn't receive the email? Check your spam folder or try again.
            </Text>

            <Button
              mode="outlined"
              onPress={() => setEmailSent(false)}
              style={styles.button}
            >
              Try Different Email
            </Button>

            <Button
              mode="contained"
              onPress={handleBackToLogin}
              style={styles.button}
            >
              Back to Login
            </Button>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Surface
            style={[styles.iconContainer, { backgroundColor: theme.colors.primaryContainer }]}
            elevation={2}
          >
            <IconButton
              icon="lock-reset"
              iconColor={theme.colors.primary}
              size={32}
            />
          </Surface>
          <Text
            variant="headlineSmall"
            style={[styles.title, { color: theme.colors.onBackground }]}
          >
            Forgot Password
          </Text>
          <Text
            variant="bodyMedium"
            style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
          >
            Enter your email address and we'll send you a link to reset your password
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            style={styles.input}
          />

          <Button
            mode="contained"
            onPress={handleSendResetEmail}
            loading={loading}
            disabled={loading || !email}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>

          <Button
            mode="text"
            onPress={handleBackToLogin}
            style={styles.backButton}
          >
            Back to Login
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center'
  },
  header: {
    alignItems: 'center',
    marginBottom: 48
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  title: {
    textAlign: 'center',
    marginBottom: 8
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 20
  },
  form: {
    width: '100%'
  },
  input: {
    marginBottom: 16
  },
  button: {
    marginTop: 8
  },
  buttonContent: {
    paddingVertical: 8
  },
  backButton: {
    marginTop: 16
  },
  note: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18
  },
  errorText: {
    marginBottom: 16,
    textAlign: 'center'
  }
});

export default ForgotPasswordScreen;
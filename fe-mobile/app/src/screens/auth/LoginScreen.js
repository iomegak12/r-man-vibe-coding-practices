import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Button, Text, TextInput, Surface, useTheme, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

// Context
import { useAuth } from '../../contexts/AuthContext';

// Constants
import { ROUTES } from '../../constants';

const LoginScreen = ({ navigation }) => {
  const theme = useTheme();
  const { login } = useAuth();
  
  const [email, setEmail] = React.useState('admin@tradease.com');
  const [password, setPassword] = React.useState('Admin@123');
  const [loading, setLoading] = React.useState(false);
  const [secureTextEntry, setSecureTextEntry] = React.useState(true);
  const [error, setError] = React.useState('');

  const loadAdminCredentials = () => {
    setEmail('jtdhamodharan@gmail.com');
    setPassword('Madurai54321!');
  };

  const loadCustomerCredentials = () => {
    setEmail('iomega.azure@gmail.com');
    setPassword('Madurai54321!');
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await login(email, password);

      if (!result.success) {
        setError(result.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {/* Branding Section */}
        <View style={styles.header}>
          <Surface 
            style={[
              styles.logoPlaceholder, 
              { backgroundColor: theme.colors.primaryContainer }
            ]} 
            elevation={2}
          >
            <Text 
              variant="headlineSmall" 
              style={[styles.logoText, { color: theme.colors.primary }]}
            >
              TE
            </Text>
          </Surface>
          <Text 
            variant="headlineSmall" 
            style={[styles.title, { color: theme.colors.onBackground }]}
          >
            TradeEase Mobile
          </Text>
          <Text 
            variant="bodyMedium" 
            style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
          >
            Administrator Portal
          </Text>
        </View>

        {/* Login Form */}
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
          
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry={secureTextEntry}
            autoComplete="password"
            style={styles.input}
            right={
              <TextInput.Icon
                icon={secureTextEntry ? 'eye' : 'eye-off'}
                onPress={() => setSecureTextEntry(!secureTextEntry)}
              />
            }
          />
          
          {error ? (
            <Text 
              variant="bodySmall" 
              style={[styles.errorText, { color: theme.colors.error }]}
            >
              {error}
            </Text>
          ) : null}
          
          <Button
            mode="text"
            onPress={() => navigation.navigate(ROUTES.AUTH.FORGOT_PASSWORD)}
            style={styles.forgotPasswordButton}
            contentStyle={styles.forgotPasswordContent}
          >
            Forgot Password?
          </Button>
          
          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading || !email || !password}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
          
          {/* Demo Credential Buttons */}
          <View style={styles.demoCredentials}>
            <View style={styles.credentialButtons}>
              <IconButton
                icon="account-tie"
                mode="outlined"
                iconColor={theme.colors.primary}
                size={24}
                onPress={loadAdminCredentials}
                style={[styles.credentialButton, { borderColor: theme.colors.outline }]}
                tooltip="Load Admin Credentials"
              />
              
              <IconButton
                icon="account"
                mode="outlined"
                iconColor={theme.colors.secondary}
                size={24}
                onPress={loadCustomerCredentials}
                style={[styles.credentialButton, { borderColor: theme.colors.outline }]}
                tooltip="Load Customer Credentials"
              />
            </View>
          </View>
          
          <Text 
            variant="bodySmall" 
            style={[styles.demoNote, { color: theme.colors.onSurfaceVariant }]}
          >
            Tap the icons above to load demo credentials automatically
          </Text>
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
  logoPlaceholder: { 
    width: 80, 
    height: 80, 
    borderRadius: 16, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 16 
  },
  logoText: {
    fontWeight: 'bold',
  },
  title: { 
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
  },
  form: { 
    gap: 16 
  },
  input: { 
    backgroundColor: 'transparent' 
  },
  button: { 
    marginTop: 8, 
    borderRadius: 8 
  },
  buttonContent: {
    paddingVertical: 8,
  },
  demoCredentials: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  demoLabel: {
    marginBottom: 12,
    fontWeight: '500',
  },
  credentialButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  credentialButton: {
    borderWidth: 1,
    borderRadius: 8,
  },
  credentialLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: -8,
  },
  demoNote: {
    textAlign: 'center',
    marginTop: 24,
    fontStyle: 'italic',
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 8,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: -8,
    marginBottom: 8,
  },
  forgotPasswordContent: {
    paddingVertical: 4,
  },
});

export default LoginScreen;
import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, Text, TextInput, Surface, useTheme, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

// Context
import { useAuth } from '../../contexts/AuthContext';

const ResetPasswordScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const { resetPassword } = useAuth();

  const [token, setToken] = React.useState(route.params?.token || '');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [secureTextEntry, setSecureTextEntry] = React.useState(true);
  const [secureConfirmTextEntry, setSecureConfirmTextEntry] = React.useState(true);

  const handleResetPassword = async () => {
    if (!token || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword(token, newPassword);

      if (result.success) {
        Alert.alert(
          'Success',
          'Password reset successful! You can now login with your new password.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      console.error('Reset password error:', error);
      Alert.alert('Error', 'Network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Surface
            style={[styles.iconContainer, { backgroundColor: theme.colors.primaryContainer }]}
            elevation={2}
          >
            <IconButton
              icon="lock-check"
              iconColor={theme.colors.primary}
              size={32}
            />
          </Surface>
          <Text
            variant="headlineSmall"
            style={[styles.title, { color: theme.colors.onBackground }]}
          >
            Reset Password
          </Text>
          <Text
            variant="bodyMedium"
            style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
          >
            Enter your new password below
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            label="Reset Token"
            value={token}
            onChangeText={setToken}
            mode="outlined"
            autoCapitalize="none"
            style={styles.input}
            placeholder="Enter the token from your email"
          />

          <TextInput
            label="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            mode="outlined"
            secureTextEntry={secureTextEntry}
            autoComplete="password-new"
            style={styles.input}
            right={
              <TextInput.Icon
                icon={secureTextEntry ? 'eye' : 'eye-off'}
                onPress={() => setSecureTextEntry(!secureTextEntry)}
              />
            }
          />

          <TextInput
            label="Confirm New Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            mode="outlined"
            secureTextEntry={secureConfirmTextEntry}
            autoComplete="password-new"
            style={styles.input}
            right={
              <TextInput.Icon
                icon={secureConfirmTextEntry ? 'eye' : 'eye-off'}
                onPress={() => setSecureConfirmTextEntry(!secureConfirmTextEntry)}
              />
            }
          />

          <Button
            mode="contained"
            onPress={handleResetPassword}
            loading={loading}
            disabled={loading || !token || !newPassword || !confirmPassword}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            Back
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
  }
});

export default ResetPasswordScreen;
import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { theme } from '../../theme';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { supabase } from '../../initSupabase';

// Conditional import for LinearGradient
let LinearGradient: any;
try {
  LinearGradient = require('expo-linear-gradient').LinearGradient;
} catch {
  LinearGradient = ({ children, colors, style, ...props }: any) => (
    <View style={[style, { backgroundColor: colors[0] }]} {...props}>
      {children}
    </View>
  );
}

export default function ForgetPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleForgetPassword = async () => {
    setLoading(true);
    // Mock password reset for testing
    setTimeout(() => {
      setLoading(false);
      alert('Check your email to reset your password!');
    }, 1000);
  };

  const navigateToLogin = () => {
    router.push('/(auth)/login');
  };

  return (
    <LinearGradient colors={theme.gradients.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.logoContainer}>
              <View style={styles.logoWrapper}>
                <Image source={require('../../assets/images/forget.png')} style={styles.logoImage} />
              </View>
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>Enter your email to receive reset instructions</Text>
            </View>

            <Card variant="elevated" style={styles.formCard}>
              <Input
                label="Email Address"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                icon={<Ionicons name="mail" size={20} color={theme.colors.textMuted} />}
              />

              <Button
                title={loading ? "Sending..." : "Send Reset Email"}
                onPress={handleForgetPassword}
                variant="gradient"
                disabled={loading}
                icon={<Ionicons name="mail-outline" size={20} color="#000" />}
                style={styles.resetButton}
              />

              <TouchableOpacity style={styles.loginLink} onPress={navigateToLogin}>
                <Text style={styles.loginText}>Remember your password? Sign in</Text>
              </TouchableOpacity>
            </Card>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  logoImage: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  title: {
    ...theme.typography.h1,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  formCard: {
    marginBottom: theme.spacing.lg,
  },
  resetButton: {
    marginTop: theme.spacing.md,
  },
  loginLink: {
    alignSelf: 'center',
    marginTop: theme.spacing.lg,
  },
  loginText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
});
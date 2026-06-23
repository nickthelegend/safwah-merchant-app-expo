import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, ScrollView, Animated } from 'react-native';
import { theme } from '../theme';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useMerchantStore } from '../stores/merchantStore';

interface BusinessSetupProps {
  onComplete: () => void;
}

export default function BusinessSetupScreen({ onComplete }: BusinessSetupProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [businessName, setBusinessName] = useState('');
  const [businessCategory, setBusinessCategory] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [merchantPin, setMerchantPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  
  const { updateSettings, completeSetup } = useMerchantStore();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep === 0 && (!businessName || !businessCategory)) {
      alert('Please fill in all business information');
      return;
    }
    
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setCurrentStep(1);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleBack = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setCurrentStep(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleComplete = () => {
    if (merchantPin !== confirmPin) {
      alert('PINs do not match');
      return;
    }
    
    updateSettings({
      businessName,
      businessCategory,
      currency,
      merchantPin,
    });
    
    completeSetup();
    onComplete();
  };

  const renderBusinessInfo = () => (
    <Card style={styles.formCard}>
      <Text style={styles.sectionTitle}>Business Information</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Business Name"
        placeholderTextColor={theme.colors.textSecondary}
        value={businessName}
        onChangeText={setBusinessName}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Business Category (e.g., Restaurant, Retail)"
        placeholderTextColor={theme.colors.textSecondary}
        value={businessCategory}
        onChangeText={setBusinessCategory}
      />

      <View style={styles.currencySection}>
        <Text style={styles.inputLabel}>Currency Preference</Text>
        <View style={styles.currencyButtons}>
          {['USD', '₹', 'EUR'].map((curr, index) => (
            <Button
              key={curr}
              title={curr}
              onPress={() => setCurrency(curr)}
              variant={currency === curr ? 'primary' : 'secondary'}
              size="small"
              style={[styles.currencyButton, index < 2 && { marginRight: theme.spacing.sm }]}
            />
          ))}
        </View>
      </View>

      <Button
        title="Next"
        onPress={handleNext}
        style={styles.actionButton}
      />
    </Card>
  );

  const renderSecurity = () => (
    <Card style={styles.formCard}>
      <Text style={styles.sectionTitle}>Security</Text>
      <Text style={styles.pinDescription}>
        Create a 4-digit PIN for secure transactions
      </Text>
      
      <TextInput
        style={styles.input}
        placeholder="4-digit Merchant PIN"
        placeholderTextColor={theme.colors.textSecondary}
        value={merchantPin}
        onChangeText={setMerchantPin}
        secureTextEntry
        keyboardType="numeric"
        maxLength={4}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Confirm PIN"
        placeholderTextColor={theme.colors.textSecondary}
        value={confirmPin}
        onChangeText={setConfirmPin}
        secureTextEntry
        keyboardType="numeric"
        maxLength={4}
      />

      <Button
        title="Complete Setup"
        onPress={handleComplete}
        disabled={!merchantPin || !confirmPin || merchantPin !== confirmPin}
        style={styles.actionButton}
      />
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Business Setup</Text>
          <Text style={styles.subtitle}>
            {currentStep === 0 ? 'Step 1 of 2: Business Information' : 'Step 2 of 2: Security Setup'}
          </Text>
        </View>

        <Animated.View style={[styles.cardContainer, { opacity: fadeAnim }]}>
          {currentStep === 0 ? renderBusinessInfo() : renderSecurity()}
        </Animated.View>
      </ScrollView>
      
      {currentStep === 1 && (
        <View style={styles.bottomButton}>
          <Button
            title="Back"
            onPress={handleBack}
            variant="secondary"
            style={styles.backButtonBottom}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    ...theme.typography.h1,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  formCard: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.md,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    color: theme.colors.text,
    fontSize: 16,
    marginBottom: theme.spacing.md,
  },
  inputLabel: {
    ...theme.typography.body,
    marginBottom: theme.spacing.sm,
  },
  currencySection: {
    marginTop: theme.spacing.md,
  },
  currencyButtons: {
    flexDirection: 'row',
  },
  currencyButton: {
    flex: 1,
  },
  pinDescription: {
    ...theme.typography.caption,
    marginBottom: theme.spacing.md,
    color: theme.colors.textSecondary,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  actionButton: {
    marginTop: theme.spacing.lg,
  },
  bottomButton: {
    position: 'absolute',
    bottom: theme.spacing.lg,
    left: theme.spacing.lg,
  },
  backButtonBottom: {
    minWidth: 80,
  },
});
import React, { useContext } from 'react';
import { router } from 'expo-router';
import BusinessSetupScreen from '../screens/BusinessSetupScreen';
import { AuthContext } from '../provider/AuthProvider';

export default function BusinessSetup() {
  const auth = useContext(AuthContext);

  const handleComplete = () => {
    // Sign in the user after completing business setup
    auth.signIn?.();
    // Navigate to main app
    router.replace('/(tabs)');
  };

  return <BusinessSetupScreen onComplete={handleComplete} />;
}

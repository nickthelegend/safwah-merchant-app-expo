// Web3 polyfills + WalletConnect compat must load before anything else.
import 'text-encoding';
import '@walletconnect/react-native-compat';
import '../polyfills';

import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import { JetBrainsMono_400Regular, JetBrainsMono_700Bold } from '@expo-google-fonts/jetbrains-mono';

import { AuthProvider } from '../provider/AuthProvider';
import { Web3Provider } from '../provider/Web3Provider';
import { TxProvider } from '../provider/TxProvider';
import { SessionProvider, useSession } from '../provider/SessionProvider';
import { printerService } from '../services/printer.service';
import { usePaymentStore } from '../stores/paymentStore';
import { safwah } from '../theme/safwah';
import { ToastProvider } from '../components/safwah/Toast';

export const unstable_settings = {
  initialRouteName: 'index',
};

/// Auth gate: keep unauthenticated merchants in onboarding, send authed users into the tabs.
function Gate() {
  const { isAuthed } = useSession();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inOnboarding = segments[0] === 'onboarding';
    const inTabs = segments[0] === '(tabs)';
    if (!isAuthed && inTabs) router.replace('/onboarding');
    else if (isAuthed && inOnboarding) router.replace('/(tabs)');
  }, [isAuthed, segments, router]);

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: safwah.colors.bg } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="business-setup" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="store-edit" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="connect-wallet" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const setPrinterStatus = usePaymentStore((state) => state.setPrinterStatus);
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
    JetBrainsMono_400Regular,
    JetBrainsMono_700Bold,
  });

  // Initialize printer on app startup
  // Requirements: 4.1, 4.2, 4.3, 4.4
  useEffect(() => {
    const initializePrinter = async () => {
      try {
        console.log('Initializing printer on app startup...');
        
        // Initialize printer connection (Requirement 4.1)
        const result = await printerService.initialize();
        
        if (result.success) {
          // Retrieve and log printer status (Requirement 4.2)
          const status = await printerService.getStatus();
          console.log('Printer initialized successfully:', status);
          
          // Update printer status in global state (Requirement 4.4)
          setPrinterStatus(status);
        } else {
          // Handle initialization errors gracefully without blocking app (Requirement 4.3)
          console.error('Printer initialization failed:', result.error);
          
          // Update printer status with error in global state
          setPrinterStatus({
            isAvailable: false,
            isConnected: false,
            error: result.error,
          });
        }
      } catch (error) {
        // Catch any unexpected errors and continue app startup (Requirement 4.3)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error during printer initialization';
        console.error('Unexpected error during printer initialization:', errorMessage);
        
        setPrinterStatus({
          isAvailable: false,
          isConnected: false,
          error: errorMessage,
        });
      }
    };

    initializePrinter();
  }, [setPrinterStatus]);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: '#F4FAEC' }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#F4FAEC' }}>
      <SafeAreaProvider>
        <Web3Provider>
          <TxProvider>
            <AuthProvider>
              <SessionProvider>
                <ThemeProvider value={DefaultTheme}>
                  <ToastProvider>
                    <Gate />
                    <StatusBar style="dark" />
                  </ToastProvider>
                </ThemeProvider>
              </SessionProvider>
            </AuthProvider>
          </TxProvider>
        </Web3Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

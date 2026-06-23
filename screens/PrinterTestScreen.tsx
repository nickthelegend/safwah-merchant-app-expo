// PrinterTestScreen - Test and debug IMIN printer connection
// Provides detailed logging and test functions for printer troubleshooting

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { printerService } from '../services/printer.service';
import { theme } from '../theme';

export default function PrinterTestScreen() {
  const [logs, setLogs] = useState<string[]>([]);
  const [printerStatus, setPrinterStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    addLog('Printer Test Screen loaded');
    checkPrinterStatus();
  }, []);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    setLogs(prev => [...prev, logMessage]);
  };

  const checkPrinterStatus = async () => {
    try {
      addLog('Checking printer status...');
      const status = await printerService.getStatus();
      setPrinterStatus(status);
      addLog(`Printer Status: ${JSON.stringify(status, null, 2)}`);
    } catch (error) {
      addLog(`Error checking status: ${error}`);
    }
  };

  const testInitialize = async () => {
    try {
      setIsLoading(true);
      addLog('=== Testing Printer Initialization ===');
      
      const result = await printerService.initialize();
      addLog(`Initialize result: ${JSON.stringify(result, null, 2)}`);
      
      await checkPrinterStatus();
      setIsLoading(false);
    } catch (error) {
      addLog(`Initialize error: ${error}`);
      setIsLoading(false);
    }
  };

  const testSimplePrint = async () => {
    try {
      setIsLoading(true);
      addLog('=== Testing Simple Print ===');
      
      // Create a simple test transaction
      const testTransaction = {
        id: 'TEST-' + Date.now(),
        amount: 10.00,
        currency: 'USD',
        paymentMethod: 'cash' as const,
        status: 'completed' as const,
        timestamp: new Date(),
        items: [
          {
            id: '1',
            name: 'Test Item',
            quantity: 1,
            unitPrice: 10.00,
            totalPrice: 10.00,
          }
        ],
        merchantInfo: {
          businessName: 'Test Merchant',
          address: '123 Test St',
          phone: '555-1234',
        },
        receiptNumber: 'R-' + Date.now(),
      };

      addLog('Test transaction created');
      addLog(`Transaction: ${JSON.stringify(testTransaction, null, 2)}`);
      
      addLog('Calling printReceipt...');
      const result = await printerService.printReceipt(testTransaction);
      
      addLog(`Print result: ${JSON.stringify(result, null, 2)}`);
      
      if (result.success) {
        Alert.alert('Success', 'Test print completed!');
      } else {
        Alert.alert('Print Failed', result.error || 'Unknown error');
      }
      
      setIsLoading(false);
    } catch (error) {
      addLog(`Print error: ${error}`);
      Alert.alert('Error', String(error));
      setIsLoading(false);
    }
  };

  const testFormatReceipt = () => {
    try {
      addLog('=== Testing Receipt Formatting ===');
      
      const testTransaction = {
        id: 'TEST-' + Date.now(),
        amount: 25.50,
        currency: 'USD',
        paymentMethod: 'qr' as const,
        status: 'completed' as const,
        timestamp: new Date(),
        items: [
          {
            id: '1',
            name: 'Coffee',
            quantity: 2,
            unitPrice: 3.50,
            totalPrice: 7.00,
          },
          {
            id: '2',
            name: 'Sandwich',
            quantity: 1,
            unitPrice: 8.99,
            totalPrice: 8.99,
          },
          {
            id: '3',
            name: 'Water',
            quantity: 1,
            unitPrice: 1.50,
            totalPrice: 1.50,
          }
        ],
        merchantInfo: {
          businessName: 'Irion Pay',
          address: 'JTBI, JNTUH, Kukatpally, Telangana, India 500085',
          phone: '(555) 123-4567',
        },
        receiptNumber: 'R-' + Date.now(),
      };

      const formatted = printerService.formatReceipt(testTransaction);
      addLog('Formatted receipt:');
      addLog('---START RECEIPT---');
      addLog(formatted);
      addLog('---END RECEIPT---');
      
      Alert.alert('Receipt Formatted', 'Check console logs for formatted receipt');
    } catch (error) {
      addLog(`Format error: ${error}`);
      Alert.alert('Error', String(error));
    }
  };

  const testPrinterModule = async () => {
    try {
      setIsLoading(true);
      addLog('=== Testing Direct Printer Module Access ===');
      
      // Try to import and test the printer module directly
      addLog('Attempting to import react-native-printer-imin...');
      
      const IminPrinter = require('react-native-printer-imin');
      addLog('Module imported successfully');
      addLog(`Module methods: ${Object.keys(IminPrinter).join(', ')}`);
      
      // Try to get printer status directly
      addLog('Calling getPrinterStatus...');
      try {
        const status = await IminPrinter.default.getPrinterStatus();
        addLog(`Direct status (via default): ${JSON.stringify(status, null, 2)}`);
        if (status) {
          addLog(`Status code: ${status.code}`);
          addLog(`Status message: ${status.message}`);
          addLog(`Is code === 0? ${status.code === 0}`);
          addLog(`Type of code: ${typeof status.code}`);
        }
      } catch (err) {
        addLog(`getPrinterStatus error: ${err}`);
      }
      
      // Try to initialize
      addLog('Calling initPrinter...');
      try {
        const initResult = await IminPrinter.default.initPrinter();
        addLog(`Init result: ${JSON.stringify(initResult, null, 2)}`);
      } catch (err) {
        addLog(`initPrinter error: ${err}`);
      }
      
      // Try to print test text
      addLog('Testing printText...');
      try {
        await IminPrinter.default.printText('=== TEST PRINT ===\nHello from Irion!\nTest successful!\n\n');
        await IminPrinter.default.printAndFeedPaper(100);
        addLog('Print test completed successfully!');
        Alert.alert('Success!', 'Test print sent to printer. Check if it printed.');
      } catch (err) {
        addLog(`printText error: ${err}`);
        Alert.alert('Print Failed', String(err));
      }
      
      setIsLoading(false);
    } catch (error) {
      addLog(`Module test error: ${error}`);
      setIsLoading(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
    addLog('Logs cleared');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Printer Test & Debug</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Status Card */}
        <Card variant="elevated" style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Ionicons 
              name="print" 
              size={32} 
              color={printerStatus?.isAvailable ? theme.colors.success : theme.colors.error} 
            />
            <Text style={styles.statusTitle}>Printer Status</Text>
          </View>
          
          {printerStatus && (
            <View style={styles.statusDetails}>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Available:</Text>
                <Text style={[
                  styles.statusValue,
                  { color: printerStatus.isAvailable ? theme.colors.success : theme.colors.error }
                ]}>
                  {printerStatus.isAvailable ? 'Yes' : 'No'}
                </Text>
              </View>
              
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Connected:</Text>
                <Text style={[
                  styles.statusValue,
                  { color: printerStatus.isConnected ? theme.colors.success : theme.colors.error }
                ]}>
                  {printerStatus.isConnected ? 'Yes' : 'No'}
                </Text>
              </View>
              
              {printerStatus.error && (
                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>Message:</Text>
                  <Text style={styles.statusValue}>{printerStatus.error}</Text>
                </View>
              )}
            </View>
          )}
        </Card>

        {/* Test Buttons */}
        <Card variant="elevated" style={styles.testCard}>
          <Text style={styles.cardTitle}>Test Functions</Text>
          
          <Button
            title="1. Check Printer Status"
            onPress={checkPrinterStatus}
            variant="secondary"
            style={styles.testButton}
            disabled={isLoading}
          />
          
          <Button
            title="2. Test Initialize"
            onPress={testInitialize}
            variant="secondary"
            style={styles.testButton}
            disabled={isLoading}
          />
          
          <Button
            title="3. Test Format Receipt"
            onPress={testFormatReceipt}
            variant="secondary"
            style={styles.testButton}
            disabled={isLoading}
          />
          
          <Button
            title="4. Test Simple Print"
            onPress={testSimplePrint}
            variant="primary"
            style={styles.testButton}
            disabled={isLoading}
          />
          
          <Button
            title="5. Test Printer Module Direct"
            onPress={testPrinterModule}
            variant="secondary"
            style={styles.testButton}
            disabled={isLoading}
          />
        </Card>

        {/* Console Logs */}
        <Card variant="elevated" style={styles.logsCard}>
          <View style={styles.logsHeader}>
            <Text style={styles.cardTitle}>Console Logs</Text>
            <Button
              title="Clear"
              onPress={clearLogs}
              variant="secondary"
              style={styles.clearButton}
            />
          </View>
          
          <ScrollView style={styles.logsScroll} nestedScrollEnabled>
            {logs.length === 0 ? (
              <Text style={styles.noLogs}>No logs yet. Run a test to see logs.</Text>
            ) : (
              logs.map((log, index) => (
                <Text key={index} style={styles.logText}>
                  {log}
                </Text>
              ))
            )}
          </ScrollView>
        </Card>

        {/* Instructions */}
        <Card variant="elevated" style={styles.instructionsCard}>
          <Text style={styles.cardTitle}>Instructions</Text>
          <Text style={styles.instructionText}>
            1. Check printer status first{'\n'}
            2. If not connected, try initialize{'\n'}
            3. Test format to see receipt text{'\n'}
            4. Test simple print to print receipt{'\n'}
            5. Check logs for detailed information{'\n'}
            {'\n'}
            <Text style={styles.instructionBold}>Note:</Text> Make sure IMIN printer is connected via USB or Bluetooth.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  statusCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
  },
  statusDetails: {
    gap: theme.spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  testCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  testButton: {
    marginBottom: theme.spacing.sm,
  },
  logsCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    maxHeight: 400,
  },
  logsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  clearButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  logsScroll: {
    maxHeight: 300,
  },
  noLogs: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: theme.spacing.lg,
  },
  logText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    lineHeight: 18,
  },
  instructionsCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  instructionText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  instructionBold: {
    fontWeight: '600',
    color: theme.colors.text,
  },
});

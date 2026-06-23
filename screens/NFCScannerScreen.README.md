# NFCScannerScreen Component

## Overview

The NFCScannerScreen component provides a complete NFC contactless payment flow for the Irion Merchant POS application. It handles NFC initialization, card/phone scanning, payment processing, receipt printing, and error handling.

## Features

- ✅ NFC initialization and availability checking (Requirement 2.1)
- ✅ Visual feedback for scan ready state (Requirement 2.2)
- ✅ NFC tag detection and data reading (Requirement 2.3)
- ✅ Error handling with retry option (Requirement 2.4)
- ✅ Payment confirmation and navigation (Requirement 2.5)
- ✅ Mock NFC payment processing (Requirement 6.2)
- ✅ Receipt printing on successful payment (Requirement 7.2)
- ✅ Loading, success, and error states (Requirement 7.1, 7.2, 7.3)
- ✅ Animated pulse effect during scanning
- ✅ 30-second scanning timeout
- ✅ Automatic cleanup on unmount

## Props

```typescript
interface NFCScannerScreenProps {
  amount: number;              // Payment amount in dollars
  metadata: PaymentMetadata;   // Transaction metadata including items
  merchantInfo: MerchantInfo;  // Merchant business information
  onSuccess?: (transactionId: string) => void;  // Success callback
  onCancel?: () => void;       // Cancel callback
}
```

## Usage

### Basic Usage

```typescript
import NFCScannerScreen from '../screens/NFCScannerScreen';
import { PaymentMetadata, MerchantInfo } from '../services/payment-types';

function MyComponent() {
  const amount = 50.00;
  
  const metadata: PaymentMetadata = {
    items: [
      {
        id: '1',
        name: 'Product',
        quantity: 1,
        unitPrice: 50.00,
        totalPrice: 50.00,
      }
    ],
  };

  const merchantInfo: MerchantInfo = {
    businessName: 'My Store',
    address: '123 Main St',
    phone: '555-1234',
  };

  return (
    <NFCScannerScreen
      amount={amount}
      metadata={metadata}
      merchantInfo={merchantInfo}
      onSuccess={(txId) => console.log('Success:', txId)}
      onCancel={() => console.log('Cancelled')}
    />
  );
}
```

### Integration with Expo Router

```typescript
// In your POS screen
import { useRouter } from 'expo-router';

const router = useRouter();

const handleNFCPayment = () => {
  router.push('/nfc-scanner');
};
```

## Payment Flow

1. **Initialization**: Component initializes NFC service on mount
2. **Availability Check**: Verifies NFC is supported and enabled
3. **Start Scanning**: Begins NFC scanning session automatically
4. **Tag Detection**: Waits for customer to tap card/phone
5. **Payment Processing**: Processes NFC data and creates transaction
6. **Receipt Printing**: Automatically prints receipt on success
7. **Completion**: Shows success screen or handles errors

## States

### Initialization State
- Initializes NFC service
- Checks NFC availability
- Handles NFC not supported/disabled errors

### Scanning State (Processing)
- Displays animated NFC icon with pulse effect
- Shows "Ready to scan" status indicator
- Displays payment amount and merchant information
- Provides cancel button
- 30-second timeout for scanning

### Success State
- Shows checkmark icon
- Displays success message
- Shows transaction ID
- Provides "Done" button

### Error State
- Shows error icon
- Displays error message with specific reason
- Provides "Try Again" and "Cancel" buttons

## NFC Availability Errors

The component handles various NFC availability issues:

### NFC Not Supported
- Error: "NFC is not supported on this device"
- Action: Shows error state with cancel option

### NFC Disabled
- Error: "NFC is disabled. Please enable NFC in device settings"
- Action: Shows error state with instructions to enable NFC

### Initialization Failed
- Error: Specific initialization error message
- Action: Shows error state with retry option

## Scanning Timeout

The NFC scanning automatically times out after 30 seconds:
- Prevents indefinite scanning
- Shows timeout error message
- Provides retry option
- Cleans up NFC session

## Receipt Printing

On successful payment:
1. Creates Transaction object with NFC payment method
2. Calls `printerService.printReceipt()`
3. If printing fails, shows alert with retry option
4. Payment is still considered successful even if printing fails

## Error Handling

The component handles various error scenarios:
- NFC not supported on device
- NFC disabled in settings
- NFC initialization failure
- Scanning timeout
- Payment processing failure
- Printer errors (non-blocking)

## Mock NFC Payment

In development mode, the component uses mock NFC payment:
- Simulates tag detection after 2-5 seconds
- 2-second payment processing delay
- Generates realistic transaction data
- Creates transaction ID with NFC prefix

## Visual Feedback

### Pulse Animation
- Animated scale effect on NFC icon
- Loops continuously while scanning
- Indicates active scanning state

### Status Indicator
- Activity spinner with "Ready to scan" text
- Shows when actively scanning
- Primary color for visual emphasis

### Icon States
- Inactive: Gray icon with light border
- Active: Primary color icon with primary border
- Success: Green checkmark
- Error: Red alert icon

## Cleanup

The component properly cleans up resources:
- Clears scanning timeout on unmount
- Stops NFC scanning session
- Resets scanning state
- Prevents memory leaks

## Styling

The component uses the app's theme system:
- Dark background with elevated cards
- Primary color for active states
- Consistent spacing and typography
- Responsive layout
- Smooth animations

## Dependencies

- `react-native-nfc-manager`: NFC reading
- `@expo/vector-icons`: Icons
- `expo-router`: Navigation
- `react-native-safe-area-context`: Safe area handling
- `nfcService`: NFC operations
- `printerService`: Receipt printing
- `usePaymentStore`: State management

## Requirements Satisfied

- ✅ 2.1: Initialize NFC reader and check availability
- ✅ 2.2: Display visual feedback for scan ready state
- ✅ 2.3: Read NFC data and process transaction
- ✅ 2.4: Handle NFC reading failures with error messages
- ✅ 2.5: Return to transaction screen with confirmation
- ✅ 6.2: Simulate successful NFC payment in development
- ✅ 7.1: Display loading indicator during processing
- ✅ 7.2: Display success message with transaction details
- ✅ 7.3: Display error message with failure reason

## Testing

See `NFCScannerScreen.example.tsx` for usage examples.

## Notes

- The component manages its own timers and cleanup
- All timers are cleared on unmount to prevent memory leaks
- NFC session is properly stopped on cancel or unmount
- Payment state is managed through Zustand store
- Receipt printing errors don't fail the payment
- Mock payment simulation for development/testing
- Real NFC implementation requires physical device with NFC hardware

## Device Requirements

- Android device with NFC hardware (minimum SDK 31)
- iOS device with NFC capability (iPhone 7 or later)
- NFC must be enabled in device settings
- For testing, use physical device (NFC not available in simulators)

# QRPaymentScreen Component

## Overview

The QRPaymentScreen component provides a complete QR code payment flow for the Irion Merchant POS application. It handles QR code generation, payment confirmation, receipt printing, and error handling.

## Features

- ✅ QR code generation with transaction details (Requirement 1.1)
- ✅ Display payment amount, merchant info, and transaction ID (Requirement 1.2)
- ✅ Auto-confirmation with mock payment processing (Requirement 6.1)
- ✅ Receipt printing on successful payment (Requirement 7.2)
- ✅ Cancel payment option (Requirement 1.4)
- ✅ 5-minute timeout with auto-cancel (Requirement 7.5)
- ✅ Loading, success, and error states (Requirement 7.1, 7.2)
- ✅ Countdown timer display
- ✅ Payment instructions for customers

## Props

```typescript
interface QRPaymentScreenProps {
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
import QRPaymentScreen from '../screens/QRPaymentScreen';
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
    <QRPaymentScreen
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

const handleQRPayment = () => {
  router.push('/qr-payment');
};
```

## Payment Flow

1. **Initialization**: Component generates QR code on mount
2. **Display**: Shows QR code with amount, merchant info, and transaction ID
3. **Mock Confirmation**: Simulates payment after 3 seconds (development mode)
4. **Receipt Printing**: Automatically prints receipt on success
5. **Completion**: Shows success screen or handles errors

## States

### Loading State
- Displays spinner while generating QR code
- Shows "Generating QR Code..." message

### Active State (Processing)
- Displays QR code
- Shows payment amount and merchant information
- Displays transaction ID
- Shows countdown timer (5 minutes)
- Provides cancel button

### Success State
- Shows checkmark icon
- Displays success message
- Shows transaction ID
- Provides "Done" button

### Error State
- Shows error icon
- Displays error message
- Provides "Try Again" and "Cancel" buttons

## Timeout Handling

The payment automatically times out after 5 minutes (300 seconds):
- Countdown timer shows remaining time
- On timeout, payment is cancelled
- Alert is shown to user
- Returns to previous screen

## Receipt Printing

On successful payment:
1. Creates Transaction object
2. Calls `printerService.printReceipt()`
3. If printing fails, shows alert with retry option
4. Payment is still considered successful even if printing fails

## Error Handling

The component handles various error scenarios:
- QR code generation failure
- Payment confirmation failure
- Printer errors (non-blocking)
- Timeout expiration

## Mock Payment

In development mode, the component uses mock payment confirmation:
- 3-second delay before confirmation
- Simulates successful payment
- Generates realistic transaction data

## Styling

The component uses the app's theme system:
- Dark background with elevated cards
- Primary color for amounts and success states
- Consistent spacing and typography
- Responsive layout

## Dependencies

- `react-native-qrcode-styled`: QR code generation
- `@expo/vector-icons`: Icons
- `expo-router`: Navigation
- `paymentService`: Payment processing
- `printerService`: Receipt printing
- `usePaymentStore`: State management

## Requirements Satisfied

- ✅ 1.1: Generate QR code with payment details
- ✅ 1.2: Display amount, merchant info, and transaction ID
- ✅ 1.3: Display QR until confirmation or timeout
- ✅ 1.4: Provide cancel option
- ✅ 6.1: Mock payment confirmation with delay
- ✅ 7.1: Display loading indicator during processing
- ✅ 7.2: Display success message on completion
- ✅ 7.5: Display timeout message and return to payment selection

## Testing

See `QRPaymentScreen.example.tsx` for usage examples.

## Notes

- The component manages its own timers and cleanup
- All timers are cleared on unmount to prevent memory leaks
- Payment state is managed through Zustand store
- Receipt printing errors don't fail the payment

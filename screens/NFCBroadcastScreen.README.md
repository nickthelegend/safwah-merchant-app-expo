# NFCBroadcastScreen Component

## Overview

The NFCBroadcastScreen component allows merchants to **broadcast/share transaction details** with customer devices via NFC. Instead of reading from NFC cards, this screen **writes transaction data** to customer devices that support NFC.

## Features

- ✅ NFC initialization and availability checking
- ✅ Transaction data broadcasting via NFC
- ✅ JSON format for transaction details
- ✅ Visual feedback with animated NFC icon
- ✅ Success/error state handling
- ✅ Retry functionality
- ✅ Cancel option

## Use Case

**Scenario:** After completing a payment, the merchant wants to share the transaction receipt/details with the customer's phone.

**Flow:**
1. Merchant completes payment (QR, NFC, or cash)
2. Merchant navigates to NFC Broadcast screen
3. Merchant taps "Broadcast Transaction"
4. Customer brings their NFC-enabled phone near merchant device
5. Transaction details are transferred to customer's phone
6. Customer can view receipt on their device

## Props

```typescript
interface NFCBroadcastScreenProps {
  transactionId: string;              // Unique transaction ID
  amount: number;                     // Transaction amount
  metadata: PaymentMetadata;          // Transaction items and details
  merchantInfo: MerchantInfo;         // Merchant business information
  onSuccess?: () => void;             // Success callback
  onCancel?: () => void;              // Cancel callback
}
```

## Broadcasted Data Format

The transaction data is broadcasted as JSON in the following format:

```json
{
  "transactionId": "TXN-1234567890-ABC123",
  "amount": 50.00,
  "merchantInfo": {
    "businessName": "Irion Merchant",
    "address": "123 Main Street",
    "phone": "555-1234"
  },
  "timestamp": "2025-11-27T10:30:00.000Z",
  "items": [
    {
      "name": "Coffee",
      "quantity": 2,
      "price": 3.50
    },
    {
      "name": "Sandwich",
      "quantity": 1,
      "price": 8.99
    }
  ],
  "type": "MERCHANT_TRANSACTION",
  "version": "1.0"
}
```

## Usage

### Basic Usage

```typescript
import NFCBroadcastScreen from '../screens/NFCBroadcastScreen';
import { PaymentMetadata, MerchantInfo } from '../services/payment-types';

function MyComponent() {
  const transactionId = 'TXN-1234567890-ABC123';
  const amount = 50.00;
  
  const metadata: PaymentMetadata = {
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
      }
    ],
  };

  const merchantInfo: MerchantInfo = {
    businessName: 'Irion Merchant',
    address: '123 Main Street',
    phone: '555-1234',
  };

  return (
    <NFCBroadcastScreen
      transactionId={transactionId}
      amount={amount}
      metadata={metadata}
      merchantInfo={merchantInfo}
      onSuccess={() => console.log('Transaction shared!')}
      onCancel={() => console.log('Cancelled')}
    />
  );
}
```

### Integration with Expo Router

```typescript
// In your payment success screen
import { useRouter } from 'expo-router';

const router = useRouter();

const handleShareTransaction = () => {
  router.push({
    pathname: '/nfc-broadcast',
    params: {
      transactionId: 'TXN-123',
      amount: '50.00',
      metadata: JSON.stringify(metadata),
      merchantInfo: JSON.stringify(merchantInfo),
    },
  });
};
```

## Broadcast Flow

1. **Initialization**: Component initializes NFC service on mount
2. **Availability Check**: Verifies NFC is supported and enabled
3. **Ready State**: Displays animated NFC icon, ready to broadcast
4. **User Action**: Merchant taps "Broadcast Transaction" button
5. **Broadcasting**: Waits for customer device to come near
6. **Data Transfer**: Writes JSON transaction data to customer device via NFC
7. **Success**: Shows success message and returns

## States

### Initializing State
- Initializes NFC service
- Checks NFC availability
- Handles NFC not supported/disabled errors

### Ready State
- Displays animated NFC icon with pulse effect
- Shows transaction amount and merchant info
- "Broadcast Transaction" button enabled
- Cancel button available

### Broadcasting State
- Shows "Broadcasting..." status
- Activity indicator visible
- Waiting for customer device
- Button disabled during broadcast

### Success State
- Shows checkmark icon
- Displays success message
- Shows transaction amount
- "Done" button to return

### Error State
- Shows error icon
- Displays error message with specific reason
- "Try Again" button to retry
- "Cancel" button to exit

## NFC Technology

### Writing to NFC Tags/Devices

The component uses **NDEF (NFC Data Exchange Format)** to write data:

```typescript
// NDEF message structure
{
  tnf: 1,              // TNF Well Known
  type: 'T',           // Text record
  payload: jsonBytes   // Transaction data as bytes
}
```

### Supported Devices

**Merchant Device (Broadcaster):**
- Android device with NFC (minimum SDK 31)
- NFC enabled in settings
- NFC write capability

**Customer Device (Receiver):**
- Any NFC-enabled smartphone
- Android or iOS with NFC
- NFC enabled in settings

## Error Handling

The component handles various error scenarios:

### NFC Not Supported
- Error: "NFC is not supported on this device"
- Action: Shows error state with cancel option

### NFC Disabled
- Error: "NFC is disabled. Please enable NFC in device settings"
- Action: Shows error state with instructions

### Broadcast Failed
- Error: Specific broadcast error message
- Action: Shows error state with retry option

### Initialization Failed
- Error: Specific initialization error message
- Action: Shows error state with retry option

## Visual Feedback

### Pulse Animation
- Animated scale effect on NFC icon
- Loops continuously when ready
- Indicates device is ready to broadcast

### Status Indicator
- Activity spinner with "Broadcasting..." text
- Shows when actively broadcasting
- Primary color for visual emphasis

### Icon States
- Inactive: Gray icon with light border
- Active: Primary color icon with primary border
- Success: Green checkmark
- Error: Red alert icon

## Cleanup

The component properly cleans up resources:
- Cancels NFC technology request on unmount
- Stops broadcast mode
- Resets broadcasting state
- Prevents memory leaks

## Requirements Satisfied

- ✅ **NEW**: NFC broadcasting for transaction sharing
- ✅ **NEW**: JSON format for transaction data
- ✅ **NEW**: Customer receipt sharing via NFC
- ✅ 2.1: Initialize NFC and check availability
- ✅ 7.1: Display loading indicator during processing
- ✅ 7.2: Display success message with transaction details
- ✅ 7.3: Display error message with failure reason

## Testing

### Manual Testing Steps

1. **Test NFC Availability**
   - Launch screen on device without NFC
   - Verify error message displayed
   - Launch on device with NFC disabled
   - Verify instructions to enable NFC

2. **Test Broadcasting**
   - Complete a test transaction
   - Navigate to broadcast screen
   - Tap "Broadcast Transaction"
   - Bring customer device near
   - Verify data transferred successfully

3. **Test Data Format**
   - Use NFC reader app on customer device
   - Read the broadcasted data
   - Verify JSON format is correct
   - Verify all fields present

4. **Test Error Handling**
   - Try broadcasting without customer device
   - Verify timeout handling
   - Test retry functionality
   - Test cancel functionality

## Integration Example

### After Payment Success

```typescript
// In QRPaymentScreen or NFCScannerScreen
const handlePaymentSuccess = async (transactionId: string) => {
  // Show success message
  showSuccess('Payment completed!');
  
  // Print receipt
  await printerService.printReceipt(transaction);
  
  // Offer to share via NFC
  Alert.alert(
    'Share Receipt',
    'Would you like to share the receipt with customer via NFC?',
    [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        onPress: () => {
          router.push({
            pathname: '/nfc-broadcast',
            params: {
              transactionId,
              amount: amount.toString(),
              metadata: JSON.stringify(metadata),
              merchantInfo: JSON.stringify(merchantInfo),
            },
          });
        },
      },
    ]
  );
};
```

## Customer Device Integration

To read the broadcasted data on customer devices, they need an NFC reader app or a custom app that can read NDEF messages:

```typescript
// Example customer app code (React Native)
import NfcManager, { NfcTech } from 'react-native-nfc-manager';

async function readMerchantTransaction() {
  try {
    await NfcManager.requestTechnology(NfcTech.Ndef);
    
    const tag = await NfcManager.getTag();
    const ndefMessage = tag.ndefMessage;
    
    if (ndefMessage && ndefMessage[0]) {
      const payload = ndefMessage[0].payload;
      const text = String.fromCharCode(...payload);
      const transaction = JSON.parse(text);
      
      console.log('Received transaction:', transaction);
      // Display receipt to customer
    }
    
    await NfcManager.cancelTechnologyRequest();
  } catch (error) {
    console.error('Error reading NFC:', error);
  }
}
```

## Notes

- The component manages its own NFC lifecycle
- All NFC operations are cleaned up on unmount
- Broadcasting is one-way (merchant → customer)
- Data is written in NDEF format (industry standard)
- Compatible with any NFC-enabled device
- Customer device doesn't need special app (can use generic NFC reader)

## Device Requirements

### Merchant Device
- Android device with NFC hardware (minimum SDK 31)
- NFC enabled in device settings
- NFC write capability
- Physical device (NFC not available in emulators)

### Customer Device
- Any NFC-enabled smartphone (Android or iOS)
- NFC enabled in settings
- NFC reader app (or custom app)

## Future Enhancements

1. **Peer-to-Peer Mode**: Direct device-to-device transfer
2. **QR Code Fallback**: If NFC fails, show QR code with data
3. **Multiple Formats**: Support for vCard, URL, etc.
4. **Encryption**: Encrypt sensitive transaction data
5. **Digital Signature**: Sign data for authenticity
6. **Batch Broadcasting**: Share multiple transactions

---

**Ready to share transaction receipts with customers via NFC! 📱✨**

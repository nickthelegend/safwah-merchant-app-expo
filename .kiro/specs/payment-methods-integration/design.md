# Design Document: Payment Methods Integration

## Overview

This design document outlines the technical approach for integrating QR code payments, NFC contactless payments, and thermal receipt printing into the Irion Merchant POS application. The solution leverages three native React Native modules: `react-native-qrcode-styled` for QR generation, `react-native-nfc-manager` for NFC reading, and `react-native-printer-imin` for thermal printing.

The architecture follows a service-oriented pattern consistent with the existing codebase, separating payment processing logic, printer management, and UI components into distinct layers.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    UI Layer (Screens)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ QR Payment   │  │ NFC Scanner  │  │ Receipt      │  │
│  │ Screen       │  │ Screen       │  │ Preview      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   Service Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Payment      │  │ NFC          │  │ Printer      │  │
│  │ Service      │  │ Service      │  │ Service      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                Native Module Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ react-native │  │ react-native │  │ react-native │  │
│  │ -qrcode-     │  │ -nfc-        │  │ -printer-    │  │
│  │ styled       │  │ manager      │  │ imin         │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

**QR Payment Flow:**
1. User selects QR payment method → Navigate to QR Payment Screen
2. QR Payment Screen calls PaymentService.generateQRPayment()
3. PaymentService creates transaction and returns QR data
4. Screen renders QR code using react-native-qrcode-styled
5. Mock payment confirmation after delay
6. On success → Call PrinterService.printReceipt()

**NFC Payment Flow:**
1. User selects NFC payment → Navigate to NFC Scanner Screen
2. NFC Scanner Screen calls NFCService.startScanning()
3. NFCService initializes NFC reader via react-native-nfc-manager
4. User taps card/phone → NFCService reads data
5. NFCService processes payment (mock) and returns result
6. On success → Call PrinterService.printReceipt()

**Printer Flow:**
1. App initialization → PrinterService.initialize()
2. Payment success → PrinterService.printReceipt(transaction)
3. PrinterService formats receipt data
4. PrinterService sends to react-native-printer-imin
5. Display print status to user

## Components and Interfaces

### Service Interfaces

#### PaymentService (`services/payment.service.ts`)

```typescript
interface PaymentService {
  // Generate QR payment data
  generateQRPayment(amount: number, metadata: PaymentMetadata): Promise<QRPaymentData>;
  
  // Process mock payment confirmation
  confirmPayment(transactionId: string): Promise<PaymentResult>;
  
  // Cancel pending payment
  cancelPayment(transactionId: string): Promise<void>;
}

interface QRPaymentData {
  qrContent: string;
  transactionId: string;
  amount: number;
  merchantInfo: MerchantInfo;
  expiresAt: Date;
}

interface PaymentResult {
  success: boolean;
  transactionId: string;
  amount: number;
  timestamp: Date;
  paymentMethod: 'qr' | 'nfc';
  error?: string;
}
```

#### NFCService (`services/nfc.service.ts`)

```typescript
interface NFCService {
  // Initialize NFC manager
  initialize(): Promise<boolean>;
  
  // Check if NFC is supported and enabled
  isAvailable(): Promise<boolean>;
  
  // Start NFC scanning session
  startScanning(amount: number): Promise<void>;
  
  // Stop NFC scanning session
  stopScanning(): Promise<void>;
  
  // Process NFC payment data
  processNFCPayment(nfcData: any): Promise<PaymentResult>;
}
```

#### PrinterService (`services/printer.service.ts`)

```typescript
interface PrinterService {
  // Initialize printer on app startup
  initialize(): Promise<void>;
  
  // Get current printer status
  getStatus(): Promise<PrinterStatus>;
  
  // Print receipt for transaction
  printReceipt(transaction: Transaction): Promise<PrintResult>;
  
  // Format receipt content
  formatReceipt(transaction: Transaction): string;
}

interface PrinterStatus {
  isAvailable: boolean;
  isConnected: boolean;
  error?: string;
}

interface PrintResult {
  success: boolean;
  error?: string;
}
```

### Screen Components

#### QRPaymentScreen (`screens/QRPaymentScreen.tsx`)

Displays QR code for customer scanning with payment details.

**Props:**
- `amount: number` - Payment amount
- `onSuccess: (result: PaymentResult) => void` - Success callback
- `onCancel: () => void` - Cancel callback

**State:**
- QR code data
- Payment status (pending, success, failed, cancelled)
- Timer for auto-timeout

#### NFCScannerScreen (`screens/NFCScannerScreen.tsx`)

Handles NFC card/phone scanning for contactless payments.

**Props:**
- `amount: number` - Payment amount
- `onSuccess: (result: PaymentResult) => void` - Success callback
- `onCancel: () => void` - Cancel callback

**State:**
- NFC scanning status
- Error messages
- Payment processing state

#### ReceiptPreviewScreen (`screens/ReceiptPreviewScreen.tsx`)

Optional screen to preview receipt before printing.

**Props:**
- `transaction: Transaction` - Transaction data
- `onPrint: () => void` - Print callback
- `onClose: () => void` - Close callback

## Data Models

### Transaction

```typescript
interface Transaction {
  id: string;
  amount: number;
  currency: string;
  paymentMethod: 'qr' | 'nfc' | 'cash' | 'card';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  timestamp: Date;
  items: TransactionItem[];
  merchantInfo: MerchantInfo;
  customerInfo?: CustomerInfo;
  receiptNumber: string;
}

interface TransactionItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}
```

### MerchantInfo

```typescript
interface MerchantInfo {
  businessName: string;
  address: string;
  phone: string;
  taxId?: string;
  logo?: string;
}
```

### PaymentMetadata

```typescript
interface PaymentMetadata {
  orderId?: string;
  customerId?: string;
  description?: string;
  items: TransactionItem[];
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Acceptance Criteria Testing Prework

1.1 WHEN a merchant initiates a QR payment THEN the POS Application SHALL generate a styled QR code containing the payment amount and transaction details
  Thoughts: This is about generating QR codes for any valid payment amount and transaction. We can generate random amounts and transaction data, call the QR generation function, and verify that the resulting QR code contains the expected data when decoded.
  Testable: yes - property

1.2 WHEN the QR code is displayed THEN the POS Application SHALL show the payment amount, merchant information, and transaction ID alongside the QR code
  Thoughts: This is about UI rendering. We can test that the render function for any transaction includes all required fields in the output.
  Testable: yes - property

1.3 WHEN a QR payment is pending THEN the POS Application SHALL display the QR code until payment confirmation is received or timeout occurs
  Thoughts: This is about state management and timing behavior. This is more of an integration test concern.
  Testable: no

1.4 WHEN the QR code screen is active THEN the POS Application SHALL provide a cancel option to abort the transaction
  Thoughts: This is testing that the UI includes a cancel button. This is a specific example to check.
  Testable: yes - example

1.5 WHERE the device supports it THEN the POS Application SHALL allow sharing or saving the QR code image
  Thoughts: This is conditional on device capabilities. This is an optional feature test.
  Testable: no

2.1 WHEN a merchant selects NFC payment THEN the POS Application SHALL navigate to the NFC scanner screen and initialize the NFC reader
  Thoughts: This is testing navigation and initialization. This is a specific workflow example.
  Testable: yes - example

2.2 WHEN the NFC scanner is active THEN the POS Application SHALL display visual feedback indicating readiness to scan
  Thoughts: This is about UI state. We can verify the UI shows the correct status.
  Testable: yes - example

2.3 WHEN an NFC device is detected THEN the POS Application SHALL read the payment data and process the transaction
  Thoughts: This is about the core NFC reading functionality across different NFC inputs. We can test with various mock NFC data.
  Testable: yes - property

2.4 IF NFC reading fails THEN the POS Application SHALL display an error message and allow retry
  Thoughts: This is testing error handling for any NFC failure scenario.
  Testable: yes - property

2.5 WHEN NFC payment completes successfully THEN the POS Application SHALL return to the transaction screen with payment confirmation
  Thoughts: This is testing the success flow navigation. This is a specific example.
  Testable: yes - example

3.1 WHEN a payment transaction completes successfully THEN the POS Application SHALL automatically trigger receipt printing
  Thoughts: This is testing that for any successful transaction, printing is triggered. This is a property that should hold for all transactions.
  Testable: yes - property

3.2 WHEN printing is initiated THEN the POS Application SHALL check the Thermal Printer status before attempting to print
  Thoughts: This is testing that the status check always happens before printing. This should hold for all print attempts.
  Testable: yes - property

3.3 WHEN the Thermal Printer is ready THEN the POS Application SHALL format and send the receipt data including transaction details, items, amounts, and merchant information
  Thoughts: This is testing that formatted receipts contain all required information for any transaction.
  Testable: yes - property

3.4 IF the Thermal Printer is unavailable or encounters an error THEN the POS Application SHALL display an error message and offer to retry printing
  Thoughts: This is testing error handling for printer failures.
  Testable: yes - property

3.5 WHEN receipt printing completes THEN the POS Application SHALL display a success confirmation to the merchant
  Thoughts: This is testing that success feedback is shown after any successful print.
  Testable: yes - property

4.1 WHEN the POS Application starts THEN the system SHALL initialize the Thermal Printer connection
  Thoughts: This is testing app startup behavior. This is a specific example of the initialization flow.
  Testable: yes - example

4.2 WHEN printer initialization completes THEN the system SHALL retrieve and log the Thermal Printer status
  Thoughts: This is testing that status is always retrieved after initialization.
  Testable: yes - property

4.3 IF printer initialization fails THEN the system SHALL log the error and continue app startup without blocking
  Thoughts: This is testing error handling doesn't block startup.
  Testable: yes - property

4.4 WHEN the printer status changes THEN the system SHALL update the printer availability state in the application
  Thoughts: This is about state synchronization. This is more of an integration concern.
  Testable: no

5.1 WHEN the application is built THEN the build system SHALL include the react-native-printer-imin native module with proper configuration
  Thoughts: This is about build configuration, not runtime behavior.
  Testable: no

5.2 WHEN the application is built THEN the build system SHALL include the react-native-nfc-manager native module with proper Expo config plugin settings
  Thoughts: This is about build configuration, not runtime behavior.
  Testable: no

5.3 WHEN the application is built for Android THEN the build system SHALL ensure minimum Android SDK version is 31 for NFC support
  Thoughts: This is about build configuration, not runtime behavior.
  Testable: no

5.4 WHEN the application is built for iOS THEN the build system SHALL include NFC permissions and entitlements in Info.plist
  Thoughts: This is about build configuration, not runtime behavior.
  Testable: no

5.5 WHERE iOS NFC is configured THEN the build system SHALL include the NFCReaderUsageDescription permission message
  Thoughts: This is about build configuration, not runtime behavior.
  Testable: no

6.1 WHEN a QR payment is initiated in development mode THEN the system SHALL simulate payment confirmation after a configurable delay
  Thoughts: This is testing mock behavior for any payment amount. We can verify the delay and confirmation work correctly.
  Testable: yes - property

6.2 WHEN an NFC payment is processed in development mode THEN the system SHALL simulate successful card reading and payment processing
  Thoughts: This is testing mock NFC behavior. We can verify it works for various inputs.
  Testable: yes - property

6.3 WHEN mock payments are used THEN the system SHALL generate realistic transaction data including transaction IDs and timestamps
  Thoughts: This is testing that mock data has required fields for any mock payment.
  Testable: yes - property

6.4 WHEN mock payment completes THEN the system SHALL trigger the same receipt printing flow as real payments
  Thoughts: This is testing that mock and real payments follow the same path. This is about code path equivalence.
  Testable: yes - property

7.1 WHEN any payment method is processing THEN the POS Application SHALL display a loading indicator with appropriate status text
  Thoughts: This is testing UI feedback for any payment method.
  Testable: yes - property

7.2 WHEN a payment succeeds THEN the POS Application SHALL display a success message with transaction details
  Thoughts: This is testing success UI for any successful payment.
  Testable: yes - property

7.3 WHEN a payment fails THEN the POS Application SHALL display an error message with the failure reason
  Thoughts: This is testing error UI for any failed payment.
  Testable: yes - property

7.4 WHEN waiting for customer action THEN the POS Application SHALL display clear instructions for the customer
  Thoughts: This is about UI content quality, which is subjective.
  Testable: no

7.5 WHEN a payment times out THEN the POS Application SHALL display a timeout message and return to the payment selection screen
  Thoughts: This is testing timeout handling. This is a specific example of the timeout flow.
  Testable: yes - example

### Property Reflection

After reviewing all testable properties, I've identified the following consolidations:

- Properties 7.1, 7.2, 7.3 can be combined into a single property about UI feedback for all payment states
- Properties 3.1 and 6.4 both test that printing is triggered after payment - these can be combined
- Properties 1.1 and 1.2 both test QR code generation and display - can be combined into one comprehensive property

### Correctness Properties

Property 1: QR code generation completeness
*For any* valid payment amount and transaction data, generating a QR payment should produce a QR code that, when decoded, contains the payment amount, transaction ID, and merchant information
**Validates: Requirements 1.1, 1.2**

Property 2: NFC payment data processing
*For any* valid NFC data read from a device, the system should successfully extract payment information and create a transaction record
**Validates: Requirements 2.3**

Property 3: NFC error handling
*For any* NFC reading failure, the system should return an error result that includes an error message and allows retry
**Validates: Requirements 2.4**

Property 4: Receipt printing trigger
*For any* successful payment transaction (regardless of payment method), the system should automatically trigger receipt printing
**Validates: Requirements 3.1, 6.4**

Property 5: Printer status check precedence
*For any* print request, the system should check printer status before attempting to send data to the printer
**Validates: Requirements 3.2**

Property 6: Receipt content completeness
*For any* transaction, the formatted receipt should contain transaction ID, all items with quantities and prices, total amount, merchant information, and timestamp
**Validates: Requirements 3.3**

Property 7: Printer error handling
*For any* printer error or unavailable state, the system should return a failed print result with an error message
**Validates: Requirements 3.4**

Property 8: Print success feedback
*For any* successful print operation, the system should return a success result
**Validates: Requirements 3.5**

Property 9: Printer initialization error handling
*For any* printer initialization failure, the system should log the error and return a failed initialization result without throwing exceptions
**Validates: Requirements 4.3**

Property 10: Printer status retrieval
*For any* completed printer initialization (successful or failed), the system should retrieve and return printer status information
**Validates: Requirements 4.2**

Property 11: Mock payment timing
*For any* QR payment in development mode, the system should simulate payment confirmation after the configured delay period
**Validates: Requirements 6.1**

Property 12: Mock NFC payment success
*For any* NFC payment in development mode, the system should simulate successful payment processing and return a completed transaction
**Validates: Requirements 6.2**

Property 13: Mock transaction data validity
*For any* mock payment, the generated transaction should include a unique transaction ID, timestamp, amount, and payment method
**Validates: Requirements 6.3**

Property 14: Payment status UI feedback
*For any* payment state (processing, success, failure), the UI should display appropriate feedback including status indicator and relevant message
**Validates: Requirements 7.1, 7.2, 7.3**

## Error Handling

### Printer Errors

- **Printer Not Found**: Display error message, offer manual retry, continue app operation
- **Printer Busy**: Queue print job or display busy message with retry option
- **Paper Out**: Display specific error message prompting merchant to refill paper
- **Connection Lost**: Attempt reconnection, display error if failed

### NFC Errors

- **NFC Not Supported**: Disable NFC payment option, show message to user
- **NFC Disabled**: Prompt user to enable NFC in device settings
- **Read Timeout**: Display timeout message, offer retry
- **Invalid Card Data**: Display error message, offer retry with different card
- **Multiple Cards Detected**: Display message to remove extra cards and retry

### QR Payment Errors

- **QR Generation Failed**: Log error, display generic error message, offer retry
- **Payment Timeout**: Auto-cancel transaction after timeout period (e.g., 5 minutes)
- **Network Error** (future): Display network error, offer retry

### General Error Handling Strategy

1. All service methods return Result types (success/failure) rather than throwing exceptions
2. Errors are logged with context for debugging
3. User-facing error messages are clear and actionable
4. Critical errors don't crash the app
5. Graceful degradation: if printer fails, payment still succeeds

## Testing Strategy

### Unit Testing

We'll use Jest (already configured in the React Native project) for unit testing.

**Unit Test Coverage:**
- Service initialization functions
- Data formatting functions (receipt formatting, QR data encoding)
- Error handling edge cases (null inputs, invalid data)
- Mock payment simulation logic
- Transaction data validation

**Example Unit Tests:**
- `PrinterService.formatReceipt()` with empty items array
- `PaymentService.generateQRPayment()` with zero amount
- `NFCService.initialize()` when NFC is not supported
- Receipt formatting with very long merchant names
- Transaction ID generation uniqueness

### Property-Based Testing

We'll use `fast-check` library for property-based testing in TypeScript/JavaScript.

**Configuration:**
- Minimum 100 iterations per property test
- Each property test tagged with: `**Feature: payment-methods-integration, Property {number}: {property_text}**`

**Property Test Coverage:**
- Property 1: QR code generation completeness
- Property 2: NFC payment data processing
- Property 3: NFC error handling
- Property 4: Receipt printing trigger
- Property 5: Printer status check precedence
- Property 6: Receipt content completeness
- Property 7: Printer error handling
- Property 8: Print success feedback
- Property 9: Printer initialization error handling
- Property 10: Printer status retrieval
- Property 11: Mock payment timing
- Property 12: Mock NFC payment success
- Property 13: Mock transaction data validity
- Property 14: Payment status UI feedback

**Generators:**
- Random transaction amounts (positive numbers)
- Random transaction items (varying quantities and prices)
- Random merchant information
- Random NFC data payloads
- Random printer status states
- Random error conditions

### Integration Testing

- Full payment flow: QR generation → mock confirmation → receipt printing
- Full NFC flow: NFC scan → payment processing → receipt printing
- Printer initialization on app startup
- Navigation between payment screens

### Manual Testing

- Test on actual IMIN hardware with thermal printer
- Test NFC with real contactless cards
- Test QR codes with real payment apps (when backend integrated)
- Test printer paper out scenario
- Test NFC with multiple cards

## Implementation Notes

### Native Module Configuration

**Package Installation:**
```bash
npm install react-native-printer-imin react-native-nfc-manager react-native-svg react-native-qrcode-styled
```

**Expo Config Plugin (app.config.js):**
```javascript
plugins: [
  "expo-router",
  "react-native-nfc-manager",
  // ... other plugins
]
```

**Android Configuration:**
- Minimum SDK version will be automatically set to 31 by NFC manager plugin
- IMIN printer module requires Android device with IMIN SDK

**iOS Configuration:**
- NFC permissions will be added automatically by plugin
- Default permission message: "Allow Irion Merchant App to interact with nearby NFC devices"

### Mock Payment Implementation

For development and testing without actual payment gateway:

```typescript
// Mock payment confirmation after delay
const MOCK_PAYMENT_DELAY = 3000; // 3 seconds

async function mockPaymentConfirmation(transactionId: string): Promise<PaymentResult> {
  await new Promise(resolve => setTimeout(resolve, MOCK_PAYMENT_DELAY));
  return {
    success: true,
    transactionId,
    amount: /* stored amount */,
    timestamp: new Date(),
    paymentMethod: 'qr' // or 'nfc'
  };
}
```

### Printer Initialization

Initialize printer in app startup (e.g., in `App.tsx` or root layout):

```typescript
useEffect(() => {
  PrinterService.initialize()
    .then(status => console.log('Printer initialized:', status))
    .catch(err => console.error('Printer init failed:', err));
}, []);
```

### State Management

Use Zustand (already in dependencies) for payment state management:

```typescript
interface PaymentStore {
  currentTransaction: Transaction | null;
  paymentStatus: 'idle' | 'processing' | 'success' | 'failed';
  printerStatus: PrinterStatus;
  setTransaction: (transaction: Transaction) => void;
  setPaymentStatus: (status: string) => void;
  setPrinterStatus: (status: PrinterStatus) => void;
}
```

## Dependencies

### New Dependencies
- `react-native-printer-imin`: ^1.x (IMIN thermal printer SDK)
- `react-native-nfc-manager`: ^3.x (NFC reading)
- `react-native-svg`: ^15.x (required for QR code rendering)
- `react-native-qrcode-styled`: ^0.x (QR code generation with styling)
- `fast-check`: ^3.x (property-based testing - dev dependency)

### Existing Dependencies (Already Available)
- `expo-router`: Navigation
- `zustand`: State management
- `@expo/vector-icons`: Icons for UI
- `react-native-reanimated`: Animations for loading states

## Future Enhancements

1. **Real Payment Gateway Integration**: Replace mock payments with actual payment processor API
2. **Receipt Email/SMS**: Option to send digital receipt
3. **Receipt Templates**: Customizable receipt layouts
4. **Payment History**: Store and retrieve past transactions
5. **Offline Support**: Queue receipts when printer is offline
6. **Multi-language Receipts**: Support for different languages
7. **Tip Support**: Add tip amount to QR/NFC payments
8. **Split Payments**: Support multiple payment methods for one transaction

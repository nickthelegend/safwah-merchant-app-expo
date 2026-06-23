# Error Handling and User Feedback Guide

This guide explains how to use the error handling and user feedback components in the payment methods integration.

## Components Overview

### 1. Toast Component
Displays temporary success/error/warning/info messages at the top of the screen.

**Usage:**
```tsx
import { Toast } from '../components/common/Toast';
import { useToast } from '../hooks/useToast';

function MyComponent() {
  const { toast, showSuccess, showError, showWarning, showInfo, hideToast } = useToast();
  
  const handleAction = async () => {
    try {
      await someAsyncOperation();
      showSuccess('Operation completed successfully!');
    } catch (error) {
      showError('Operation failed. Please try again.');
    }
  };
  
  return (
    <View>
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={hideToast}
      />
      {/* Your component content */}
    </View>
  );
}
```

**Toast Types:**
- `success`: Green checkmark icon
- `error`: Red alert icon
- `warning`: Orange warning icon
- `info`: Blue information icon

### 2. PrinterErrorDisplay Component
Specialized component for displaying printer-related errors with contextual messages and retry options.

**Usage:**
```tsx
import { PrinterErrorDisplay } from '../components/common/PrinterErrorDisplay';

function MyComponent() {
  const [printerError, setPrinterError] = useState(null);
  
  const handlePrint = async () => {
    const result = await printerService.printReceipt(transaction);
    
    if (!result.success) {
      setPrinterError({
        message: result.error,
        type: result.errorType || 'unknown',
      });
    }
  };
  
  const handleRetryPrint = async () => {
    const result = await printerService.printReceipt(transaction);
    if (result.success) {
      setPrinterError(null);
    }
  };
  
  return (
    <View>
      {printerError && (
        <PrinterErrorDisplay
          errorType={printerError.type}
          errorMessage={printerError.message}
          onRetry={handleRetryPrint}
          onDismiss={() => setPrinterError(null)}
          compact={false} // Use compact=true for inline display
        />
      )}
    </View>
  );
}
```

**Printer Error Types:**
- `not_found`: Printer hardware not detected
- `not_connected`: Printer not connected to device
- `paper_out`: Printer out of paper
- `busy`: Printer currently processing another job
- `connection_lost`: Lost connection to printer
- `unknown`: Generic printer error

### 3. Enhanced LoadingState Component
Displays loading indicators with customizable messages and icons.

**Usage:**
```tsx
import { LoadingState } from '../components/common/LoadingState';

function MyComponent() {
  const [loading, setLoading] = useState(true);
  
  if (loading) {
    return (
      <LoadingState
        message="Processing payment..."
        submessage="Please wait while we confirm your transaction"
        icon="card"
        size="large"
      />
    );
  }
  
  return <View>{/* Your content */}</View>;
}
```

### 4. Enhanced ErrorState Component
Displays full-screen error states with retry and dismiss options.

**Usage:**
```tsx
import { ErrorState } from '../components/common/ErrorState';

function MyComponent() {
  const [error, setError] = useState(null);
  
  if (error) {
    return (
      <ErrorState
        title="Payment Failed"
        message="Unable to process your payment"
        submessage="Please check your connection and try again"
        onRetry={handleRetry}
        onDismiss={handleDismiss}
        retryLabel="Try Again"
        dismissLabel="Cancel"
        icon="alert-circle"
      />
    );
  }
  
  return <View>{/* Your content */}</View>;
}
```

## Best Practices

### 1. Use Toast for Non-Critical Feedback
- Success confirmations
- Warning messages that don't block user flow
- Informational updates

### 2. Use ErrorState for Critical Errors
- Payment failures
- Network errors that prevent core functionality
- Initialization failures

### 3. Use PrinterErrorDisplay for Printer Issues
- Always use after payment success when printing fails
- Provide retry option for recoverable errors
- Allow users to continue without receipt

### 4. Loading States
- Show loading indicators for all async operations
- Provide context-specific messages
- Use submessages for additional guidance

## Requirements Coverage

This implementation satisfies the following requirements:

- **Requirement 3.4**: Printer error display with retry functionality
- **Requirement 7.1**: Loading indicators for async operations
- **Requirement 7.2**: Success message display
- **Requirement 7.3**: Error message display with failure reasons

## Example: Complete Payment Flow

```tsx
function PaymentScreen() {
  const { toast, showSuccess, showError, showWarning, hideToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [printerError, setPrinterError] = useState(null);
  
  const handlePayment = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Process payment
      const paymentResult = await paymentService.processPayment(amount);
      
      if (!paymentResult.success) {
        setError(paymentResult.error);
        showError('Payment failed');
        return;
      }
      
      showSuccess('Payment completed!');
      
      // Print receipt
      const printResult = await printerService.printReceipt(transaction);
      
      if (!printResult.success) {
        setPrinterError({
          message: printResult.error,
          type: printResult.errorType,
        });
        showWarning('Receipt printing failed');
      } else {
        showSuccess('Receipt printed!');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      showError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return <LoadingState message="Processing payment..." />;
  }
  
  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={handlePayment}
        onDismiss={() => setError(null)}
      />
    );
  }
  
  return (
    <View>
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={hideToast}
      />
      
      {printerError && (
        <PrinterErrorDisplay
          errorType={printerError.type}
          errorMessage={printerError.message}
          onRetry={handleRetryPrint}
          onDismiss={() => setPrinterError(null)}
          compact
        />
      )}
      
      {/* Your payment UI */}
    </View>
  );
}
```

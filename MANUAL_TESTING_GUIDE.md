# Manual Testing Guide - Payment Methods Integration

## Overview

This guide provides comprehensive manual testing procedures for the payment methods integration feature. Use this checklist to verify all functionality works correctly on physical devices with actual hardware.

**Last Updated:** Task 15 - Final Testing and Polish
**Status:** ✅ All automated tests passing (47/47)

---

## Pre-Testing Setup

### Required Hardware
- [ ] Android device with IMIN thermal printer (minimum SDK 31)
- [ ] NFC-enabled test cards (contactless payment cards)
- [ ] Mobile device with QR code scanner app
- [ ] Thermal printer paper (ensure adequate supply)
- [ ] Backup paper roll for "paper out" testing

### Software Requirements
- [ ] Latest build installed on test device
- [ ] NFC enabled in device settings
- [ ] Printer connected and powered on
- [ ] Test merchant account configured

### Test Data Preparation
- [ ] Sample transaction items configured
- [ ] Merchant information set up correctly
- [ ] Test amounts prepared: $0.01, $10.00, $50.00, $999.99

---

## Test Suite 1: IMIN Printer Hardware Testing

### 1.1 Printer Initialization on App Startup
**Requirement:** 4.1, 4.2, 4.3

**Steps:**
1. Close app completely
2. Ensure printer is connected and powered on
3. Launch app
4. Check console logs for printer initialization

**Expected Results:**
- [ ] App launches without errors
- [ ] Printer initializes successfully
- [ ] Printer status is logged
- [ ] App continues even if printer fails

**Test Cases:**
- [ ] ✅ Printer connected and ready
- [ ] ✅ Printer disconnected (app should continue)
- [ ] ✅ Printer powered off (app should continue)

### 1.2 Receipt Printing - Normal Operation
**Requirement:** 3.1, 3.2, 3.3, 3.5

**Steps:**
1. Complete a test payment (QR or NFC)
2. Observe receipt printing automatically
3. Verify receipt content

**Expected Results:**
- [ ] Receipt prints automatically after payment success
- [ ] Receipt contains all required information:
  - [ ] Merchant business name
  - [ ] Merchant address
  - [ ] Merchant phone number
  - [ ] Transaction ID
  - [ ] Date and timestamp
  - [ ] Payment method (QR/NFC)
  - [ ] All transaction items with quantities
  - [ ] Item prices (unit and total)
  - [ ] Subtotal
  - [ ] Total amount
  - [ ] "Thank you" message
- [ ] Receipt is formatted clearly and readable
- [ ] Success confirmation shown to merchant

**Test Amounts:**
- [ ] $0.01 (minimum amount)
- [ ] $10.00 (typical amount)
- [ ] $999.99 (large amount)

### 1.3 Receipt Content Edge Cases
**Requirement:** 3.3

**Test Cases:**
- [ ] Very long merchant name (50+ characters)
- [ ] Very long item names (100+ characters)
- [ ] Special characters in item names (é, ñ, ü, etc.)
- [ ] Empty merchant address
- [ ] Transaction with 1 item
- [ ] Transaction with 10+ items
- [ ] Items with decimal quantities (0.5, 2.25)

**Expected Results:**
- [ ] Long text wraps correctly
- [ ] Special characters print correctly
- [ ] All items visible on receipt
- [ ] Formatting remains consistent

### 1.4 Printer Error Handling
**Requirement:** 3.4, 4.3

**Test Scenarios:**

#### Printer Not Found
1. Disconnect printer before payment
2. Complete payment
3. Observe error handling

**Expected:**
- [ ] Payment succeeds
- [ ] Error message: "Printer not found"
- [ ] Retry button available
- [ ] Can dismiss error and continue

#### Printer Busy
1. Start printing a receipt
2. Immediately try to print another
3. Observe behavior

**Expected:**
- [ ] Second print queues or shows busy message
- [ ] No crash or data loss
- [ ] Clear feedback to user

#### Connection Lost During Print
1. Start printing
2. Disconnect printer mid-print
3. Observe error handling

**Expected:**
- [ ] Error message: "Connection lost"
- [ ] Retry option available
- [ ] Transaction data preserved

### 1.5 Paper Out Scenario
**Requirement:** 3.4 (Critical Test)

**Steps:**
1. Remove paper from printer
2. Complete a payment
3. Attempt to print receipt
4. Observe error handling
5. Add paper back
6. Retry printing

**Expected Results:**
- [ ] Payment completes successfully
- [ ] Specific error: "Printer out of paper" or similar
- [ ] Clear instructions to refill paper
- [ ] Retry button available
- [ ] After refilling, retry succeeds
- [ ] Receipt prints correctly

**Variations:**
- [ ] Paper runs out mid-print
- [ ] Paper low warning (if supported)

---

## Test Suite 2: NFC Payment Testing

### 2.1 NFC Initialization and Availability
**Requirement:** 2.1

**Test Cases:**

#### NFC Supported and Enabled
1. Ensure NFC is enabled in device settings
2. Navigate to NFC payment screen
3. Observe initialization

**Expected:**
- [ ] NFC initializes successfully
- [ ] "Ready to scan" indicator shown
- [ ] Animated pulse effect on NFC icon
- [ ] No error messages

#### NFC Disabled
1. Disable NFC in device settings
2. Navigate to NFC payment screen
3. Observe error handling

**Expected:**
- [ ] Error message: "NFC is disabled"
- [ ] Instructions to enable NFC in settings
- [ ] Cancel option available
- [ ] No app crash

#### NFC Not Supported (if testable)
**Expected:**
- [ ] Error message: "NFC not supported"
- [ ] Cancel option available
- [ ] Graceful degradation

### 2.2 NFC Visual Feedback
**Requirement:** 2.2

**Steps:**
1. Navigate to NFC scanner screen
2. Observe visual elements

**Expected Results:**
- [ ] Clear "Ready to scan" status
- [ ] Animated NFC icon (pulse effect)
- [ ] Payment amount displayed prominently
- [ ] Merchant information visible
- [ ] Cancel button accessible
- [ ] Instructions clear for customer

### 2.3 NFC Card Scanning - Success Flow
**Requirement:** 2.3, 2.5, 6.2

**Test Cards:**
- [ ] Contactless credit card
- [ ] Contactless debit card
- [ ] Mobile payment (Apple Pay/Google Pay)
- [ ] NFC-enabled loyalty card (if applicable)

**Steps for Each Card:**
1. Navigate to NFC payment screen
2. Hold card near NFC reader
3. Wait for detection
4. Observe payment processing
5. Verify receipt printing
6. Check navigation

**Expected Results:**
- [ ] Card detected within 1-2 seconds
- [ ] Payment data read successfully
- [ ] Processing indicator shown
- [ ] Payment completes successfully
- [ ] Transaction ID generated (format: NFC-timestamp-random)
- [ ] Receipt prints automatically
- [ ] Success message displayed
- [ ] Transaction details shown
- [ ] "Done" button returns to previous screen

**Test Amounts:**
- [ ] $0.01
- [ ] $25.00
- [ ] $100.00
- [ ] $999.99

### 2.4 NFC Error Handling
**Requirement:** 2.4

**Test Scenarios:**

#### Scanning Timeout
1. Start NFC scanning
2. Wait 30 seconds without tapping card
3. Observe timeout behavior

**Expected:**
- [ ] Timeout after 30 seconds
- [ ] Error message: "Scanning timed out"
- [ ] Retry option available
- [ ] NFC session cleaned up

#### Card Removed Too Quickly
1. Tap card briefly and remove immediately
2. Observe behavior

**Expected:**
- [ ] Error message or retry prompt
- [ ] Can retry immediately
- [ ] No crash

#### Multiple Cards Detected
1. Hold two NFC cards near reader simultaneously
2. Observe behavior

**Expected:**
- [ ] Error message about multiple cards
- [ ] Instructions to use one card
- [ ] Retry option available

#### Invalid Card Data
1. Use non-payment NFC tag (if available)
2. Observe error handling

**Expected:**
- [ ] Error message about invalid data
- [ ] Retry option available
- [ ] No crash

### 2.5 NFC Cancel Functionality
**Requirement:** 2.4

**Steps:**
1. Start NFC scanning
2. Press cancel button
3. Observe behavior

**Expected Results:**
- [ ] Scanning stops immediately
- [ ] NFC session cleaned up
- [ ] Returns to previous screen
- [ ] No memory leaks
- [ ] Can restart scanning

---

## Test Suite 3: QR Code Payment Testing

### 3.1 QR Code Generation
**Requirement:** 1.1, 1.2

**Steps:**
1. Navigate to QR payment screen
2. Observe QR code generation
3. Verify displayed information

**Expected Results:**
- [ ] QR code generates within 1 second
- [ ] QR code is clear and scannable
- [ ] Payment amount displayed prominently
- [ ] Merchant business name shown
- [ ] Merchant address shown
- [ ] Merchant phone shown
- [ ] Transaction ID displayed
- [ ] Countdown timer visible (5:00)
- [ ] Cancel button available

**Test Amounts:**
- [ ] $0.01
- [ ] $15.50
- [ ] $100.00
- [ ] $999.99

### 3.2 QR Code Scanning with Mobile Apps
**Requirement:** 1.1 (Critical Test)

**Test Apps:**
- [ ] Generic QR scanner app
- [ ] Camera app (if supports QR)
- [ ] Payment app (if available)

**Steps for Each App:**
1. Generate QR code on merchant device
2. Open scanner app on customer device
3. Scan QR code
4. Verify data decoded correctly

**Expected Results:**
- [ ] QR code scans successfully
- [ ] Decoded data contains:
  - [ ] Payment amount
  - [ ] Transaction ID
  - [ ] Merchant information
  - [ ] Timestamp/expiry
- [ ] Data is properly formatted
- [ ] No encoding errors

**Edge Cases:**
- [ ] Scan from different angles
- [ ] Scan from different distances
- [ ] Scan in low light
- [ ] Scan in bright light
- [ ] Scan with screen brightness at 50%

### 3.3 QR Payment Mock Confirmation
**Requirement:** 1.3, 6.1

**Steps:**
1. Generate QR code
2. Wait for auto-confirmation (3 seconds in dev mode)
3. Observe payment completion

**Expected Results:**
- [ ] Payment confirms after ~3 seconds
- [ ] Success message displayed
- [ ] Transaction ID shown
- [ ] Receipt prints automatically
- [ ] "Done" button available
- [ ] Countdown timer stops

### 3.4 QR Payment Timeout
**Requirement:** 1.3, 7.5

**Steps:**
1. Generate QR code
2. Wait for 5 minutes without action
3. Observe timeout behavior

**Expected Results:**
- [ ] Countdown timer counts down from 5:00
- [ ] Timer updates every second
- [ ] At 0:00, payment times out
- [ ] Timeout alert displayed
- [ ] Payment cancelled automatically
- [ ] Returns to previous screen
- [ ] Transaction not created

### 3.5 QR Payment Cancel
**Requirement:** 1.4

**Steps:**
1. Generate QR code
2. Press cancel button
3. Observe behavior

**Expected Results:**
- [ ] Payment cancelled immediately
- [ ] Confirmation alert shown
- [ ] Returns to previous screen
- [ ] Timer cleared
- [ ] No transaction created
- [ ] Can restart payment

---

## Test Suite 4: Error States Display

### 4.1 Loading States
**Requirement:** 7.1

**Test Scenarios:**
- [ ] QR code generation loading
- [ ] NFC initialization loading
- [ ] Payment processing loading
- [ ] Receipt printing loading

**Expected for Each:**
- [ ] Spinner/activity indicator visible
- [ ] Appropriate status text
- [ ] No UI freezing
- [ ] Can cancel if applicable

### 4.2 Success States
**Requirement:** 7.2

**Test Scenarios:**
- [ ] QR payment success
- [ ] NFC payment success
- [ ] Receipt print success

**Expected for Each:**
- [ ] Success icon (checkmark)
- [ ] Success message
- [ ] Transaction details shown
- [ ] Transaction ID displayed
- [ ] "Done" button available
- [ ] Green/positive color scheme

### 4.3 Error States
**Requirement:** 7.3

**Test Scenarios:**
- [ ] Payment failure
- [ ] Printer error
- [ ] NFC error
- [ ] Timeout error

**Expected for Each:**
- [ ] Error icon (alert/X)
- [ ] Clear error message
- [ ] Specific failure reason
- [ ] Retry option (if applicable)
- [ ] Cancel/dismiss option
- [ ] Red/warning color scheme

### 4.4 Toast Notifications
**Requirement:** 7.1, 7.2, 7.3

**Test Cases:**
- [ ] Success toast (green, checkmark)
- [ ] Error toast (red, alert)
- [ ] Warning toast (orange, warning)
- [ ] Info toast (blue, info)

**Expected:**
- [ ] Toast appears at top of screen
- [ ] Auto-dismisses after 3 seconds
- [ ] Can manually dismiss
- [ ] Doesn't block UI interaction
- [ ] Multiple toasts queue properly

### 4.5 Printer Error Display Component
**Requirement:** 3.4

**Test Scenarios:**
- [ ] Printer not found
- [ ] Printer not connected
- [ ] Paper out
- [ ] Printer busy
- [ ] Connection lost
- [ ] Unknown error

**Expected for Each:**
- [ ] Specific error type displayed
- [ ] Contextual error message
- [ ] Appropriate icon
- [ ] Retry button (if recoverable)
- [ ] Dismiss button
- [ ] Compact and full-screen modes work

---

## Test Suite 5: Integration Testing

### 5.1 Complete QR Payment Flow
**Requirement:** All QR requirements

**Steps:**
1. Navigate to POS screen
2. Add items to cart
3. Select QR payment method
4. Generate QR code
5. Wait for auto-confirmation
6. Verify receipt printing
7. Return to POS

**Expected Results:**
- [ ] Smooth navigation throughout
- [ ] All data passed correctly
- [ ] Payment completes successfully
- [ ] Receipt contains correct items
- [ ] Transaction recorded
- [ ] Can start new transaction

### 5.2 Complete NFC Payment Flow
**Requirement:** All NFC requirements

**Steps:**
1. Navigate to POS screen
2. Add items to cart
3. Select NFC payment method
4. Initialize NFC scanner
5. Tap test card
6. Verify payment processing
7. Verify receipt printing
8. Return to POS

**Expected Results:**
- [ ] Smooth navigation throughout
- [ ] All data passed correctly
- [ ] NFC reads successfully
- [ ] Payment completes successfully
- [ ] Receipt contains correct items
- [ ] Transaction recorded
- [ ] Can start new transaction

### 5.3 Printer Initialization on Startup
**Requirement:** 4.1, 4.2, 4.3, 4.4

**Steps:**
1. Close app completely
2. Restart app
3. Check printer status
4. Complete a payment
5. Verify printing works

**Expected Results:**
- [ ] Printer initializes on app start
- [ ] Status logged to console
- [ ] App doesn't block on printer init
- [ ] Printer ready for first payment
- [ ] Status updates reflected in UI

### 5.4 Multiple Payments in Sequence
**Requirement:** All requirements

**Steps:**
1. Complete QR payment
2. Immediately complete NFC payment
3. Complete another QR payment
4. Verify all receipts print

**Expected Results:**
- [ ] All payments succeed
- [ ] All receipts print correctly
- [ ] No state conflicts
- [ ] No memory leaks
- [ ] Transaction IDs are unique
- [ ] Printer handles queue properly

### 5.5 Error Recovery Flow
**Requirement:** 3.4, 7.3

**Steps:**
1. Complete payment with printer disconnected
2. Observe error
3. Connect printer
4. Retry printing
5. Verify success

**Expected Results:**
- [ ] Payment succeeds despite printer error
- [ ] Error displayed clearly
- [ ] Retry option works
- [ ] Receipt prints after retry
- [ ] Can continue with new transactions

---

## Test Suite 6: Edge Cases and Stress Testing

### 6.1 Rapid Operations
- [ ] Generate QR, cancel, generate again rapidly
- [ ] Start NFC scan, cancel, start again rapidly
- [ ] Print multiple receipts in quick succession

**Expected:**
- [ ] No crashes
- [ ] No state corruption
- [ ] All operations complete correctly

### 6.2 Memory and Performance
- [ ] Complete 20 payments in a row
- [ ] Check app memory usage
- [ ] Verify no memory leaks

**Expected:**
- [ ] App remains responsive
- [ ] Memory usage stable
- [ ] No performance degradation

### 6.3 Network Conditions (Future)
- [ ] Test with WiFi disabled
- [ ] Test with poor connection
- [ ] Test with airplane mode

**Expected:**
- [ ] Graceful handling
- [ ] Clear error messages
- [ ] Can retry when connection restored

### 6.4 Device Interruptions
- [ ] Incoming call during payment
- [ ] Low battery warning during payment
- [ ] Screen lock during payment
- [ ] App backgrounded during payment

**Expected:**
- [ ] Payment state preserved
- [ ] Can resume or cancel
- [ ] No data loss
- [ ] Timers handled correctly

---

## Test Results Summary

### Test Execution Date: _______________
### Tester Name: _______________
### Device Model: _______________
### OS Version: _______________
### App Version: _______________

### Results Overview

| Test Suite | Total Tests | Passed | Failed | Blocked | Notes |
|------------|-------------|--------|--------|---------|-------|
| 1. Printer Hardware | | | | | |
| 2. NFC Payment | | | | | |
| 3. QR Payment | | | | | |
| 4. Error States | | | | | |
| 5. Integration | | | | | |
| 6. Edge Cases | | | | | |
| **TOTAL** | | | | | |

### Critical Issues Found
1. 
2. 
3. 

### Minor Issues Found
1. 
2. 
3. 

### Recommendations
1. 
2. 
3. 

### Sign-off

**Tester Signature:** _______________  
**Date:** _______________

**Product Owner Approval:** _______________  
**Date:** _______________

---

## Appendix A: Test Data

### Sample Merchant Information
```
Business Name: Irion Test Merchant
Address: 123 Main Street, Suite 100, City, State 12345
Phone: (555) 123-4567
Tax ID: 12-3456789
```

### Sample Transaction Items
```
1. Coffee - $3.50
2. Sandwich - $8.99
3. Salad - $6.75
4. Water - $1.50
5. Cookie - $2.25
```

### Test Transaction Amounts
- Minimum: $0.01
- Small: $5.00
- Medium: $25.00
- Large: $100.00
- Maximum: $999.99

---

## Appendix B: Known Limitations

1. **Mock Payments**: Current implementation uses mock payment confirmation (3-second delay). Real payment gateway integration pending.

2. **NFC Simulator**: NFC functionality cannot be tested in iOS Simulator or Android Emulator. Physical device required.

3. **IMIN Printer**: Printer functionality specific to IMIN hardware. May not work with other thermal printers.

4. **QR Code Validation**: QR codes contain transaction data but don't connect to actual payment processor yet.

---

## Appendix C: Troubleshooting

### Printer Not Initializing
- Check printer is powered on
- Verify USB/Bluetooth connection
- Restart printer
- Restart app
- Check device compatibility

### NFC Not Working
- Verify NFC enabled in settings
- Check device has NFC hardware
- Try different NFC cards
- Restart device
- Update device OS

### QR Code Not Scanning
- Increase screen brightness
- Clean camera lens
- Try different scanner app
- Check QR code size
- Verify proper lighting

---

**End of Manual Testing Guide**

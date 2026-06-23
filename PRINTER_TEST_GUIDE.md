# Printer Test & Debug Guide

## ✅ Printer Test Screen Created!

I've created a comprehensive printer test screen to help you connect and test your IMIN printer.

---

## How to Access

### Option 1: Via Profile Screen
1. Open the app
2. Navigate to **Profile** tab
3. Tap **"Printer Test & Debug"** menu item
4. Test screen opens

### Option 2: Direct Navigation
```typescript
router.push('/printer-test');
```

---

## What You're Seeing

Your logs show:
```
Printer initialized successfully: {
  "error": "Printer is normal!",
  "isAvailable": true,
  "isConnected": false
}
```

**Analysis:**
- ✅ `isAvailable: true` - Printer module is working
- ✅ `error: "Printer is normal!"` - No hardware errors
- ❌ `isConnected: false` - Printer not connected yet

**This means:** The printer module is loaded, but the physical printer isn't connected via USB/Bluetooth.

---

## Test Screen Features

### 1. Printer Status Card
Shows real-time printer status:
- Available (Yes/No)
- Connected (Yes/No)
- Status message

### 2. Test Functions (5 Buttons)

#### Button 1: Check Printer Status
- Queries current printer status
- Updates status card
- Logs detailed information

#### Button 2: Test Initialize
- Attempts to initialize printer
- Useful if connection lost
- Logs initialization result

#### Button 3: Test Format Receipt
- Formats a test receipt
- Shows formatted text in logs
- Doesn't print, just formats

#### Button 4: Test Simple Print ⭐
- **Main test button**
- Creates test transaction
- Attempts to print receipt
- Shows success/error alert

#### Button 5: Test Printer Module Direct
- Tests direct module access
- Shows available methods
- Advanced debugging

### 3. Console Logs
- Real-time logging
- Timestamps on all logs
- Scrollable log viewer
- Clear button to reset

### 4. Instructions
- Step-by-step guide
- Connection requirements
- Troubleshooting tips

---

## How to Connect IMIN Printer

### USB Connection (Recommended)

1. **Connect USB Cable**
   - Plug USB cable from printer to Android device
   - Use USB-C to USB adapter if needed

2. **Check USB Permissions**
   - Android may ask for USB device permission
   - Tap "Allow" when prompted

3. **Test Connection**
   - Open Printer Test screen
   - Tap "Check Printer Status"
   - Look for `isConnected: true`

### Bluetooth Connection

1. **Enable Bluetooth**
   - Turn on Bluetooth on Android device
   - Turn on Bluetooth on printer

2. **Pair Devices**
   - Go to Android Settings → Bluetooth
   - Find IMIN printer in available devices
   - Tap to pair

3. **Test Connection**
   - Open Printer Test screen
   - Tap "Check Printer Status"
   - Look for `isConnected: true`

---

## Testing Workflow

### Step 1: Check Status
```
1. Open Printer Test screen
2. Tap "Check Printer Status"
3. Look at logs for status details
```

**Expected:**
```
[10:30:45] Checking printer status...
[10:30:45] Printer Status: {
  "isAvailable": true,
  "isConnected": true,  ← Should be true
  "error": "Printer is normal!"
}
```

### Step 2: Test Format
```
1. Tap "Test Format Receipt"
2. Check logs for formatted receipt
3. Verify all fields present
```

**Expected:**
```
[10:31:00] Testing Receipt Formatting
[10:31:00] ---START RECEIPT---
[10:31:00] ================================
[10:31:00]      Irion Test Merchant
[10:31:00]    123 Main Street, Suite 100
[10:31:00]       (555) 123-4567
[10:31:00] ================================
[10:31:00] ...
[10:31:00] ---END RECEIPT---
```

### Step 3: Test Print
```
1. Tap "Test Simple Print"
2. Wait for print to complete
3. Check for success alert
4. Verify receipt printed
```

**Expected:**
- Alert: "Success - Test print completed!"
- Receipt prints from printer
- Logs show print result

---

## Troubleshooting

### Issue: isConnected: false

**Cause:** Printer not physically connected

**Solutions:**
1. Check USB cable is plugged in
2. Try different USB port
3. Check USB permissions granted
4. Try Bluetooth connection instead
5. Restart printer
6. Restart app

### Issue: Print Failed - "Printer not found"

**Cause:** Printer module can't find hardware

**Solutions:**
1. Verify IMIN printer is powered on
2. Check USB connection
3. Tap "Test Initialize" button
4. Check device is IMIN hardware
5. Verify printer drivers installed

### Issue: Print Failed - "Printer busy"

**Cause:** Printer is processing another job

**Solutions:**
1. Wait a few seconds
2. Try print again
3. Restart printer if stuck

### Issue: Module Import Error

**Cause:** Native module not linked

**Solutions:**
1. Verify you're using development build (not Expo Go)
2. Rebuild app with EAS
3. Check module is in package.json

---

## Console Log Examples

### Successful Connection
```
[10:30:00] Printer Test Screen loaded
[10:30:01] Checking printer status...
[10:30:01] Printer Status: {
  "isAvailable": true,
  "isConnected": true,
  "error": "Printer is normal!"
}
```

### Successful Print
```
[10:31:00] === Testing Simple Print ===
[10:31:00] Test transaction created
[10:31:00] Transaction: { ... }
[10:31:00] Calling printReceipt...
[10:31:02] Print result: {
  "success": true
}
```

### Connection Error
```
[10:32:00] === Testing Simple Print ===
[10:32:00] Calling printReceipt...
[10:32:01] Print result: {
  "success": false,
  "error": "Printer not connected",
  "errorType": "not_connected"
}
```

---

## What Each Test Does

### Test 1: Check Status
```typescript
const status = await printerService.getStatus();
// Returns: { isAvailable, isConnected, error }
```

### Test 2: Initialize
```typescript
const result = await printerService.initialize();
// Attempts to connect to printer
```

### Test 3: Format Receipt
```typescript
const formatted = printerService.formatReceipt(transaction);
// Returns formatted text string
```

### Test 4: Simple Print
```typescript
const result = await printerService.printReceipt(transaction);
// Attempts to print receipt
// Returns: { success, error, errorType }
```

### Test 5: Module Direct
```typescript
const IminPrinter = require('react-native-printer-imin');
const status = await IminPrinter.getPrinterStatus();
// Direct module access for debugging
```

---

## Next Steps

### Once Connected (isConnected: true)

1. **Test Format**
   - Verify receipt formatting looks good
   - Check all fields are present

2. **Test Print**
   - Print test receipt
   - Verify paper feeds correctly
   - Check print quality

3. **Test Real Transaction**
   - Complete actual payment
   - Print real receipt
   - Verify all data correct

### If Still Not Connected

1. **Check Hardware**
   - Is printer powered on?
   - Is USB cable good?
   - Is device IMIN hardware?

2. **Check Permissions**
   - USB device permission granted?
   - App has necessary permissions?

3. **Check Build**
   - Using development build?
   - Module properly linked?
   - Latest build installed?

---

## Files Created

1. ✅ `screens/PrinterTestScreen.tsx` - Test screen component
2. ✅ `app/printer-test.tsx` - Route configuration
3. ✅ `PRINTER_TEST_GUIDE.md` - This guide
4. ✅ Modified `screens/ProfileScreen.tsx` - Added menu item

---

## Quick Reference

### Access Test Screen
```
Profile → Printer Test & Debug
```

### Test Sequence
```
1. Check Status
2. Test Format
3. Test Print
4. Check Logs
```

### Expected Status (Connected)
```json
{
  "isAvailable": true,
  "isConnected": true,
  "error": "Printer is normal!"
}
```

---

## Support

**If printer still won't connect:**
1. Check all logs in test screen
2. Try "Test Printer Module Direct" button
3. Verify device is IMIN hardware
4. Check USB cable and connections
5. Restart printer and app

**The test screen will help you:**
- ✅ See real-time printer status
- ✅ Test each function individually
- ✅ View detailed console logs
- ✅ Debug connection issues
- ✅ Verify print functionality

---

**Ready to test! Open the app and navigate to Profile → Printer Test & Debug** 🖨️✨

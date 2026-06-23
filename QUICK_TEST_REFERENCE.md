# Quick Test Reference Card

## 🚀 Fast Start Guide for Manual Testing

**For detailed procedures, see: MANUAL_TESTING_GUIDE.md**

---

## ✅ Pre-Test Checklist (5 minutes)

- [ ] IMIN printer connected and powered on
- [ ] NFC enabled in device settings
- [ ] Test cards ready (contactless payment cards)
- [ ] QR scanner app installed on second device
- [ ] Printer paper loaded (+ backup roll)
- [ ] App installed and launches successfully

---

## 🔴 Critical Tests (Must Pass)

### Test 1: QR Payment + Receipt (5 min)
```
1. Navigate to QR payment
2. Enter amount: $10.00
3. Wait for auto-confirmation (~3 sec)
4. Verify receipt prints
5. Check receipt has all details
```
**Pass Criteria:** Receipt prints with all transaction details

### Test 2: NFC Payment + Receipt (5 min)
```
1. Navigate to NFC payment
2. Enter amount: $25.00
3. Tap contactless card
4. Verify payment processes
5. Verify receipt prints
```
**Pass Criteria:** Card detected, payment succeeds, receipt prints

### Test 3: Paper Out Scenario (10 min)
```
1. Remove printer paper
2. Complete any payment
3. Observe error message
4. Add paper back
5. Press retry
6. Verify receipt prints
```
**Pass Criteria:** Error shown, retry works, receipt prints after refill

### Test 4: Error States (5 min)
```
1. Disable NFC → Try NFC payment → Check error
2. Disconnect printer → Try payment → Check error
3. Verify all errors have retry/cancel buttons
```
**Pass Criteria:** All errors display correctly with clear messages

---

## 🟡 Important Tests

### QR Code Scanning (5 min)
```
1. Generate QR code on merchant device
2. Scan with mobile QR scanner app
3. Verify decoded data contains:
   - Payment amount
   - Transaction ID
   - Merchant info
```

### NFC Timeout (30 sec)
```
1. Start NFC scanning
2. Wait 30 seconds without tapping
3. Verify timeout error appears
```

### Payment Cancel (2 min)
```
1. Start QR payment → Press cancel
2. Start NFC payment → Press cancel
3. Verify both return to previous screen
```

---

## 📋 Receipt Content Checklist

Every receipt MUST contain:
- [ ] Merchant business name
- [ ] Merchant address
- [ ] Merchant phone
- [ ] Transaction ID
- [ ] Date and time
- [ ] Payment method (QR/NFC)
- [ ] All items with quantities
- [ ] Item prices
- [ ] Total amount
- [ ] "Thank you" message

---

## 🐛 Common Issues & Quick Fixes

### Printer Not Found
- Check printer is powered on
- Verify USB/Bluetooth connection
- Restart printer
- Restart app

### NFC Not Working
- Check NFC enabled in settings
- Try different card
- Restart device
- Verify device has NFC hardware

### QR Code Won't Scan
- Increase screen brightness
- Try different scanner app
- Check proper lighting
- Clean camera lens

---

## 📊 Quick Test Results

| Test | Status | Notes |
|------|--------|-------|
| QR Payment + Receipt | ⬜ | |
| NFC Payment + Receipt | ⬜ | |
| Paper Out Scenario | ⬜ | |
| Error States | ⬜ | |
| QR Code Scanning | ⬜ | |
| NFC Timeout | ⬜ | |
| Payment Cancel | ⬜ | |

**Legend:** ✅ Pass | ❌ Fail | ⚠️ Issue | ⬜ Not Tested

---

## 🎯 Test Amounts to Use

- **Minimum:** $0.01
- **Small:** $10.00
- **Medium:** $50.00
- **Large:** $100.00
- **Maximum:** $999.99

---

## 📱 Test Data

### Merchant Info
```
Business: Irion Test Merchant
Address: 123 Main Street, Suite 100
Phone: (555) 123-4567
```

### Sample Items
```
1. Coffee - $3.50
2. Sandwich - $8.99
3. Salad - $6.75
```

---

## 🚨 Critical Issues - Report Immediately

- App crashes
- Payment succeeds but no receipt
- Receipt missing critical data
- Cannot recover from errors
- Data corruption

---

## ✅ Success Criteria

**Minimum to Pass:**
- ✅ QR payment works end-to-end
- ✅ NFC payment works end-to-end
- ✅ Receipts print with all data
- ✅ Paper out error handled correctly
- ✅ All error states display properly

---

## 📞 Support

**For detailed procedures:** See MANUAL_TESTING_GUIDE.md  
**For implementation details:** See PRE_MANUAL_TESTING_CHECKLIST.md  
**For error handling:** See ERROR_HANDLING_GUIDE.md

---

**Testing Time Estimate:** 30-45 minutes for critical tests  
**Full Test Suite:** 2-3 hours

**Good luck with testing! 🎉**

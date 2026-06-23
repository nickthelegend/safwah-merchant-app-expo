# Quick Build Guide - Get Testing Fast! 🚀

## ⚠️ You Cannot Use Expo Go

This app requires native modules. You need a **development build**.

---

## Fastest Way to Test (15 minutes) ⭐ RECOMMENDED

### Step 1: Clean Up Previous Build Attempts
```bash
# Remove android folder if it exists
rm -rf android ios

# Clear caches
npx expo start --clear
```

### Step 2: Install EAS CLI
```bash
npm install -g eas-cli
```

### Step 3: Login to Expo
```bash
eas login
```
(Create free account if needed at expo.dev)

### Step 4: Build Development APK
```bash
eas build --profile development --platform android
```

This will:
- ✅ Build the app with all native modules properly linked
- ✅ Take 10-15 minutes
- ✅ Give you a download link when done
- ✅ Handle all autolinking automatically

### Step 5: Install on Device
1. Download the APK from the link EAS provides
2. Transfer to your Android device (or scan QR code to download directly)
3. Install the APK
4. Allow "Install from unknown sources" if prompted

### Step 6: Start Development Server
```bash
npx expo start --dev-client
```

### Step 7: Connect
1. Open the installed app on your device
2. Scan the QR code shown in terminal
3. App will load and connect
4. You're ready to test!

---

## ⚠️ Important: Use EAS Build, Not Local Prebuild

**Why EAS Build is better:**
- ✅ Handles all autolinking automatically
- ✅ No Gradle configuration issues
- ✅ Consistent builds every time
- ✅ No need for Android Studio

**Local prebuild issues:**
- ❌ Autolinking configuration can fail
- ❌ Gradle version conflicts
- ❌ Requires Android Studio setup
- ❌ More troubleshooting needed

---

## What You Need

### Hardware
- ✅ Physical Android device (minimum SDK 31)
- ✅ IMIN thermal printer
- ✅ NFC-enabled test cards
- ✅ USB cable or WiFi connection

### Software
- ✅ Node.js installed
- ✅ Expo account (free)
- ✅ EAS CLI installed

---

## Why Not Expo Go?

Expo Go is a sandbox app that only supports certain modules. Our app uses:
- `react-native-printer-imin` ❌ Not in Expo Go
- `react-native-nfc-manager` ❌ Not in Expo Go

**Solution:** Development build includes these modules ✅

---

## Alternative: Local Build (Faster if you have Android Studio)

### Step 1: Generate Native Code
```bash
npx expo prebuild --clean
```

### Step 2: Build with Gradle
```bash
cd android
./gradlew assembleDebug
```

### Step 3: Install APK
```bash
adb install app/build/outputs/apk/debug/app-debug.apk
```

### Step 4: Start Metro
```bash
npx expo start --dev-client
```

---

## After First Build

Good news! You only build once. After that:

### For JavaScript Changes
```bash
npx expo start --dev-client
```
Changes hot reload automatically ✅

### Only Rebuild When
- Adding new native modules
- Changing app.config.js plugins
- Modifying native code

---

## Troubleshooting

### "Package not linked" error
❌ You're using Expo Go  
✅ Use development build (EAS Build)

### "Autolinking is not set up in settings.gradle"
❌ You tried local prebuild  
✅ Use EAS Build instead:
```bash
# Clean up
rm -rf android ios
# Build with EAS
eas build --profile development --platform android
```

### Build fails with Gradle errors
❌ Local build issues  
✅ Use EAS Build - it handles everything

### Can't connect to dev server
- Ensure device and computer on same WiFi
- Try USB connection: `adb reverse tcp:8081 tcp:8081`
- Restart the dev server: `npx expo start --dev-client --clear`

---

## Testing Checklist

After installing development build:

- [ ] App launches without errors
- [ ] No "package not linked" errors
- [ ] Printer initializes (check console)
- [ ] Can navigate to QR payment screen
- [ ] Can navigate to NFC payment screen
- [ ] QR code renders correctly

---

## Next Steps

Once your development build is installed:

1. **Connect IMIN printer** to device
2. **Enable NFC** in device settings
3. **Follow testing guide**: See MANUAL_TESTING_GUIDE.md
4. **Quick tests**: See QUICK_TEST_REFERENCE.md

---

## Build Time Estimates

| Method | First Build | Subsequent |
|--------|-------------|------------|
| EAS Build | 10-15 min | 10-15 min |
| Local Build | 5-10 min | 2-3 min |

---

## Support

**Detailed build instructions:** BUILD_INSTRUCTIONS.md  
**Build troubleshooting:** BUILD_TROUBLESHOOTING.md  
**Testing procedures:** MANUAL_TESTING_GUIDE.md

---

## Summary

✅ **Do This (Recommended):**
1. Clean up: `rm -rf android ios`
2. Install EAS CLI: `npm install -g eas-cli`
3. Login: `eas login`
4. Build: `eas build --profile development --platform android`
5. Install APK on device
6. Start server: `npx expo start --dev-client`
7. Test features!

❌ **Don't Do This:**
- Try to use Expo Go (won't work - no native modules)
- Use local prebuild (autolinking issues)
- Test in simulator (no NFC/printer hardware)
- Skip the development build

---

**Ready? Run this now:**
```bash
npm install -g eas-cli && eas login && eas build --profile development --platform android
```

**Then grab coffee ☕ for 15 minutes while it builds!**

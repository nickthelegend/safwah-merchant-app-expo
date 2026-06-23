# Build Instructions for Payment Methods Integration

## ⚠️ Important: Development Build Required

This app uses native modules that **cannot run in Expo Go**:
- `react-native-printer-imin` (IMIN thermal printer)
- `react-native-nfc-manager` (NFC functionality)

You **must** create a development build to test these features.

---

## Prerequisites

### Required Software
- Node.js (v18 or later)
- npm or yarn
- Android Studio (for Android builds)
- Xcode (for iOS builds, Mac only)
- EAS CLI: `npm install -g eas-cli`

### Required Hardware
- Physical Android device with IMIN printer support
- USB cable for device connection
- OR Android emulator with Google Play Services

---

## Option 1: Local Development Build (Recommended for Testing)

### Step 1: Install EAS CLI
```bash
npm install -g eas-cli
```

### Step 2: Login to Expo
```bash
eas login
```

### Step 3: Configure EAS Build
```bash
eas build:configure
```

### Step 4: Create Development Build for Android
```bash
# For physical device
eas build --profile development --platform android

# This will:
# 1. Build the native code
# 2. Include all native modules
# 3. Generate an APK you can install
```

### Step 5: Install on Device
Once the build completes, you'll get a download link. Install the APK on your Android device.

### Step 6: Start Development Server
```bash
npx expo start --dev-client
```

---

## Option 2: Prebuild (For Local Native Development)

If you want to work with native code locally:

### Step 1: Generate Native Projects
```bash
npx expo prebuild --clean
```

This creates `android/` and `ios/` directories with native code.

### Step 2: Build for Android
```bash
# Using Android Studio
# 1. Open the android/ folder in Android Studio
# 2. Connect your device
# 3. Click Run

# OR using command line
cd android
./gradlew assembleDebug
```

### Step 3: Install APK
```bash
# The APK will be at:
# android/app/build/outputs/apk/debug/app-debug.apk

# Install via ADB
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### Step 4: Start Metro Bundler
```bash
npx expo start --dev-client
```

---

## Option 3: EAS Build for Production

For production builds:

### Android Production Build
```bash
eas build --profile production --platform android
```

### iOS Production Build (Mac only)
```bash
eas build --profile production --platform ios
```

---

## Troubleshooting Build Issues

### Issue: "react-native-printer-imin doesn't seem to be linked"

**Cause:** You're trying to run in Expo Go, which doesn't support native modules.

**Solution:** Create a development build using one of the options above.

### Issue: "react-native-svg Fabric error"

**Cause:** New architecture enabled but not fully compatible.

**Solution:** Already fixed - `newArchEnabled: false` in app.config.js

### Issue: Build fails with Gradle errors

**Solutions:**
1. Clean Gradle cache:
   ```bash
   cd android
   ./gradlew clean
   ```

2. Delete build folders:
   ```bash
   rm -rf android/build
   rm -rf android/app/build
   ```

3. Rebuild:
   ```bash
   ./gradlew assembleDebug
   ```

### Issue: Metro bundler cache issues

**Solution:**
```bash
# Clear all caches
npx expo start --clear
rm -rf node_modules
npm install
npx expo start --clear
```

---

## Testing the Build

### Verify Native Modules Work

1. **Printer Service**
   - App should initialize printer on startup
   - Check console logs for printer status
   - No errors about "package not linked"

2. **NFC Service**
   - Navigate to NFC payment screen
   - Should initialize without errors
   - Can detect NFC availability

3. **QR Code Generation**
   - Navigate to QR payment screen
   - QR code should render correctly
   - No SVG-related errors

### Test on Physical Device

1. Install the development build APK
2. Connect IMIN printer via USB/Bluetooth
3. Enable NFC in device settings
4. Launch the app
5. Follow MANUAL_TESTING_GUIDE.md

---

## Development Workflow

### After Creating Development Build

1. **Start development server:**
   ```bash
   npx expo start --dev-client
   ```

2. **Make code changes** (JavaScript/TypeScript only)
   - Changes hot reload automatically
   - No need to rebuild

3. **When to rebuild:**
   - Added new native module
   - Changed native configuration
   - Updated app.config.js plugins
   - Modified Android/iOS native code

---

## EAS Build Configuration

Create `eas.json` in project root if it doesn't exist:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

---

## Quick Start for Testing

**Fastest way to test on device:**

```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Login
eas login

# 3. Build development APK
eas build --profile development --platform android

# 4. Download and install APK on device

# 5. Start dev server
npx expo start --dev-client

# 6. Scan QR code with the app
```

---

## Important Notes

### Cannot Use Expo Go ❌
- Expo Go does not support custom native modules
- You must use a development build
- This is a limitation of Expo Go, not our app

### Development Build vs Production Build
- **Development build**: Includes dev tools, connects to Metro bundler
- **Production build**: Optimized, standalone, no dev tools

### Native Module Changes
- JavaScript changes: Hot reload ✅
- Native module changes: Rebuild required ⚠️
- Config changes: Rebuild required ⚠️

---

## Platform-Specific Notes

### Android
- Minimum SDK: 31 (required for NFC)
- IMIN printer requires IMIN hardware
- USB debugging must be enabled
- Install via ADB or direct APK install

### iOS (Future)
- Requires Mac with Xcode
- NFC requires iPhone 7 or later
- Printer support may differ
- TestFlight for distribution

---

## Build Time Estimates

- **EAS Development Build**: 10-15 minutes
- **Local Prebuild + Gradle**: 5-10 minutes
- **Subsequent builds**: 3-5 minutes (cached)

---

## Support

**Build Issues:** See BUILD_TROUBLESHOOTING.md  
**Testing Procedures:** See MANUAL_TESTING_GUIDE.md  
**Quick Reference:** See QUICK_TEST_REFERENCE.md

---

## Summary

✅ **To test payment features, you MUST:**
1. Create a development build (not Expo Go)
2. Install on physical device with IMIN printer
3. Enable NFC in device settings
4. Follow manual testing guide

❌ **Will NOT work:**
- Expo Go app
- iOS Simulator (no NFC)
- Android Emulator (no NFC, no printer)

✅ **Will work:**
- Development build on physical Android device
- Production build on physical Android device
- Device with IMIN printer hardware

---

**Ready to build? Start with Option 1 (EAS Development Build) for fastest results.**

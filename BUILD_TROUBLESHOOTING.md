# Build Troubleshooting Guide

## ⚠️ CRITICAL: Development Build Required

**Error:** `The package 'react-native-printer-imin' doesn't seem to be linked`

### Root Cause
You're trying to run the app in **Expo Go**, which does not support custom native modules like:
- `react-native-printer-imin` (IMIN thermal printer)
- `react-native-nfc-manager` (NFC functionality)

### Solution ✅
You **MUST** create a development build. See **BUILD_INSTRUCTIONS.md** for detailed steps.

**Quick solution:**
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build development APK
eas build --profile development --platform android

# Install APK on device, then start dev server
npx expo start --dev-client
```

---

## Issue: react-native-svg Fabric Architecture Error

### Error Message
```
Unable to resolve "../fabric/TSpanNativeComponent" from "node_modules\react-native-svg\src\elements\TSpan.tsx"
```

### Root Cause
The new React Native architecture (Fabric) was enabled in app.config.js, but `react-native-svg` wasn't properly configured for it. The Fabric native components aren't available in the current setup.

### Solution ✅ FIXED
Disabled the new architecture in `app.config.js`:

```javascript
newArchEnabled: false,  // Changed from true to false
```

### Steps to Resolve Build Issues

1. **Clear Metro Cache**
   ```bash
   npx expo start --clear
   ```

2. **Clear Node Modules (if needed)**
   ```bash
   rm -rf node_modules
   npm install
   ```

3. **Clear Expo Cache (if needed)**
   ```bash
   npx expo start -c
   ```

4. **Reset Metro Bundler**
   - Press `r` in the terminal where Expo is running
   - Or restart the development server

---

## Common Build Issues

### Issue: Module Not Found

**Symptoms:**
```
Unable to resolve module "X" from "Y"
```

**Solutions:**
1. Verify package is installed: `npm list <package-name>`
2. Reinstall dependencies: `npm install`
3. Clear cache: `npx expo start --clear`

### Issue: Native Module Linking

**Symptoms:**
```
Native module cannot be null
```

**Solutions:**
1. For Expo managed workflow, ensure plugin is in app.config.js
2. Rebuild the app: `npx expo prebuild --clean`
3. For bare workflow, run: `npx pod-install` (iOS)

### Issue: TypeScript Errors

**Symptoms:**
```
Type 'X' is not assignable to type 'Y'
```

**Solutions:**
1. Check TypeScript version matches project requirements
2. Clear TypeScript cache: Delete `tsconfig.tsbuildinfo`
3. Restart TypeScript server in IDE

### Issue: Metro Bundler Stuck

**Symptoms:**
- Build hangs at "Bundling..."
- No progress for several minutes

**Solutions:**
1. Kill Metro process: `Ctrl+C`
2. Clear cache: `npx expo start --clear`
3. Check for circular dependencies in imports
4. Restart computer (last resort)

---

## Platform-Specific Issues

### Android

#### Issue: Gradle Build Failed
**Solutions:**
1. Clean Gradle cache: `cd android && ./gradlew clean`
2. Check Android SDK is installed
3. Verify `minSdkVersion` matches requirements (31 for NFC)

#### Issue: IMIN Printer Not Found
**Solutions:**
1. Verify device is IMIN hardware
2. Check USB/Bluetooth connection
3. Ensure printer SDK is compatible with device

### iOS

#### Issue: Pod Install Failed
**Solutions:**
1. Update CocoaPods: `sudo gem install cocoapods`
2. Clean pods: `cd ios && rm -rf Pods && pod install`
3. Check Xcode version compatibility

#### Issue: NFC Not Working
**Solutions:**
1. Verify device supports NFC (iPhone 7+)
2. Check NFC permissions in Info.plist
3. Ensure NFC plugin is configured in app.config.js

---

## Development Server Issues

### Issue: Port Already in Use

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::8081
```

**Solutions:**
1. Kill process on port 8081:
   - Windows: `netstat -ano | findstr :8081` then `taskkill /PID <PID> /F`
   - Mac/Linux: `lsof -ti:8081 | xargs kill -9`
2. Use different port: `npx expo start --port 8082`

### Issue: Cannot Connect to Dev Server

**Solutions:**
1. Ensure device and computer on same network
2. Check firewall settings
3. Try USB connection instead of WiFi
4. Restart Expo Go app

---

## Dependency Issues

### Issue: Peer Dependency Conflicts

**Symptoms:**
```
npm ERR! peer dependency conflict
```

**Solutions:**
1. Use `npm install --legacy-peer-deps`
2. Update conflicting packages
3. Check package.json for version mismatches

### Issue: Package Version Mismatch

**Solutions:**
1. Check Expo SDK compatibility: `npx expo-doctor`
2. Update packages: `npx expo install --fix`
3. Verify React Native version matches Expo SDK

---

## Testing Issues

### Issue: Jest Tests Failing

**Solutions:**
1. Clear Jest cache: `npx jest --clearCache`
2. Check jest.config.js setup
3. Verify test environment matches runtime

### Issue: Mock Not Working

**Solutions:**
1. Check mock is defined before import
2. Verify mock path matches actual module
3. Use `jest.mock()` at top of test file

---

## Quick Fixes Checklist

When encountering build errors, try these in order:

- [ ] Clear Metro cache: `npx expo start --clear`
- [ ] Restart development server
- [ ] Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- [ ] Check app.config.js for correct plugin configuration
- [ ] Verify all required packages are installed
- [ ] Check for TypeScript errors: `npx tsc --noEmit`
- [ ] Run Expo doctor: `npx expo-doctor`
- [ ] Restart IDE/editor
- [ ] Restart computer (if all else fails)

---

## Configuration Verification

### Verify app.config.js

```javascript
export default {
  expo: {
    // ... other config
    newArchEnabled: false,  // ✅ Should be false for current setup
    android: {
      minSdkVersion: 31,    // ✅ Required for NFC
    },
    plugins: [
      "expo-router",
      "react-native-nfc-manager",  // ✅ Required for NFC
      // ... other plugins
    ],
  }
};
```

### Verify package.json Dependencies

```json
{
  "dependencies": {
    "react-native-svg": "^15.15.0",           // ✅ Required for QR codes
    "react-native-qrcode-styled": "^0.4.0",   // ✅ QR code generation
    "react-native-nfc-manager": "^3.17.1",    // ✅ NFC functionality
    "react-native-printer-imin": "^0.10.6",   // ✅ Printer support
    // ... other dependencies
  }
}
```

---

## Getting Help

If issues persist after trying these solutions:

1. **Check Expo Forums**: https://forums.expo.dev/
2. **Check GitHub Issues**: 
   - react-native-svg: https://github.com/software-mansion/react-native-svg/issues
   - react-native-nfc-manager: https://github.com/revtel/react-native-nfc-manager/issues
3. **Expo Discord**: https://chat.expo.dev/
4. **Stack Overflow**: Tag with `expo`, `react-native`

---

## Build Success Checklist

Before considering the build successful:

- [ ] App builds without errors
- [ ] App launches on device/simulator
- [ ] No red screen errors on launch
- [ ] All screens navigate correctly
- [ ] No console errors or warnings (critical ones)
- [ ] Hot reload works
- [ ] TypeScript compilation succeeds

---

**Last Updated:** November 27, 2025  
**Status:** Build issue resolved - newArchEnabled set to false

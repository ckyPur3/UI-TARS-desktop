# Mobile Operators

This guide covers how to use mobile device operators with UI-TARS for controlling Android and iOS devices.

## Overview

UI-TARS supports two mobile platforms:
- **Android** via `@gui-agent/operator-adb` (Android Debug Bridge)
- **iOS** via `@gui-agent/operator-ios` (libimobiledevice)

Both operators provide similar capabilities:
- Screen capture
- Touch and swipe gestures
- Text input
- Hardware button simulation
- Scrolling

## Android Operator

### Prerequisites

Install [Android Debug Bridge (ADB)](https://developer.android.com/tools/adb):

**macOS:**
```bash
brew install android-platform-tools
```

**Linux:**
```bash
sudo apt-get install android-tools-adb
```

**Windows:**
Download from [Android SDK Platform Tools](https://developer.android.com/tools/releases/platform-tools)

### Setup

1. Enable USB Debugging on your Android device
2. Connect device via USB
3. Verify connection: `adb devices`

### Usage

```typescript
import { AdbOperator } from '@gui-agent/operator-adb';

const operator = new AdbOperator('<device-id>');
```

For more details, see [@ui-tars/operator-adb](https://www.npmjs.com/package/@ui-tars/operator-adb)

## iOS Operator

### Prerequisites

Install libimobiledevice tools:

**macOS:**
```bash
brew install libimobiledevice
brew install ideviceinstaller
```

**Linux:**
```bash
sudo apt-get install libimobiledevice-utils
sudo apt-get install ideviceinstaller
```

### Setup

1. Connect iOS device via USB
2. Trust the computer on your device
3. Verify connection: `idevice_id -l`
4. (Optional) Install [WebDriverAgent](https://github.com/appium/WebDriverAgent) for touch support

### Usage

```typescript
import { IosOperator } from '@gui-agent/operator-ios';

// Basic usage (screenshots only)
const operator = new IosOperator('<device-udid>');

// With WebDriverAgent for touch support
const operatorWithTouch = new IosOperator(
  '<device-udid>',
  'http://localhost:8100'
);
```

For detailed setup and troubleshooting, see:
- [iOS Support Documentation](../../../docs/ios-support.md)
- [@ui-tars/operator-ios](https://www.npmjs.com/package/@ui-tars/operator-ios)

## Comparison

| Feature | Android (ADB) | iOS (libimobiledevice) |
|---------|---------------|------------------------|
| Screen Capture | ✅ Native | ✅ Native |
| Touch/Tap | ✅ Native | ⚠️ Requires WDA |
| Swipe/Drag | ✅ Native | ⚠️ Requires WDA |
| Text Input | ✅ Native + ADBKeyboard | ⚠️ Requires WDA |
| Hardware Keys | ✅ Native | ⚠️ Requires WDA |
| Setup Complexity | Low | Medium |
| Connection | USB | USB |

## Example Configurations

### Android with OpenAI

```typescript
import { defineConfig } from '@tarko/agent-cli';
import { AdbOperator } from '@gui-agent/operator-adb';

export default defineConfig({
  operator: new AdbOperator(),
  model: { /* OpenAI config */ },
  // ... other config
});
```

### iOS with Claude

```typescript
import { defineConfig } from '@tarko/agent-cli';
import { IosOperator } from '@gui-agent/operator-ios';

export default defineConfig({
  operator: new IosOperator('<udid>', 'http://localhost:8100'),
  model: { /* Claude config */ },
  // ... other config
});
```

## Supported Actions

Both operators support the same action types:

- `click(start_box)` - Tap at coordinates
- `type(content)` - Type text
- `swipe(start_box, end_box)` - Swipe gesture
- `scroll(start_box, direction)` - Scroll in direction
- `hotkey(key)` - Press hardware key
- `press_home()` - Press home button
- `wait()` - Wait for 2 seconds
- `finished()` - Mark task complete
- `call_user()` - Request user help

## Troubleshooting

### Android

**Device not found:**
```bash
# Check devices
adb devices

# Restart ADB server
adb kill-server
adb start-server
```

**Permission denied:**
```bash
# Check USB debugging is enabled on device
# Revoke USB debugging authorizations and reconnect
```

### iOS

**Device not detected:**
```bash
# List devices
idevice_id -l

# Pair device
idevicepair pair
```

**Touch actions fail:**
- Verify WebDriverAgent is installed and running
- Check WDA URL is correct
- Ensure device is unlocked

For more detailed troubleshooting, see [iOS Support Documentation](../../../docs/ios-support.md)


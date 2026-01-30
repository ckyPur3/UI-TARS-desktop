# iOS Device Support

UI-TARS Desktop now supports controlling iOS devices (iPhone/iPad) through natural language commands, similar to the Android support.

## Overview

The iOS operator allows you to:
- Control your iPhone/iPad from UI-TARS Desktop
- Capture screenshots from iOS devices
- Perform touch, swipe, and scroll gestures
- Type text into iOS applications
- Simulate hardware button presses (home, lock, volume controls)

## Prerequisites

### 1. Install libimobiledevice

**macOS (using Homebrew):**
```bash
brew install libimobiledevice
brew install ideviceinstaller
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install libimobiledevice-utils
sudo apt-get install ideviceinstaller
```

### 2. Connect and Trust Your iOS Device

1. Connect your iPhone/iPad to your computer via USB cable
2. On your iOS device, tap "Trust" when prompted to trust this computer
3. Verify the connection:
   ```bash
   idevice_id -l
   ```
   This should display your device's UDID

### 3. Install WebDriverAgent (Required for Touch/Gestures)

For full functionality including touch, swipe, and text input, you need to install WebDriverAgent on your iOS device.

#### Option A: Using Appium WebDriverAgent (Recommended)

1. Install Xcode from the Mac App Store
2. Clone the WebDriverAgent repository:
   ```bash
   git clone https://github.com/appium/WebDriverAgent.git
   cd WebDriverAgent
   ```

3. Open the project in Xcode:
   ```bash
   open WebDriverAgent.xcodeproj
   ```

4. Configure signing:
   - Select the "WebDriverAgentRunner" target
   - Go to "Signing & Capabilities"
   - Enable "Automatically manage signing"
   - Select your development team

5. Build and install to your device:
   - Select your iOS device as the destination
   - Product → Test (or press ⌘+U)

6. Start the WDA server:
   ```bash
   xcodebuild -project WebDriverAgent.xcodeproj \
     -scheme WebDriverAgentRunner \
     -destination 'id=<YOUR_DEVICE_UDID>' \
     test
   ```

7. The WDA server will start on your device. Note the URL (usually http://localhost:8100)

#### Option B: Using facebook-wda

Alternatively, you can use the [facebook-wda](https://github.com/openatx/facebook-wda) Python library:

```bash
pip install facebook-wda
```

Follow the setup instructions in their repository.

## Usage in UI-TARS Desktop

### Basic Setup

1. Connect your iOS device via USB
2. Ensure the device is unlocked and trusted
3. Start WebDriverAgent on your device (if using touch features)
4. In UI-TARS Desktop, select "iOS Device" as your operator
5. Choose your device from the list if multiple devices are connected

### Example Commands

Once configured, you can use natural language commands like:

- "Open Safari on my iPhone"
- "Tap the search button"
- "Type 'UI-TARS desktop' in the search field"
- "Scroll down the page"
- "Take a screenshot"
- "Press the home button"

### Programmatic Usage

```typescript
import { IosOperator, getIosDeviceId } from '@ui-tars/operator-ios';

// Get connected iOS device
const deviceId = await getIosDeviceId();

if (!deviceId) {
  console.error('No iOS device connected');
  process.exit(1);
}

// Create operator instance
// Optional: Provide WebDriverAgent URL for touch support
const operator = new IosOperator(deviceId, 'http://localhost:8100');

// Take screenshot
const screenshot = await operator.screenshot();
console.log('Screenshot captured:', screenshot.base64.substring(0, 50) + '...');

// Execute touch action
await operator.execute({
  parsedPrediction: {
    action_type: 'click',
    action_inputs: { start_box: '[100, 200, 150, 250]' }
  },
  screenWidth: 390,
  screenHeight: 844
});
```

## Supported Actions

| Action | Description | Requires WDA |
|--------|-------------|--------------|
| `click(start_box)` | Tap at specified coordinates | Yes |
| `type(content)` | Type text | Yes |
| `swipe(start_box, end_box)` | Swipe from start to end | Yes |
| `scroll(start_box, direction)` | Scroll in specified direction | Yes |
| `hotkey(key)` | Press hardware key (home, lock, volume_up, volume_down) | Yes |
| `press_home()` | Press home button | Yes |
| `wait()` | Wait for 2 seconds | No |
| `screenshot()` | Capture screen | No |
| `finished()` | Mark task complete | No |

## Troubleshooting

### Device Not Detected

**Problem:** `idevice_id -l` returns nothing

**Solutions:**
1. Make sure the iOS device is unlocked
2. Check the USB cable connection
3. Tap "Trust" on the iOS device when prompted
4. Try pairing the device:
   ```bash
   idevicepair pair
   ```

### Screenshot Fails

**Problem:** Screenshot capture returns an error

**Solutions:**
1. Ensure the device screen is unlocked
2. Check that libimobiledevice is properly installed:
   ```bash
   idevicescreenshot test.png
   ```
3. If the above command works but UI-TARS doesn't, check file permissions

### Touch/Gestures Don't Work

**Problem:** Touch and swipe actions fail

**Solutions:**
1. Verify WebDriverAgent is installed and running on your device
2. Check the WDA URL is correct (default: http://localhost:8100)
3. Ensure your device is not locked
4. Check WDA logs for errors:
   ```bash
   # In Xcode, view the console output while WDA is running
   ```

### Permission Denied Errors

**Problem:** "Operation not permitted" or similar errors

**Solutions:**
1. On macOS, grant Terminal or your IDE full disk access:
   - System Settings → Privacy & Security → Full Disk Access
2. Make sure you're running as a user with proper permissions
3. Check file permissions on libimobiledevice tools:
   ```bash
   ls -la $(which idevicescreenshot)
   ```

### WebDriverAgent Build Fails

**Problem:** Cannot build WebDriverAgent in Xcode

**Solutions:**
1. Make sure you have a valid Apple Developer account
2. Configure code signing correctly in Xcode
3. Try cleaning the build folder: Product → Clean Build Folder
4. Update to the latest version of Xcode
5. Check [WebDriverAgent's troubleshooting guide](https://github.com/appium/WebDriverAgent)

## Limitations

- **USB Connection Required:** iOS devices must be connected via USB cable. Wireless connection is not currently supported.
- **WebDriverAgent Required for Touch:** Screen capture works without WDA, but touch/swipe/type actions require WDA.
- **Developer Tools:** Some setup requires Xcode and Apple Developer account.
- **iOS Version:** Tested on iOS 14.0 and later. Earlier versions may not be fully supported.
- **No Jailbreak Required:** Works with standard iOS devices, no jailbreak needed.

## Advanced Configuration

### Custom WebDriverAgent Port

If you're using a custom port for WebDriverAgent:

```typescript
const operator = new IosOperator(deviceId, 'http://localhost:9100');
```

### Multiple Devices

When multiple iOS devices are connected, you'll be prompted to select which device to use:

```
? Multiple iOS devices detected. Please choose which device to use:
  ❯ 00008030-001234567890ABCD (iPhone 12)
    00008110-001234567890EFGH (iPad Pro)
```

### Integration with Existing Workflows

The iOS operator follows the same interface as the Android operator, so you can easily switch between them in your automation scripts:

```typescript
import { AdbOperator } from '@ui-tars/operator-adb';
import { IosOperator } from '@ui-tars/operator-ios';

// Determine which platform to use
const isIOS = process.env.TARGET_PLATFORM === 'ios';

const operator = isIOS 
  ? new IosOperator(await getIosDeviceId(), 'http://localhost:8100')
  : new AdbOperator(await getAndroidDeviceId());
```

## Resources

- [libimobiledevice Documentation](https://libimobiledevice.org/)
- [WebDriverAgent Repository](https://github.com/appium/WebDriverAgent)
- [facebook-wda](https://github.com/openatx/facebook-wda)
- [iOS UI Automation Best Practices](https://developer.apple.com/documentation/xctest)

## Contributing

We welcome contributions to improve iOS device support! Please see our [Contributing Guide](../CONTRIBUTING.md) for more information.

## Support

If you encounter issues with iOS device support:

1. Check this troubleshooting guide
2. Search existing [GitHub Issues](https://github.com/bytedance/UI-TARS-desktop/issues)
3. Create a new issue with:
   - Your iOS version
   - Your macOS/Linux version
   - Steps to reproduce the problem
   - Error messages or logs

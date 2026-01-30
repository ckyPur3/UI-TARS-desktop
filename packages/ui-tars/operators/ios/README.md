# @ui-tars/operator-ios

Operator iOS SDK for UI-TARS using libimobiledevice.

## Features

- Screen capture via idevicescreenshot
- Touch and swipe simulation using WebDriverAgent
- Text input support for iOS devices
- Support for various iOS gestures and actions

## Prerequisites

### macOS/Linux Requirements

1. Install libimobiledevice tools:

**macOS (using Homebrew):**

```bash
brew install libimobiledevice
brew install ideviceinstaller
```

**Linux (Ubuntu/Debian):**

```bash
sudo apt-get install libimobiledevice-utils
sudo apt-get install ideviceinstaller
```

2. For iOS device automation, you'll need:
   - An iOS device connected via USB
   - The device must be trusted on your computer
   - For advanced touch/swipe operations, WebDriverAgent should be installed on the device

### WebDriverAgent Setup (Optional but Recommended)

WebDriverAgent (WDA) is required for advanced touch simulation and gestures. Follow these steps:

1. Install [Appium WebDriverAgent](https://github.com/appium/WebDriverAgent) or [facebook-wda](https://github.com/openatx/facebook-wda)
2. Build and deploy WDA to your iOS device
3. Start the WDA server on your device

For detailed setup instructions, visit: https://github.com/appium/WebDriverAgent

## Usage

```typescript
import { IosOperator, getIosDeviceId } from '@ui-tars/operator-ios';

// Get available iOS devices
const deviceId = await getIosDeviceId();

// Create operator instance
const operator = new IosOperator(deviceId);

// Take screenshot
const screenshot = await operator.screenshot();

// Execute actions
await operator.execute({
  parsedPrediction: {
    action_type: 'click',
    action_inputs: { start_box: '[100, 200, 150, 250]' },
  },
  screenWidth: 390,
  screenHeight: 844,
});
```

## Supported Actions

- `click(start_box='[x1, y1, x2, y2]')` - Tap at specified location
- `type(content='text')` - Type text
- `swipe(start_box='[x1, y1, x2, y2]', end_box='[x3, y3, x4, y4]')` - Swipe gesture
- `scroll(start_box='[x1, y1, x2, y2]', direction='up|down|left|right')` - Scroll
- `hotkey(key='home|lock|volume_up|volume_down')` - Press hardware keys
- `wait()` - Wait for 2 seconds
- `press_home()` - Press home button
- `finished()` - Mark task as complete
- `call_user()` - Request user assistance

## Limitations

- Requires physical USB connection to iOS device
- Some advanced gestures require WebDriverAgent
- Screen recording permissions must be granted
- Works best with jailbroken devices or development builds with WDA

## Troubleshooting

### Device not detected

```bash
# Check if device is connected
idevice_id -l

# Pair device if needed
idevicepair pair
```

### Permission issues

- Ensure you've trusted the computer on your iOS device
- Check that Xcode is installed (macOS only)
- Verify libimobiledevice is properly installed

### Screenshot failures

- Make sure the device screen is unlocked
- Check USB connection is stable
- Try running `idevicescreenshot test.png` manually to verify setup

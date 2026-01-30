# Using iOS Device with UI-TARS

This quick guide shows how to get started with controlling your iPhone or iPad using UI-TARS Desktop.

## Quick Start

### 1. Install Prerequisites

**On macOS:**
```bash
# Install libimobiledevice tools
brew install libimobiledevice ideviceinstaller

# (Optional) Install WebDriverAgent for touch support
# See full guide at: https://github.com/appium/WebDriverAgent
```

**On Linux:**
```bash
# Install libimobiledevice tools
sudo apt-get install libimobiledevice-utils ideviceinstaller
```

### 2. Connect Your Device

1. Connect your iPhone/iPad via USB cable
2. Unlock your device and tap "Trust" when prompted
3. Verify connection:
   ```bash
   idevice_id -l
   # Should display your device's UDID, like:
   # 00008030-001234567890ABCD
   ```

### 3. Test Screenshot Capture

```bash
# Test basic screenshot functionality
idevicescreenshot test.png
```

If this works, you can use UI-TARS for screenshot-based operations without WebDriverAgent.

### 4. (Optional) Setup WebDriverAgent

For full touch, swipe, and text input support, install WebDriverAgent:

1. Install Xcode from Mac App Store
2. Clone and build WebDriverAgent:
   ```bash
   git clone https://github.com/appium/WebDriverAgent.git
   cd WebDriverAgent
   open WebDriverAgent.xcodeproj
   ```
3. Configure code signing in Xcode
4. Build and run on your device (Product → Test or ⌘+U)
5. Note the WDA URL (usually `http://localhost:8100`)

## Using with UI-TARS SDK

### Basic Usage (Screenshots Only)

```typescript
import { IosOperator, getIosDeviceId } from '@ui-tars/operator-ios';
import { GUIAgent } from '@ui-tars/sdk';

// Get connected iOS device
const deviceId = await getIosDeviceId();

// Create operator
const operator = new IosOperator(deviceId);

// Create agent
const agent = new GUIAgent({
  operator,
  model: yourModelConfig,
});

// Run tasks (screenshot-based only)
await agent.run('Show me the home screen');
```

### Full Features with WebDriverAgent

```typescript
import { IosOperator, getIosDeviceId } from '@ui-tars/operator-ios';
import { GUIAgent } from '@ui-tars/sdk';

// Get device and create operator with WDA support
const deviceId = await getIosDeviceId();
const operator = new IosOperator(deviceId, 'http://localhost:8100');

// Create agent
const agent = new GUIAgent({
  operator,
  model: yourModelConfig,
});

// Run tasks with full touch support
await agent.run('Open Settings and enable WiFi');
await agent.run('Add a new contact named John Doe with phone 555-1234');
await agent.run('Search for UI-TARS in Safari');
```

## Example Tasks

Once set up, you can ask UI-TARS to perform tasks like:

**Basic Navigation:**
- "Open the Settings app"
- "Go to the home screen"
- "Scroll down to see more apps"

**Common Tasks:**
- "Check the current weather"
- "Add a reminder for tomorrow at 9 AM"
- "Set an alarm for 7:00 AM"
- "Check my battery percentage"

**Advanced Tasks:**
- "Search for 'UI-TARS Desktop' in Safari and open the first result"
- "Add a new contact with name Sarah and phone number 555-5678"
- "Take a screenshot and send it via Messages to John"

## Troubleshooting

### "No iOS device found"

**Solution:**
```bash
# Check device connection
idevice_id -l

# If empty, try pairing
idevicepair pair
```

### "Permission denied" errors

**Solution:**
- Unlock your iOS device
- Tap "Trust" when prompted
- Make sure USB cable is properly connected

### Touch/Type actions don't work

**Solution:**
- Verify WebDriverAgent is installed and running
- Check WDA URL is correct (usually `http://localhost:8100`)
- Make sure device is unlocked

### Screenshot capture fails

**Solution:**
```bash
# Test manually first
idevicescreenshot test.png

# If this fails, reinstall libimobiledevice
brew reinstall libimobiledevice  # macOS
# or
sudo apt-get reinstall libimobiledevice-utils  # Linux
```

## What's Supported

| Feature | Without WDA | With WDA |
|---------|-------------|----------|
| Screenshots | ✅ | ✅ |
| View-only tasks | ✅ | ✅ |
| Tap/Touch | ❌ | ✅ |
| Swipe/Scroll | ❌ | ✅ |
| Type text | ❌ | ✅ |
| Hardware buttons | ❌ | ✅ |

## Next Steps

- See [Full iOS Support Documentation](./ios-support.md) for detailed setup
- Check out [iOS Examples](../multimodal/gui-agent/agent-sdk/examples/configs/) for config files
- Join our [Discord](https://discord.gg/pTXwYVjfcs) for help and discussion

## Limitations

- **USB Only:** Wireless connection not currently supported
- **macOS/Linux:** Windows support requires WSL or alternative tools
- **Developer Setup:** WebDriverAgent requires Xcode and Apple Developer account
- **iOS 14+:** Tested on iOS 14.0 and later versions

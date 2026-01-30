/*
 * Copyright (c) 2025 Bytedance, Inc. and its affiliates.
 * SPDX-License-Identifier: Apache-2.0
 */
import {
  Operator,
  useContext,
  parseBoxToScreenCoords,
  type ScreenshotOutput,
  type ExecuteParams,
  type ExecuteOutput,
  StatusEnum,
} from '@ui-tars/sdk/core';
import { command } from 'execa';
import inquirer from 'inquirer';
import { writeFileSync, readFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

function commandWithTimeout(cmd: string, timeout = 5000) {
  return command(cmd, { timeout });
}

/**
 * Get iOS device UDID
 * @returns The device UDID or null if no devices found
 */
export async function getIosDeviceId(): Promise<string | null> {
  try {
    const getDevices = await commandWithTimeout('idevice_id -l').catch(() => ({
      stdout: '',
    }));

    const devices = getDevices.stdout
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    if (devices.length === 0) {
      return null;
    }

    // If multiple devices, prompt user to select one
    return devices.length > 1
      ? (
          await inquirer.prompt([
            {
              type: 'list',
              name: 'device',
              message:
                'Multiple iOS devices detected. Please choose which device to use:',
              choices: devices,
              default: devices[0],
            },
          ])
        ).device
      : devices[0];
  } catch (error) {
    console.error('Failed to get iOS devices:', error);
    return null;
  }
}

/**
 * iOS Operator class for controlling iOS devices using libimobiledevice
 */
export class IosOperator extends Operator {
  static MANUAL = {
    ACTION_SPACES: [
      `click(start_box='[x1, y1, x2, y2]')`,
      `type(content='')`,
      `swipe(start_box='[x1, y1, x2, y2]', end_box='[x3, y3, x4, y4]')`,
      `scroll(start_box='[x1, y1, x2, y2]', direction='down or up or right or left') # You must specify the start_box`,
      `hotkey(key='') # Available keys: home, lock, volume_up, volume_down`,
      `wait() # Sleep for 2s and take a screenshot to check for any changes`,
      `press_home() # Press the home button`,
      `finished()`,
      `call_user() # Submit the task and call the user when the task is unsolvable, or when you need the user's help`,
    ],
  };

  private deviceId: string;
  private currentRound = 0;
  private wdaUrl: string | null = null;

  constructor(deviceId: string, wdaUrl?: string) {
    super();
    this.deviceId = deviceId;
    // WebDriverAgent URL for advanced interactions (optional)
    this.wdaUrl = wdaUrl || null;
  }

  /**
   * Capture screenshot from iOS device
   */
  public async screenshot(): Promise<ScreenshotOutput> {
    const { logger } = useContext();
    this.currentRound++;

    try {
      // Create temporary file for screenshot
      const tempFile = join(tmpdir(), `ios-screenshot-${Date.now()}.png`);

      // Capture screenshot using idevicescreenshot
      await commandWithTimeout(
        `idevicescreenshot -u ${this.deviceId} ${tempFile}`,
        10000,
      );

      // Read screenshot and convert to base64
      const buffer = readFileSync(tempFile);
      const base64 = buffer.toString('base64');

      // Clean up temporary file
      try {
        unlinkSync(tempFile);
      } catch (error) {
        logger.warn('[IosOperator] Failed to delete temp file:', error);
      }

      return {
        base64,
        scaleFactor: 1,
      };
    } catch (error) {
      logger.error('[IosOperator] Screenshot error:', error);
      throw new Error(`Failed to capture iOS screenshot: ${error}`);
    }
  }

  /**
   * Execute action on iOS device
   */
  async execute(params: ExecuteParams): Promise<ExecuteOutput> {
    const { logger } = useContext();
    const { parsedPrediction, screenWidth, screenHeight } = params;
    const { action_type, action_inputs } = parsedPrediction;
    const startBoxStr = action_inputs?.start_box || '';

    const { x: startX, y: startY } = parseBoxToScreenCoords({
      boxStr: startBoxStr,
      screenWidth,
      screenHeight,
    });

    try {
      switch (action_type) {
        case 'click':
        case 'tap':
          if (startX !== null && startY !== null) {
            if (this.wdaUrl) {
              // Use WebDriverAgent for precise tapping
              await this.wdaTap(startX, startY);
            } else {
              // Fallback: Log warning that WDA is needed for touch
              logger.warn(
                '[IosOperator] WebDriverAgent is not configured. Touch simulation requires WDA.',
              );
              logger.info(
                `[IosOperator] Would tap at coordinates: (${Math.round(startX)}, ${Math.round(startY)})`,
              );
              return { status: StatusEnum.ERROR } as ExecuteOutput;
            }
          }
          break;

        case 'type':
          const content = action_inputs.content?.trim();
          if (content) {
            if (this.wdaUrl) {
              await this.wdaType(content);
            } else {
              logger.warn(
                '[IosOperator] WebDriverAgent is required for text input on iOS devices.',
              );
              logger.info(`[IosOperator] Would type: "${content}"`);
              return { status: StatusEnum.ERROR } as ExecuteOutput;
            }
          }
          break;

        case 'swipe':
        case 'drag':
          const { end_box } = action_inputs;
          if (end_box) {
            const { x: endX, y: endY } = parseBoxToScreenCoords({
              boxStr: end_box,
              screenWidth,
              screenHeight,
            });
            if (
              startX !== null &&
              startY !== null &&
              endX !== null &&
              endY !== null
            ) {
              if (this.wdaUrl) {
                await this.wdaSwipe(startX, startY, endX, endY);
              } else {
                logger.warn(
                  '[IosOperator] WebDriverAgent is required for swipe gestures.',
                );
                logger.info(
                  `[IosOperator] Would swipe from (${Math.round(startX)}, ${Math.round(startY)}) to (${Math.round(endX)}, ${Math.round(endY)})`,
                );
                return { status: StatusEnum.ERROR } as ExecuteOutput;
              }
            }
          }
          break;

        case 'scroll':
          const { direction } = action_inputs;
          if (startX == null || startY == null) {
            throw new Error('The start_box is required for scroll action.');
          }

          let endX = startX;
          let endY = startY;
          const scrollDistance = 100;

          switch (direction) {
            case 'up':
              endY = startY - scrollDistance;
              break;
            case 'down':
              endY = startY + scrollDistance;
              break;
            case 'left':
              endX = startX - scrollDistance;
              break;
            case 'right':
              endX = startX + scrollDistance;
              break;
          }

          if (this.wdaUrl) {
            await this.wdaSwipe(startX, startY, endX, endY);
          } else {
            logger.warn(
              '[IosOperator] WebDriverAgent is required for scroll gestures.',
            );
            return { status: StatusEnum.ERROR } as ExecuteOutput;
          }
          break;

        case 'press_home':
        case 'home':
          // Press home button using simulated key event
          if (this.wdaUrl) {
            await this.wdaPressButton('home');
          } else {
            logger.warn(
              '[IosOperator] WebDriverAgent is required for home button press.',
            );
            logger.info('[IosOperator] Would press home button');
            return { status: StatusEnum.ERROR } as ExecuteOutput;
          }
          break;

        case 'hotkey':
          const { key } = action_inputs;
          if (this.wdaUrl) {
            await this.wdaPressButton(key);
          } else {
            logger.warn(
              '[IosOperator] WebDriverAgent is required for hardware key simulation.',
            );
            logger.info(`[IosOperator] Would press key: ${key}`);
            return { status: StatusEnum.ERROR } as ExecuteOutput;
          }
          break;

        case 'wait':
          await new Promise((resolve) => setTimeout(resolve, 2000));
          break;

        default:
          logger.warn(`[IosOperator] Unsupported action: ${action_type}`);
          break;
      }

      return { status: StatusEnum.SUCCESS } as ExecuteOutput;
    } catch (error) {
      logger.error('[IosOperator] Error:', error);
      throw error;
    }
  }

  /**
   * Perform tap action using WebDriverAgent
   */
  private async wdaTap(x: number, y: number): Promise<void> {
    if (!this.wdaUrl) {
      throw new Error('WebDriverAgent URL is not configured');
    }

    const response = await fetch(`${this.wdaUrl}/session/tap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ x: Math.round(x), y: Math.round(y) }),
    });

    if (!response.ok) {
      throw new Error(`WDA tap failed: ${response.statusText}`);
    }
  }

  /**
   * Type text using WebDriverAgent
   */
  private async wdaType(text: string): Promise<void> {
    if (!this.wdaUrl) {
      throw new Error('WebDriverAgent URL is not configured');
    }

    const response = await fetch(`${this.wdaUrl}/session/keys`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: [text] }),
    });

    if (!response.ok) {
      throw new Error(`WDA type failed: ${response.statusText}`);
    }
  }

  /**
   * Perform swipe gesture using WebDriverAgent
   */
  private async wdaSwipe(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
  ): Promise<void> {
    if (!this.wdaUrl) {
      throw new Error('WebDriverAgent URL is not configured');
    }

    const response = await fetch(`${this.wdaUrl}/session/touch/perform`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        actions: [
          {
            action: 'press',
            options: { x: Math.round(fromX), y: Math.round(fromY) },
          },
          { action: 'wait', options: { ms: 300 } },
          {
            action: 'moveTo',
            options: { x: Math.round(toX), y: Math.round(toY) },
          },
          { action: 'release' },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`WDA swipe failed: ${response.statusText}`);
    }
  }

  /**
   * Press hardware button using WebDriverAgent
   */
  private async wdaPressButton(button: string): Promise<void> {
    if (!this.wdaUrl) {
      throw new Error('WebDriverAgent URL is not configured');
    }

    // Map button names to WDA button names
    const buttonMap: Record<string, string> = {
      home: 'home',
      lock: 'power',
      volume_up: 'volumeUp',
      volume_down: 'volumeDown',
    };

    const wdaButton = buttonMap[button] || button;

    const response = await fetch(`${this.wdaUrl}/session/wda/pressButton`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: wdaButton }),
    });

    if (!response.ok) {
      throw new Error(`WDA button press failed: ${response.statusText}`);
    }
  }
}

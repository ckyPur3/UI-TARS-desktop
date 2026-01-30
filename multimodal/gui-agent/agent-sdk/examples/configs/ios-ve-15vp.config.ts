/*
 * Copyright (c) 2025 Bytedance, Inc. and its affiliates.
 * SPDX-License-Identifier: Apache-2.0
 */
import 'dotenv/config';
import path from 'path';
import { defineConfig } from '@tarko/agent-cli';
import { SYSTEM_PROMPT_2 } from './prompts';
import { iosOperator } from './operators';
import { model_ve_doubao_1_5_thinking_vision_pro } from './models';

export default defineConfig({
  operator: iosOperator,
  model: model_ve_doubao_1_5_thinking_vision_pro,
  systemPrompt: SYSTEM_PROMPT_2,
  snapshot: {
    enable: true,
    storageDirectory: path.join(__dirname, '../snapshots/ios-ve-15vp'),
  },
  webui: {
    logo: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/zyha-aulnh/ljhwZthlaukjlkulzlp/icon.png',
    title: 'GUI Agent - iOS (Doubao 1.5 Vision Pro)',
    subtitle: 'iOS mobile GUI agent powered by Doubao 1.5 Vision Pro',
    welcomTitle: 'iOS GUI Agent with Doubao',
    welcomePrompts: [
      'Check the weather in New York',
      'Add Sarah: 555-1234 to contacts',
      'What is Agent TARS',
      'Set an alarm for 7:00 AM',
      'Check the iOS version',
    ],
    guiAgent: {
      defaultScreenshotRenderStrategy: 'afterAction',
      enableScreenshotRenderStrategySwitch: true,
      renderGUIAction: true,
      renderBrowserShell: false,
    },
  },
});

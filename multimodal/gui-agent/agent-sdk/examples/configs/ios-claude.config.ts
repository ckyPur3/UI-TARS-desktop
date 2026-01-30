/*
 * Copyright (c) 2025 Bytedance, Inc. and its affiliates.
 * SPDX-License-Identifier: Apache-2.0
 */
import 'dotenv/config';
import path from 'path';
import { defineConfig } from '@tarko/agent-cli';
import { SYSTEM_PROMPT_2 } from './prompts';
import { iosOperator } from './operators';
import { model_claude } from './models';

export default defineConfig({
  operator: iosOperator,
  model: model_claude,
  systemPrompt: SYSTEM_PROMPT_2,
  snapshot: {
    enable: true,
    storageDirectory: path.join(__dirname, '../snapshots/ios-claude'),
  },
  webui: {
    logo: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/zyha-aulnh/ljhwZthlaukjlkulzlp/icon.png',
    title: 'GUI Agent - iOS (Claude)',
    subtitle: 'iOS mobile GUI agent powered by Anthropic Claude',
    welcomTitle: 'iOS GUI Agent with Claude',
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

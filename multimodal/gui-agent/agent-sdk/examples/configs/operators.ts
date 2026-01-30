/*
 * Copyright (c) 2025 Bytedance, Inc. and its affiliates.
 * SPDX-License-Identifier: Apache-2.0
 */
import { AdbOperator } from '@gui-agent/operator-adb';
import { IosOperator } from '@gui-agent/operator-ios';
import { NutJSOperator } from '@gui-agent/operator-nutjs';
import {
  LocalBrowserOperator,
  RemoteBrowserOperator,
  SearchEngine,
} from '@gui-agent/operator-browser';

const computerOperator = new NutJSOperator();
const androidOperator = new AdbOperator();
const iosOperator = new IosOperator('<device-udid>', 'http://localhost:8100');
const browserOperator = new LocalBrowserOperator({
  searchEngine: SearchEngine.GOOGLE,
  showActionInfo: false,
  showWaterFlow: false,
  highlightClickableElements: false,
});

const remoteBrowserOperator = new RemoteBrowserOperator({
  wsEndpoint: 'ws://localhost:9222/devtools/browser/<id>',
  searchEngine: SearchEngine.GOOGLE,
  showActionInfo: true,
  showWaterFlow: true,
  highlightClickableElements: true,
});

export { computerOperator, androidOperator, iosOperator, browserOperator, remoteBrowserOperator };

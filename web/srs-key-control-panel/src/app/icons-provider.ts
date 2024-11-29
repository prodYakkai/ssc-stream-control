/*
 * File: icons-provider.ts
 * Project: srs-key-control-panel
 * -----
 * Copyright (C) 2024 Shengming Yuan - All rights reserved.
 * 
 * You may use, distribute and modify this code under the terms of the Apache License 2.0 license.
 * 
 * You should have received a copy of the Apache License 2.0 License along with this program.
 * If not, see https://www.apache.org/licenses/LICENSE-2.0.
 * 
 */

import { EnvironmentProviders, importProvidersFrom } from '@angular/core';
import {
  MenuFoldOutline,
  MenuUnfoldOutline,
  FormOutline,
  DashboardOutline,
  UserOutline,
  SettingOutline,
  KeyOutline,
  LogoutOutline,
  VideoCameraOutline,
  ToolOutline,
  DatabaseOutline,
  ProjectOutline,
  PullRequestOutline,
  ArrowLeftOutline,
} from '@ant-design/icons-angular/icons';
import { NzIconModule } from 'ng-zorro-antd/icon';

const icons = [
  MenuFoldOutline,
  MenuUnfoldOutline,
  DashboardOutline,
  FormOutline,
  UserOutline,
  SettingOutline,
  LogoutOutline,
  ToolOutline,
  VideoCameraOutline,
  DatabaseOutline,
  ProjectOutline,
  PullRequestOutline,
  KeyOutline,
  ArrowLeftOutline,
];

export function provideNzIcons(): EnvironmentProviders {
  return importProvidersFrom(NzIconModule.forRoot(icons));
}

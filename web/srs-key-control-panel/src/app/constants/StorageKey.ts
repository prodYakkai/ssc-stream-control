/*
 * File: StorageKey.ts
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

export interface LocalStorageTableSettings {
    EnableAutoUpdate: string;
    EnableRevokeKey: string;
}

export interface TableSettings {
    enableRevokeKey: boolean;
}

export interface LocalStorageKeyStruct {
    LastGeneratedMasterSheet: string;
    TableSettings: LocalStorageTableSettings;
    PreviewKeyValidTime: string;
    ClearKeyGenModalAfterCreate: string;
    LoginToken: string;
    CurrentEventId: string;
    RefreshToken: string;
}

export const LocalStorageKey: LocalStorageKeyStruct = {
    LastGeneratedMasterSheet: 'lastGeneratedMasterSheet',
    TableSettings: {
        EnableAutoUpdate: 'enableAutoUpdate',
        EnableRevokeKey: 'enableRevokedKey',
    },
    PreviewKeyValidTime: 'previewKeyValidTime',
    ClearKeyGenModalAfterCreate: 'clearKeyGenModalAfterCreate',
    LoginToken: 'loginToken',
    RefreshToken: 'refreshToken',
    CurrentEventId: 'currentEventId',
};

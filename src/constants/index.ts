/*
 * File: index.ts
 * -----
 * Copyright (C) 2024 Shengming Yuan - All rights reserved.
 * 
 * You may use, distribute and modify this code under the terms of the Apache License 2.0 license.
 * 
 * You should have received a copy of the Apache License 2.0 License along with this program.
 * If not, see https://www.apache.org/licenses/LICENSE-2.0.
 * 
 */

export const PlayerHost = 'https://play.offkai.tech';

export const MasterSheetShareList = [
    {
        name: 'AV Group',
        email: 'av@offkaiexpo.com',
        isGroup: true,
        role: 'reader',
    },
    {
        name: 'IT Group',
        email: 'it@offkaiexpo.com',
        isGroup: true,
        role: 'reader',
    },
];

export const REDACTED = '[REDACTED]';

export const GoogleAuthScopes = [
    'https://apps-apis.google.com/a/feeds/groups/',
    'https://www.googleapis.com/auth/groups',
    'https://www.googleapis.com/auth/admin.directory.group',
    'openid',
    'profile',
    'email'
];

export const OpenIDEndpoint = {
    authorization_endpoint: 'https://sso.offkaiexpo.com/application/o/authorize/',
    token_endpoint: 'https://sso.offkaiexpo.com/application/o/token/',
    userinfo_endpoint: 'https://sso.offkaiexpo.com/application/o/userinfo/',
};

export const CORS_ORIGIN_DEV = [
    'http://localhost:4200',
    'http://localhost:5200',
];

export const CORS_ORIGIN_PROD = [
    'https://keypanel.offkai.tech',
    'https://play.offkai.tech',
];
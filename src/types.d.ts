/*
 * File: types.d.ts
 * -----
 * Copyright (C) 2024 Shengming Yuan - All rights reserved.
 * 
 * You may use, distribute and modify this code under the terms of the Apache License 2.0 license.
 * 
 * You should have received a copy of the Apache License 2.0 License along with this program.
 * If not, see https://www.apache.org/licenses/LICENSE-2.0.
 * 
 */

import { oauth2_v2 } from 'googleapis';

interface ExtendedUserInfo extends oauth2_v2.Schema$Userinfo {
  isAdmin: boolean;
}

declare module 'http' {
  interface IncomingMessage {
    rawBody: Buffer;
  }
}

declare module 'express-serve-static-core' {
  interface Request {
    // query where only string values are present (the rest are removed)
    stringQuery: { [key: string]: string };
    booleanQuery: { [key: string]: boolean };
  }
}

declare module 'express-session' {
    interface SessionData {
        state: string;
        user: ExtendedUserInfo;
    }
}

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

interface UserInfo {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

declare module 'http' {
  interface IncomingMessage {
    rawBody: Buffer;
  }
}

// declare module 'express-serve-static-core' {
//   interface Request {
//     // query where only string values are present (the rest are removed)
//     stringQuery: { [key: string]: string };
//     booleanQuery: { [key: string]: boolean };
//   }
// }

declare global {
  namespace Express {
    interface User extends UserInfo {
    }
    interface Request {
      user?: UserInfo;
    }
  }
}

export interface OpenIDProfile {
  iss: string
  sub: string
  aud: string
  exp: number
  iat: number
  auth_time: number
  acr: string
  email: string
  email_verified: boolean
  name: string
  given_name: string
  preferred_username: string
  nickname: string
  groups: string[]
}

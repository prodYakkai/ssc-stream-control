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

import { config as initEnv } from 'dotenv';
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();
initEnv();

import express, { NextFunction, Request, Response } from 'express';
import logger from 'morgan';
import cors from 'cors';
import proxy from 'express-http-proxy';
import baseRouter from './routes';
import { GoogleAuth, OAuth2Client as GoogleOAuthClient } from 'google-auth-library';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from './middlewares/guard';

export const app = express();
export const srsApiAuthToken = Buffer.from(
  `apiuser:${process.env.SRS_API_TOKEN || ''}`,
).toString('base64');
export const serviceAccountGAuth = new GoogleAuth({
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/groups'
  ],
});
export const prisma = new PrismaClient();
export const gAuthClient = new GoogleOAuthClient();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(
  '/srs-proxy',
  requireAuth,
  proxy(process.env.SRS_API_ENDPOINT || '', {
    filter: function (req, _) {
      void _;
      return req.method == 'GET'; // only allow GET requests, any other request need to go thru the app
    },
    proxyReqPathResolver: function (req) {
      return `/api/v1${req.url}`; // proxy to /api/v1/xxx
    },
    proxyReqOptDecorator: function (proxyReqOpts, _) {
      void _;
      // @ts-expect-error ts is weird, just inject the authorization header
      proxyReqOpts.headers['Authorization'] = `Basic ${srsApiAuthToken}`;
      return proxyReqOpts;
    },
  }),
);
app.use(baseRouter);

// error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  // No routes handled the request and no system error, that means 404 issue.
  // Forward to next middleware to handle it.
  if (!err) return next();

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // respond with error
  res.status(500);
  res.json({
    message: err.message,
    code: -1,
  });
});

app.listen(process.env.PORT || 3005, async () => {
  await prisma.$connect();
  console.log(`🚀 Server ready at: http://localhost:${process.env.PORT || 3005}
⭐️ Happy coding!`);
});

process.on('exit', async () => {
  console.log('Cleaning up...');
  await prisma.$disconnect();
});
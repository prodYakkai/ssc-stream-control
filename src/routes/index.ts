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

import { Router } from 'express';
import webhookRouter from './webhook';
import streamRouter from './stream';
import feedRouter from './feed';
import { requireAuth } from '../middlewares/guard';
import batchRouter from './batch';
import categoryRouter from './category';
import eventRouter from './event';
import authRouter from './auth';
import userRouter from './user';

const baseRouter = Router();

baseRouter.get('/ping', (_, res) => {
    res.send('pong');
});
baseRouter.use('/auth', authRouter);
baseRouter.use('/hook', webhookRouter);
baseRouter.use('/stream', [requireAuth], streamRouter);
baseRouter.use('/category', [requireAuth], categoryRouter);
baseRouter.use('/event', [requireAuth], eventRouter);
baseRouter.use('/feed', feedRouter);
baseRouter.use('/batch', [requireAuth], batchRouter);
baseRouter.use('/user', [requireAuth], userRouter);

export default baseRouter;
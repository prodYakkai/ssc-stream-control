/*
 * File: guard.ts
 * -----
 * Copyright (C) 2024 Shengming Yuan - All rights reserved.
 * 
 * You may use, distribute and modify this code under the terms of the Apache License 2.0 license.
 * 
 * You should have received a copy of the Apache License 2.0 License along with this program.
 * If not, see https://www.apache.org/licenses/LICENSE-2.0.
 * 
 */

import { NextFunction, Request, Response } from 'express';

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.session.user === undefined) {
            reject(res);
            return;
        }

        next();
    } catch (e) {
        console.error(e);
        reject(res);
        return;
    }

}

export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try{
        if (req.session.user === undefined) {
            reject(res);
            return;
        }

        if (!req.session.user.isAdmin) {
            reject(res);
            return;
        }

        next();
    } catch (e) {
        console.error(e);
        reject(res);
        return;
    }

}

export const guardSRSWebhook = (req: Request, res: Response, next: NextFunction) => {    
    const { key } = req.query;
    if (key === undefined) {
        reject(res);
        return;
    }

    if (key !== process.env.SRS_WEBHOOK_KEY) {
        reject(res);
        return;
    }
    next();
}

const reject = (res: Response) => {
    res.status(401).json({
        code: -401,
        message: 'Unauthorized'
    });
}
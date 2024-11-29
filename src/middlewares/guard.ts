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
import { gAuthClient, prisma } from '..';
import { ExtendedTokenPayload } from '../types';

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    if (req.headers.authorization === undefined) {
        reject(res);
        return;
    }
    try {
        const ticket = await gAuthClient.verifyIdToken({
            idToken: req.headers.authorization.split(' ')[1],
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const googlePayload = ticket.getPayload();
        // console.log(payload);
        if (googlePayload === undefined) {
            reject(res);
            return;
        }
    
        const email = googlePayload.email;
        if (email === undefined) {
            reject(res);
            return;
        }

        const userData = await prisma.user.findUnique({
            where: {
                email: googlePayload.email,
                disabled: false
            },
            select: {
                email: true,
                thirdPartyId: true,
                admin: true
            }
        });

        if (userData === null) {
            reject(res);
            return;
        }

        const payload: ExtendedTokenPayload = {
            ...googlePayload,
            isAdmin: userData.admin || false
        };
    
        // @ts-expect-error ts... what can I say...
        (req as unknown).user = payload;
        next();
    } catch (e) {
        console.error(e);
        reject(res);
        return;
    }

}

export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try{
        if (req.user === undefined) {
            reject(res);
            return;
        }

        if (!req.user.isAdmin) {
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
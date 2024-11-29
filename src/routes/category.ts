/*
 * File: category.ts
 * Project: srs-key-control
 * -----
 * Copyright (C) 2024 Shengming Yuan - All rights reserved.
 * 
 * You may use, distribute and modify this code under the terms of the Apache License 2.0 license.
 * 
 * You should have received a copy of the Apache License 2.0 License along with this program.
 * If not, see https://www.apache.org/licenses/LICENSE-2.0.
 * 
 */

import { Router, Request, Response } from 'express';
import { prisma } from '..';

const categoryRouter = Router();

// create a new category
categoryRouter.post('/', async (req: Request, res: Response) => {
    const { name, eventId } = req.body;
    const category = await prisma.category.create({
        data: {
            name,
            event: {
                connect: {
                    id: eventId
                }
            }
        },
    });
    res.json({
        code:0,
        data: category
    });
});

// get all categories
categoryRouter.get('/event/:eventId', async (req: Request, res: Response) => {
    const { eventId } = req.params;
    const categories = await prisma.category.findMany({
        where: {
            eventId: eventId as string
        }
    });
    res.json({
        code:0,
        data: categories
    });
});

// get a single category
categoryRouter.get('/event/:eventId/:id', async (req: Request, res: Response) => {
    const { id, eventId } = req.params;
    const category = await prisma.category.findUnique({
        where: {
            id,
            eventId
        }
    });
    res.json({
        code:0,
        data: category
    });
});


// update a category
categoryRouter.put('/event/:eventId/:id', async (req: Request, res: Response) => {
    const { id,eventId } = req.params;
    const { name } = req.body;
    const category = await prisma.category.update({
        where: {
            id,
            eventId
        },
        data: {
            name
        }
    });
    res.json({
        code:0,
        data: category
    });
});

// delete a category
categoryRouter.delete('/event/:eventId/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    await prisma.category.deleteMany({
        where: {
            id,
        }
    });
    res.json({
        code:0,
        data: 'Deleted'
    });
});

export default categoryRouter;
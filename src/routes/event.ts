/*
 * File: event.ts
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

const eventRouter = Router();

// create a new event
eventRouter.post('/', async (req: Request, res: Response) => {
    const { name, description } = req.body;
    const event = await prisma.event.create({
        data: {
            name,
            description
        }
    });
    res.json({
        code:0,
        data: event
    });
});

eventRouter.post('/:eventId/destination', async (req: Request, res: Response) => {
    const { eventId } = req.params;
    const { name, description } = req.body;
    const destination = await prisma.reservedDestination.create({
        data: {
            name,
            description,
            event: {
                connect: {
                    id: eventId
                }
            }
        },
    });
    res.json({
        code:0,
        data: destination
    });
});

// get all events
eventRouter.get('/', async (req: Request, res: Response) => {
    const events = await prisma.event.findMany({
       include: {
            streams: {
                select: {
                    _count: true
                }
            },
            categories: {
                select: {
                    _count: true
                }
            }
       } 
    });
    res.json({
        code:0,
        data: events
    });
});

// get all events custom destination
eventRouter.get('/:id/destination', async (req: Request, res: Response) => {
    const destinations = await prisma.reservedDestination.findMany({
        include: {
            stream: {
                include: {
                    category: true
                }
            }
        }
    });
    res.json({
        code:0,
        data: destinations
    });
});


// get a single event
eventRouter.get('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const event = await prisma.event.findUnique({
        where: {
            id
        }
    });
    res.json({
        code:0,
        data: event
    });
});

eventRouter.get('/:eventId/destination/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const destination = await prisma.reservedDestination.findUnique({
        where: {
            id
        }
    });
    res.json({
        code:0,
        data: destination
    });
});

// update an event
eventRouter.put('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description } = req.body;
    const event = await prisma.event.update({
        where: {
            id
        },
        data: {
            name,
            description
        }
    });
    res.json({
        code:0,
        data: event
    });
});

// update an destination
eventRouter.put('/:eventId/destination/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description } = req.body;
    const destination = await prisma.reservedDestination.update({
        where: {
            id
        },
        data: {
            name,
            description
        }
    });
    res.json({
        code:0,
        data: destination
    });
});

// archive an event
eventRouter.delete('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { remove } = req.query;

    if (remove) {
        const doc = await prisma.event.delete({
            where: {
                id
            }
        });
        res.json({
            code:0,
            data: doc
        });
        return;
    }
    
    const doc = await prisma.event.update({
        where: {
            id
        },
        data: {
            archived: true
        }
    });
    res.json({
        code:0,
        data: doc
    });
});

// delete an destination
eventRouter.delete('/:eventId/destination/:id', async (req: Request, res: Response) => {
    const { id } = req.params;

    const doc = await prisma.reservedDestination.delete({
        where: {
            id
        }
    });
    res.json({
        code:0,
        data: doc
    });
});


export default eventRouter;
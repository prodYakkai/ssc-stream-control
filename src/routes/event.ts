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

import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '..';
import resWrap from '../utils/responseWrapper';
import { DestinationWithStreamAndCategory } from '../types/StreamObj';

const eventRouter = Router();

const ensureEventId = (req: Request, res: Response, next: NextFunction) => {
    const { eventId } = req.params;
    if (!eventId) {
        res.status(400).json(resWrap({}, 1, 'Event ID is required'));
        return;
    }
    next();
}

// create a new event
eventRouter.post('/', async (req: Request, res: Response) => {
    const { name, description } = req.body;
    const event = await prisma.event.create({
        data: {
            name,
            description,
            branding: {
                create: {

                }
            },
            promos: {
                create: {

                }
            }
        }
    });
    res.json({
        code:0,
        data: event
    });
});

eventRouter.post('/:eventId/destination', ensureEventId, async (req: Request, res: Response) => {
    const { eventId } = req.params;
    const { name, description } = req.body;
    if (!name) {
        res.status(400).json(resWrap({}, 1, 'Name is required'));
        return;
    }
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
eventRouter.get('/:eventId/destination', async (req: Request, res: Response) => {
    const { eventId } = req.params;

    const destinations = await prisma.$transaction(async (tx) => {
        // 1. look up all the destinations given the event id
        const destinations: DestinationWithStreamAndCategory[] = await tx.reservedDestination.findMany({
            where: {
                eventId
            },
        });

        // 2. for each destination, look up the stream and its categorys
        for (const destination of destinations) {
            if (!destination.streamId) {
                continue;
            }
            const stream = await tx.stream.findUnique({
                where: {
                    id: destination.streamId as string | undefined
                },
                include: {
                    category: true
                }
            });
            destination.stream = stream;
        }
        return destinations;
    });

    res.json({
        code:0,
        data: destinations
    });
});


// get a single event
eventRouter.get('/:eventId', ensureEventId, async (req: Request, res: Response) => {
    const { eventId } = req.params;
    const event = await prisma.event.findUnique({
        where: {
            id: eventId
        }
    });
    res.json({
        code:0,
        data: event
    });
});

eventRouter.get('/:eventId/destination/:id',ensureEventId, async (req: Request, res: Response) => {
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

// delete/ archive an event
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
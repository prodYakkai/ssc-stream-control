/*
 * File: stream.ts
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
import { SrsService } from '../services/SrsService';
import { logAuditTrail } from '../services/AuditTrailService';
import { AuditTrailAction } from '@prisma/client';
import { randomUUID } from 'crypto';
import { requireAdmin } from '../middlewares/guard';

const streamRouter = Router();

// get all keys within a category
streamRouter.get(
  '/event/:eventId/category/:categoryId',
  async (req: Request, res: Response) => {
    const { eventId, categoryId } = req.params;
    if (!categoryId || !eventId) {
      res.status(400);
      res.json({
        message: 'category is required',
        code: -1,
      });
      return;
    }
    const categoryData = await prisma.stream.findMany({
      where: {
        categoryId: categoryId,
        eventId: eventId,
      },
    });
    res.json({
      message: 'success',
      code: 0,
      data: categoryData,
    });
  },
);

// create a new key within a category
streamRouter.post(
  '/event/:eventId/category/:categoryId',
  async (req: Request, res: Response) => {
    const { eventId, categoryId } = req.params;
    const { name, desc } = req.body;

    if (!categoryId || !eventId) {
      res.status(400);
      res.json({
        message: 'category is required',
        code: -1,
      });
      return;
    }

    if (!name) {
      res.status(400);
      res.json({
        message: 'name is required',
        code: -1,
      });
      return;
    }

    if (name.length > 32) {
      res.status(400);
      res.json({
        message: 'stream name is too long',
        code: -1,
      });
      return;
    }

    const streamDoc = await prisma.stream.create({
      data: {
        event: {
          connect: {
            id: eventId,
          },
        },
        category: {
          connect: {
            id: categoryId,
          },
        },
        name,
        description: desc,
      },
    });
    logAuditTrail({
      action: AuditTrailAction.GenerateKey,
      // @ts-expect-error already checked at guard
      actor: req.user?.email,
      target: `${categoryId}/${name}`,
    });

    res.json({
      message: 'success',
      code: 0,
      data: {
        id: streamDoc.id,
        key: streamDoc.ingestKey,
      },
    });
  },
);

// revoke a key within a category
streamRouter.delete('/id/:streamId', requireAdmin, async (req: Request, res: Response) => {
  const { streamId } = req.params;
  const {forceKickClient } = req.query;
  if (!streamId) {
    res.status(400);
    res.json({
      message: 'streamId is required',
      code: -1,
    });
    return;
  }

  const streamData = await prisma.stream.delete({
    where: {
      id: streamId,
    },
    include: {
      category: true,
    },
  });

  // Unpatch all destinations
  const destData = await prisma.reservedDestination.deleteMany({
    where: {
      streamId: streamId,
    },
  });


  logAuditTrail({
    action: AuditTrailAction.RevokeKey,
    // @ts-expect-error already checked at guard
    actor: req.user?.email,
    target: `${streamData?.category}/${streamData?.name}`,
  });

  if (streamData?.srsIngestClientId && forceKickClient === 'true') {
    SrsService.kickStreamClient(streamData?.srsIngestClientId);
    logAuditTrail({
      action: AuditTrailAction.KickStream,
      // @ts-expect-error already checked at guard
      actor: req.user?.email,
      target: `${streamData?.category}/${streamData?.name}`,
      success: true,
    });
  }

  res.json({
    message: 'success',
    code: 0,
    data: {
      unpatched: destData.count,
    }
  });
});

// get a stream key detail by stream id
streamRouter.get('/id/:streamId', async (req: Request, res: Response) => {
  const { streamId } = req.params;
  if (!streamId) {
    res.status(400);
    res.json({
      message: 'streamId is required',
      code: -1,
    });
    return;
  }

  const streamData = await prisma.stream.findFirst({
    where: {
      id: streamId,
    },
    include: {
      category: true,
      viewers: true,
      event: true,
      destination: true,
    },
  });

  res.json({
    message: 'success',
    code: 0,
    data: streamData,
  });
});

// update meta data of a stream key
streamRouter.patch('/id/:streamId', async (req: Request, res: Response) => {
  const { streamId } = req.params;
  const { name, desc } = req.body;
  if (!streamId) {
    res.status(400);
    res.json({
      message: 'streamId is required',
      code: -1,
    });
    return;
  }

  if (!name) {
    res.status(400);
    res.json({
      message: 'name is required',
      code: -1,
    });
    return;
  }

  if (name.length > 32) {
    res.status(400);
    res.json({
      message: 'stream name is too long',
      code: -1,
    });
    return;
  }

  const streamData = await prisma.stream.update({
    where: {
      id: streamId,
    },
    data: {
      name,
      description: desc,
    },
  });

  res.json({
    message: 'success',
    code: 0,
    data: streamData,
  });
});

// revoke and regenerate the playback/ingest url
streamRouter.delete('/rotate/:id', requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { kickClient, kickIngest, rotateType } = req.query;

  const streamData = await prisma.stream.findFirst({
    where: {
      id: id as string,
    },
  });

  if (!streamData) {
    res.status(500).json({ message: 'Internal server error', code: -1 });
    return;
  }

  const updatedStreamData = await prisma.stream.update({
    where: {
      id: id as string,
    },
    data: {
      viewKey: rotateType === 'view' || rotateType === 'all' ? randomUUID() : streamData.viewKey,
      ingestKey: rotateType === 'ingest' || rotateType === 'all' ? randomUUID() : streamData.ingestKey,
    },
  });

  res.json({
    message: 'success',
    code: 0,
    data: updatedStreamData,
  });

  if (kickClient === 'true') {
    const clients = await prisma.viewer.findMany({
      where: {
        streamId: id as string,
      },
    });

    clients.forEach(async (client) => {
      SrsService.kickPlaybackClient(client.srsClientId);
    });
  }
  
  if (kickIngest === 'true' && streamData.srsIngestClientId) {
    SrsService.kickStreamClient(streamData.srsIngestClientId);
  }
});

streamRouter.post('/route/:streamId', async (req: Request, res: Response) => {
  const { streamId } = req.params;
  const { targetDestId, disconnect } = req.body;

  if (!streamId) {
    res.status(400);
    res.json({
      message: 'streamId is required',
      code: -1,
    });
    return;
  }

  const streamData = await prisma.stream.findFirst({
    where: {
      id: streamId,
    },
    include: {
      destination: true,
    },
  });

  if (!streamData) {
    res.status(400);
    res.json({
      message: 'stream not found',
      code: -1,
    });
    return;
  }

  // unpatch destination
  if (targetDestId === null) {
    const updatedStreamData = await prisma.stream.update({
      where: {
        id: streamId,
      },
      data: {
        destination: {
          disconnect: true,
        },
      },
    });

    if (disconnect && streamData.srsIngestClientId) {
      SrsService.kickStreamClient(streamData.srsIngestClientId);
    }

    res.json({
      message: 'success',
      code: 0,
      data: updatedStreamData,
    });
    return;
  }

  if (streamData.destination?.id === targetDestId) {
    res.status(400);
    res.json({
      message: 'destination already connected',
      code: -1,
    });
    return;
  }

  const destData = await prisma.reservedDestination.findFirst({
    where: {
      id: targetDestId,
    },
  });

  if (!destData) {
    res.status(400);
    res.json({
      message: 'destination not found',
      code: -1,
    });
    return;
  }

  const updatedStreamData = await prisma.stream.update({
    where: {
      id: streamId,
    },
    data: {
      destination: {
        connect: {
          id: targetDestId,
        },
      },
    },
  });

  if (disconnect && streamData.srsIngestClientId) {
    SrsService.kickStreamClient(streamData.srsIngestClientId);
  }

  res.json({
    message: 'success',
    code: 0,
    data: updatedStreamData,
  });
});

export default streamRouter;

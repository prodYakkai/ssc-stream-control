/*
 * File: feed.ts
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
import { getUrlSignHash } from '../utils/urlConstruct';
import { prisma } from '..';
import { REDACTED } from '../constants';
import resWrap from '../utils/responseWrapper';

const feedRouter = Router();

feedRouter.get('/:viewKey', async (req: Request, res: Response) => {
  const { viewKey } = req.params;
  const { previewKeyValidTime } = req.query;

  if (!viewKey) {
    res.status(400).json({ message: 'Missing key', code: -1 });
    return;
  }

  if (viewKey.toString().indexOf('/') > -1) {
    res.status(400).json({ message: 'Invalid key', code: -1 });
    return;
  }

  const streamData = await prisma.$transaction(async (tx) => {
    // 1. probe the viewKey on destination
    const destinationProbe = await tx.reservedDestination.findFirst({
      where: {
        id: viewKey.toString(),
      },
      select: {
        streamId: true
      }
    }).catch(() => null);
    // if the viewKey is not found, return null

    // 2. fetch stream data
    const streamData = await tx.stream.findFirst({
      where: {
        OR: [
          {
            viewKey: viewKey.toString(),
          },
          {
            id: destinationProbe?.streamId || undefined,
          },
        ]
      },
      include: {
        category: true,
        event: true,
      }
    });

    if (!streamData) {
      return null;
    }

    return {
      ...streamData,
      destination: destinationProbe ? {
        streamId: destinationProbe.streamId,
        viewKey: viewKey.toString(),
      } : null,
    }
  });

  if (streamData === null) {
    res.status(500).json({ message: 'Internal server error question mark?', code: -1 });
    return;
  }

  const previewHourTime = parseInt(previewKeyValidTime as string) || 6;

  if (previewHourTime <= 0 ){
    res.status(400).json({ message: 'Invalid preview key valid time, must greater than 0 hours.', code: -1 });
    return;
  }

  // sanitize the stream data
  streamData.ingestKey = REDACTED;
  streamData.srsIngestClientId = REDACTED;
  streamData.srsIngestStreamId = REDACTED;

  const playbackSignResult = getUrlSignHash(streamData, previewHourTime);

  res.json({
    message: 'success',
    code: 0,
    data: {
      resolveNext: streamData.destination !== null,
      expire: playbackSignResult.expire,
      sign: playbackSignResult.sign,
      start: playbackSignResult.start,
      ...streamData,
    }
  });
});

feedRouter.get('/event/:eventId', async (req: Request, res: Response) => {
  const { eventId } = req.params;

  if (!eventId) {
    res.status(400).json({ message: 'Missing event id', code: -1 });
    return;
  }

  // get all event branding
  const eventBranding = await prisma.eventBranding.findMany({
    where: {
      eventId,
    }
  });

  // get all eventAds
  const eventAds = await prisma.eventAd.findMany({
    where: {
      eventId,
    }
  });

  res.json(resWrap({
    eventBranding,
    eventPromo: eventAds,
  }));
  
});

export default feedRouter;

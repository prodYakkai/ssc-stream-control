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

  const destinationViewProbe = await prisma.reservedDestination.findFirst({
    where: {
      id: viewKey.toString(),
    },
    select: {
      redirect: false,
      streamId: true,
    }
  });

  const streamData = await prisma.stream.findFirst({
    where: {
      OR: [
        {
          viewKey: viewKey.toString(),
        },
        {
          id: destinationViewProbe?.streamId || '',
        },
      ]
    },
    include: {
      destination: true,
      category: {
        select: {
          name: true,
          id: true,
        }
      },
      event: {
        select: {
          name: true,
          id: true,
        }
      },
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

export default feedRouter;

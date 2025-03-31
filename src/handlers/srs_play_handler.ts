/*
 * File: srs_play_handler.ts
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

import { SrsService } from '../services/SrsService';
import { SrsPublish } from '../types/SrsPublish';
import { createHash } from 'crypto';
import dayjs from 'dayjs';
import {  StreamURLFlattenParams } from '../utils/urlConstruct';
import { prisma } from '..';

export const SrsPlayHandler = async (
  payload: SrsPublish,
  resolve: (T: number) => void,
  reject: () => void,
) => {
  let payloadParams = payload.param;
  // resolve(0);
  // return;

  console.log(payload);

  // OBS fix
  if (payload.stream.indexOf('?') > -1) {
    payloadParams = payload.stream.split('?')[1];
  }

  const parsedParams = Object.fromEntries(new URLSearchParams(payloadParams)) as unknown as StreamURLFlattenParams;

  console.log(`Playing ${payload.stream}`);

  // ensure key and vhosts are present
  if (!parsedParams.expire || !parsedParams.sign) {
    console.error(
      `Missing HMAC info in SRS play payload, kicking client ${payload.ip}`,
    );
    reject();
    SrsService.kickStreamClient(payload.client_id);
    return;
  }

  // check if the key is started
  const start = dayjs.unix(parsedParams.start);
  if (dayjs().isBefore(start)) {
    console.error(
      `Key not started in SRS play payload, kicking client ${payload.ip}`,
    );
    reject();
    SrsService.kickStreamClient(payload.client_id);
    return;
  }

  // recompute the hmac
  let computedHash = '';
  console.log(parsedParams.key);

  computedHash = createHash('sha256').update(
    `${process.env.FEED_HMAC_KEY}.${parsedParams.start}.${parsedParams.expire}.${parsedParams.key}`,
  ).digest('hex');


  // compare the hmac
  if (computedHash !== parsedParams.sign) {
    console.error(
      `HMAC mismatch in SRS play payload, kicking client ${payload.ip}`,
    );
    console.error(`Computed hash: ${computedHash}`);
    console.error(`Expected hash: ${parsedParams.sign}`);
    reject();
    SrsService.kickStreamClient(payload.client_id);
    return;
  }

  const streamInfo = await prisma.stream.findUnique({
    where: {
      viewKey: parsedParams.key,
    },
    select: {
      id: true,
      viewLocked: true,
    }
  });

  if (!streamInfo) {
    console.error(
      `Stream not found in SRS play payload ${payload.client_id}`,
    );
    reject();
    // SrsService.kickStreamClient(payload.client_id);
    return;
  }

  if (streamInfo.viewLocked) {
    console.error(
      `Stream locked, kicking client ${payload.ip}`,
    );
    reject();
    SrsService.kickStreamClient(payload.client_id);
    return;
  }

  // TODO: check with SRS API
  // await prisma.viewer.create({
  //   data: {
  //     stream: {
  //       connect: {
  //         viewKey: parsedParams.key,
  //       },
  //     },
  //     srsClientId: payload.client_id,
  //   },
  // });

  resolve(0);
};

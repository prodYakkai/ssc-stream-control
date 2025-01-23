/*
 * File: srs_publish_handler.ts
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

import { IngestMethod } from '@prisma/client';
import { prisma } from '..';
import { SrsService } from '../services/SrsService';
import { SrsPublish } from '../types/SrsPublish';

export const SrsPublishHandler = async (payload: SrsPublish, resolve: (T: number) => void, reject: () => void ) => {
    const parsedParams = Object.fromEntries(new URLSearchParams(payload.param));

    console.log('SrsPublishHandler payload:', payload);
    /**
     * !!! Important !!!
     * Starting in SRS6, the `stream` is the *stream key* for the stream,
     *  `key` query parameter in the URL in no longer used.
     */
    console.log(`Publishing ${payload.stream}`);

    // ensure key and vhosts are present
    if (!parsedParams.key) {
        console.error(`Missing key in SRS publish payload, kicking client ${payload.ip}`);
        reject();
        SrsService.kickStreamClient(payload.client_id);
        return;
    }

    // find the vhost
    const streamDoc = await prisma.stream.findFirst({
        where: {
            ingestKey: parsedParams.key
        }
    });
    if (!streamDoc) {
        console.error(`No stream found for key ${parsedParams.key}, kicking client ${payload.ip}`);
        reject();
        SrsService.kickStreamClient(payload.client_id);
        return;
    }

    if (streamDoc.srsIngestClientId) {
        console.warn(`Stream ${streamDoc.ingestKey} already has a client ${streamDoc.srsIngestClientId}!`);
        resolve(0); // just reject but don't kick
        return;
    }

    console.log(`Assigning stream ${payload.client_id} to stream ${payload.stream}`);
    let protocol = payload.tcUrl.split('://')[0];
    if (payload.tcUrl === ''){
        protocol = IngestMethod.WHIP;
    }
    await prisma.stream.update({
        where: {
            id: streamDoc.id
        },
        data: {
            srsIngestStreamId: payload.stream_id,
            srsIngestClientId: payload.client_id,
            ingestMethod: protocol.toUpperCase() as IngestMethod
        }
    });

    resolve(0);

    prisma.streamHistory.create({
        data: {
            streamId: streamDoc.id,
            srsClientId: payload.client_id,
            ingestMethod: protocol.toUpperCase() as IngestMethod,
        }
    });


};
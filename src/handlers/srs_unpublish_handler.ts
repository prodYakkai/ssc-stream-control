/*
 * File: srs_unpublish_handler.ts
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
import { SrsPublish } from '../types/SrsPublish';

export const SrsUnpublishHandler = async (payload: SrsPublish) => {
    const parsedParams = Object.fromEntries(new URLSearchParams(payload.param));

    if (!parsedParams.key) {
        console.warn('Missing key in SRS unpublish payload, skipped.');
        return;
    }

    const streamDoc = await prisma.stream.findFirst({
        where: {
            ingestKey: parsedParams.key
        },
        select: {
            id: true,
            srsIngestClientId: true,
        }
    });

    if (!streamDoc) {
        console.warn(`No stream found for key ${parsedParams.key}, skipped.`);
        return;
    }

    if (streamDoc.srsIngestClientId !== payload.client_id) {
        console.warn(`Client ${payload.client_id} is not assigned to stream ${payload.stream}.`);
        // return;
    }

    console.log(`Un-assigning stream ${payload.client_id} from stream ${payload.stream}`);

    await prisma.$transaction(async (tx) => {
        // 1. update stream
        await tx.stream.update({
            where: {
                id: streamDoc.id
            },
            data: {
                srsIngestClientId: null,
                srsIngestStreamId: null,
                ingestMethod: IngestMethod.UNKNOWN,
            }
        });
        // 2. probe for stream history
        const streamHistory = await tx.streamHistory.findFirst({
            where: {
                srsClientId: payload.client_id,
                streamId: streamDoc.id,
                stoppedAt: undefined,
            }
        });
        // if not found, then skip
        if (!streamHistory) {
            console.warn(`No stream history found for client ${payload.client_id} and stream ${payload.stream}.`);
            return;
        }
        // 3. update stream history
        await tx.streamHistory.update({
            where: {
                id: streamHistory.id,
            },
            data: {
                stoppedAt: new Date(),
            }
        });
        return;
    });
};
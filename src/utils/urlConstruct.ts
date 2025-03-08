/*
 * File: urlConstruct.ts
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

import { PlayerHost } from '../constants';
import { createHash } from 'crypto';
import dayjs from 'dayjs';
import { Stream } from '@prisma/client';


export interface StreamURLParams {
    category: string;
    name: string;
    key: string;
    publish?: boolean;

    // View only params
    playbackParams?: StreamPlayParams;
}

export interface StreamPlayParams {
    start: number;
    expire: number;
    sign: string;
}

export interface StreamURLFlattenParams extends StreamURLParams, StreamPlayParams {}

// srt://localhost:10080?streamid=#!::h=stage,key=123456,r=main/livestream?secret=46d736f0a7974139982045ace70c42ad,m=publish
const generateSrtUrl = (params: StreamURLParams) => {
    // do not use url constructor... cuz SRT is yaml in url...
    return `srt://${process.env.STREAM_HOST}:10080/?streamid=#!::h=${params.category},mode=${params.publish ? 'publish':'play'},r=${params.category}/${params.name}?secret=nonce,m=${params.publish ? 'publish':'play'}${
        params.playbackParams ? 
        `,expire=${params.playbackParams.expire},sign=${params.playbackParams.sign},start=${params.playbackParams.start}`
         : `,key=${params.key}`
    }`;
}

const generateRtmpUrl = (params: StreamURLParams) => {
    const url = new URL(`rtmp://${process.env.STREAM_HOST}:1935/live/${params.category}_${params.name}`);
    if (params.playbackParams) {
        url.searchParams.append('expire', params.playbackParams.expire + '');
        url.searchParams.append('start', params.playbackParams.start + '');
        url.searchParams.append('sign', params.playbackParams.sign);
    }
    return url.toString();
}

const generateWhipUrl = (params: StreamURLParams) => {
    const url = new URL(`https://${process.env.STREAM_HOST}/rtc/v1/whip/`);
    url.searchParams.append('app', 'live');
    url.searchParams.append('stream', params.category + '-' + params.name);
    url.searchParams.append('key', params.key);
    return url.toString();
}

export const generateStreamUrl = (mode: 'srt' | 'rtmp' | 'whip' | 'web', params: StreamURLParams) => {
    switch (mode) {
        case 'srt':
            return generateSrtUrl(params);
        case 'rtmp':
            return generateRtmpUrl(params);
        case 'whip':
            return generateWhipUrl(params);
        case 'web':
            return `${PlayerHost}/play?key=${params.key}`
        default:
            throw new Error('Unsupported ingest mode');
    }
}

export const getUrlSignHash = (streamData: Stream, expire_in_hour: number,  start: dayjs.Dayjs = dayjs()) : StreamPlayParams => {
    const startEpoch = dayjs(start).unix();
    const expiryEpoch = dayjs(start).add(expire_in_hour, 'hour').unix();
    const hash = createHash('sha256').update(
      `${process.env.FEED_HMAC_KEY}.${startEpoch}.${expiryEpoch}.${streamData.viewKey}`,
    ).digest('hex');
    return {
        sign: hash,
        start: startEpoch,
        expire: expiryEpoch
    }
}
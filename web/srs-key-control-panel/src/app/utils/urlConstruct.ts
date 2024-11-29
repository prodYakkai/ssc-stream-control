/*
 * File: urlConstruct.ts
 * Project: srs-key-control-panel
 * -----
 * Copyright (C) 2024 Shengming Yuan - All rights reserved.
 * 
 * You may use, distribute and modify this code under the terms of the Apache License 2.0 license.
 * 
 * You should have received a copy of the Apache License 2.0 License along with this program.
 * If not, see https://www.apache.org/licenses/LICENSE-2.0.
 * 
 */

import { environment } from '../../environments/environment';
import {StreamURLParams } from '../../types/Stream';


// srt://localhost:10080?streamid=#!::h=stage,key=123456,r=main/livestream?secret=46d736f0a7974139982045ace70c42ad,m=publish

const generateRtmpUrl = (params: StreamURLParams) => {
    const url = new URL(`rtmp://${environment.streaming.host}:1935/live/${params.category}-${params.name}`);
    if (params.playbackParams) {
        url.searchParams.append('expire', params.playbackParams.expire + '');
        url.searchParams.append('sign', params.playbackParams.sign);
        url.searchParams.append('start', params.playbackParams.start + '');
    }
    url.searchParams.append('key', params.key);
    // url.searchParams.append('mode', params.publish ? 'publish':'play');
    return url.toString();
}

const generateWebRTCUrl = (params: StreamURLParams) => {
    const url = new URL(`https://${environment.streaming.src}/rtc/v1/${params.publish ? 'whip': 'whep'}/`);
    url.searchParams.append('app', 'live');
    url.searchParams.append('stream', params.category + '-' + params.name);
    url.searchParams.append('key', params.key);
    if (params.playbackParams) {
        url.searchParams.append('expire', params.playbackParams.expire + '');
        url.searchParams.append('sign', params.playbackParams.sign);
        url.searchParams.append('start', params.playbackParams.start + '');
    }
    return url.toString();
}

export const generateStreamUrl = (mode: 'webrtc' | 'rtmp', params: StreamURLParams) => {
    switch (mode) {
        case 'webrtc':
            return generateWebRTCUrl(params);
        case 'rtmp':
            return generateRtmpUrl(params);
        default:
            throw new Error('Unsupported ingest mode');
    }
}
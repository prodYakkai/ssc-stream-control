/*
 * File: SrsService.ts
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

import {default as a} from 'axios';
import { config as initEnv } from 'dotenv';
import { SrsApiResponse, SrsClientsResponse } from '../types/SrsClient';

// TODO: beautify this entire thing

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();
initEnv();
const srsApiAuthToken = Buffer.from(`apiuser:${process.env.SRS_API_TOKEN || ''}`).toString('base64');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SrsServiceErrorHandling = (error: any) => {
    if (error.response) {
        console.error('SRS API Error:', error.response.data);
    } else if (error.request) {
        console.error('SRS API Error:', error.request);
    } else {
        console.error('SRS API Error:', error.message);
    }
}
const axios = a.create({
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    httpsAgent: new (require('https').Agent)({
        rejectUnauthorized: process.env.NODE_ENV !== 'production',
    })
});
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('https').globalAgent.options.rejectUnauthorized = process.env.NODE_ENV !== 'production',

axios.defaults.baseURL = process.env.SRS_API_ENDPOINT + '/api/v1';
axios.defaults.headers.common = {
  Authorization: `Basic ${srsApiAuthToken}`,
};
axios.interceptors.response.use((response) => {
    return response;
}, SrsServiceErrorHandling);

const kickStreamClient = async (clientId: string) => {
    const res = await axios.delete(`/clients/${clientId}`)
    return res;
}

const fetchAllVhosts = async () => {
    const res = await axios.get('/vhosts')
    return res;
}

const fetchAllPlaybackClients = async () => {
    const res = await axios.get('/clients')
    return res;
}

const kickPlaybackClient = async (clientId: string) => {
    const res = await axios.delete(`/clients/${clientId}`)
    return res.data;
}

const getStreams = async () => {
    const res = await axios.get('/streams')
    return res.data;
}

const fetchAllClients = async (page=0, size=20)=> {
    const res = await axios.get<SrsApiResponse<SrsClientsResponse> >('/clients', {
        params: {
            page,
            size
        }
    })
    return res.data;
}


export const SrsService = {
    kickStreamClient,
    fetchAllVhosts,
    kickPlaybackClient,
    fetchAllPlaybackClients,
    getStreams,
    fetchAllClients
};
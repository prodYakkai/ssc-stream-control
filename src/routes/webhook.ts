/*
 * File: webhook.ts
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
import { SrsPublish } from '../types/SrsPublish';
import { SrsPublishHandler } from '../handlers/srs_publish_handler';
import { SrsUnpublishHandler } from '../handlers/srs_unpublish_handler';
import { SrsPlayHandler } from '../handlers/srs_play_handler';
import { SrsStopHandler } from '../handlers/srs_stop_handler';
import { SrsForwardHandler } from '../handlers/srs_forward_handler';

const webhookRouter = Router();

webhookRouter.post('/streams', async (req: Request, res: Response) => {

	const hookPromise = new Promise((resolve, reject) => {
		const payload: SrsPublish = req.body;
		switch (payload.action) {
			case 'on_publish':
				SrsPublishHandler(payload, resolve, reject);
				break;
			case 'on_unpublish': 
				console.log(`Unpublishing ${payload.stream} to ${payload.vhost}`);
				resolve(true);
				SrsUnpublishHandler(payload);
				break;
			default:
				// ???
				reject();
				break;
		}
	});
	
	hookPromise.then(() => {
		res.json({ code: 0, data: 'OK' });
	}).catch(() => {
		res.json({ code: 100, data: 'Failed' });
	});
	
});

webhookRouter.post('/sessions', async (req: Request, res: Response) => {

	const hookPromise = new Promise((resolve, reject) => {
		const payload: SrsPublish = req.body;
		switch (payload.action) {
			case 'on_play':
				SrsPlayHandler(payload, resolve, reject);
				break;
			case 'on_stop':
				SrsStopHandler(payload, resolve);
				break;
			default:
				resolve(1);
				break;
		}
	});
	
	hookPromise.then(() => {
		res.json({ code: 0, data: '' });
	}).catch(() => {
		res.json({ code: 1, data: '' });
	});
});

webhookRouter.post('/forward', async (req: Request, res: Response) => {

	const hookPromise = new Promise((resolve, reject) => {
		const payload: SrsPublish = req.body;
		SrsForwardHandler(payload, resolve, reject);
	});
	
	hookPromise.then((forwardData) => {
		res.json({ code: 0, data: forwardData });
	}).catch(() => {
		res.json({ code: 1, data: {
			urls: [] // fail safe
		} });
	});
});

export default webhookRouter;

/**
 * Example payload:
 * {
  server_id: 'vid-j1362t8',
  service_id: '25m9p5cy',
  action: 'on_unpublish',
  client_id: '4423sx47',
  ip: '172.17.0.1',
  vhost: 'stage',
  app: 'a',
  tcUrl: 'srt://stage/a',
  stream: 'a',
  param: 'vhost=stage&key=5f942771-fe60-4489-9be2-eea5458792cb&secret=46d736f0a7974139982045ace70c42ad',
  stream_url: 'stage/a/a',
  stream_id: 'vid-2002ram'
}

Response payload Ref: https://github.com/ossrs/srs/blob/ad7ddde3181f9ad9c4c9225158ac6ec22944c429/trunk/src/app/srs_app_http_hooks.cpp#L661C1-L662C1
response standard object, format in json: {"code": 0, "data": ""}
 */

/*
 * File: SrsPublish.d.ts
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

export interface SrsPublish {
  server_id: string
  service_id: string
  action: 'on_publish' | 'on_unpublish' | 'on_connect' | 'on_play' | 'on_stop';
  client_id: string
  ip: string
  vhost: string
  app: string
  tcUrl: string
  stream: string
  param: string
  pageUrl?: string
  stream_url: string
  stream_id: string
}

export interface SrsForwardResponse {
  urls: string[]
}

  
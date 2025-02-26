/*
 * File: key.service.ts
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

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Stream } from '@prisma/client';
import { StreamWithAll, StreamWithKeyParams } from '../../types/Stream';


@Injectable({
  providedIn: 'root',
})
export class KeyService {
  constructor(private http: HttpClient) {}

  getKeysByCategory(eventId: string, categoryId: string) {
    return this.http.get<HttpResponse<Stream[]>>(
      `${environment.apiHost}/stream/event/${eventId}/category/${categoryId}`
    );
  }

  generateKey(eventId: string, categoryId: string, name: string, desc: string) {
    return this.http.post<HttpResponse<Stream>>(
      `${environment.apiHost}/stream/event/${eventId}/category/${categoryId}`,
      { name, desc }
    );
  }

  updateKey(stream: Stream) {
    return this.http.patch<HttpResponse<Stream>>(`${environment.apiHost}/stream/id/${stream.id}`, {
      name: stream.name,
      desc: stream.description,
    });
  }

  revokeKey(streamId: string, kickClient: boolean, revokeKeyPassword?: string) {
    return this.http.delete(`${environment.apiHost}/stream/id/${streamId}`, {
      params: {
        kickClient: kickClient.toString(),
        revokePassword: revokeKeyPassword || '',
      },
    });
  }

  rotateKey(streamId: string, rotateType: 'ingest' | 'view' | 'all', kickClient: boolean, kickIngest: boolean) {
    return this.http.delete<HttpResponse<Stream>>(
      `${environment.apiHost}/stream/rotate/${streamId}`,
      {
        params: {
          rotateType,
          kickClient: kickClient,
          kickIngest: kickIngest
        }
      }
    );
  }

  getKeyDetail(streamId: string) {
    return this.http.get<HttpResponse<StreamWithAll>>(`${environment.apiHost}/stream/id/${streamId}`);
  }

  rotateViewKey(streamId: string, kickClient: boolean) {
    return this.http.delete(
      `${environment.apiHost}/stream/id/${streamId}/rotate`,
      { params: { kickClient: kickClient.toString() } }
    );
  }

  getStreamViewHMAC(viewKey: string, previewKeyValidTime: number) {
    return this.http.get<HttpResponse<StreamWithKeyParams>>(
      `${environment.apiHost}/feed/${viewKey}`,
      { params: { previewKeyValidTime } }
    );
  }

  generateBatchMasterSheet(previewSignValidHours: number) {
    return this.http.post(`${environment.apiHost}/batch/generate`, {
      previewSignValidHours,
    });
  }

  rerouteStream(streamId: string, destinationId: string | null, disconnect: boolean) {
    return this.http.post<HttpResponse<Stream>>(`${environment.apiHost}/stream/route/${streamId}`, {
      disconnect: disconnect,
      targetDestId: destinationId,
    });
  }

  lockStream(streamId: string, lock: boolean) {
    return this.http.post<HttpResponse<Stream>>(`${environment.apiHost}/stream/id/${streamId}/lock`, {
      lockdown: lock,
    });
  }
}

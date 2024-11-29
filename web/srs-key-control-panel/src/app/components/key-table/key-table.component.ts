/*
 * File: key-table.component.ts
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

import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { NzTableModule } from 'ng-zorro-antd/table';
import { KeyService } from '../../services/key.service';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { CommonModule } from '@angular/common';
import {
  NzNotificationModule,
  NzNotificationService,
} from 'ng-zorro-antd/notification';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { ClipboardModule, ClipboardService } from 'ngx-clipboard';
import { generateStreamUrl } from '../../utils/urlConstruct';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { environment } from '../../../environments/environment';
import { NzInputModule } from 'ng-zorro-antd/input';
import { FormsModule } from '@angular/forms';
import { LocalStorageKey, TableSettings } from '../../constants/StorageKey';
import { EventService } from '../../services/event.service';
import { Stream } from '@prisma/client';
import { Category } from '@prisma/client';
import { RouterModule } from '@angular/router';
import { StreamURLParams } from '../../../types/Stream';

interface ModalURLParams {
  rtmpUrl: string;
  webrtcUrl: string;
  viewKey: string;
  id: string;
  ingestKey: string;
  category: string;
  name: string;
}

@Component({
  selector: 'app-key-table',
  standalone: true,
  imports: [
    NzTableModule,
    NzDividerModule,
    CommonModule,
    NzNotificationModule,
    NzButtonModule,
    NzTypographyModule,
    NzToolTipModule,
    NzInputModule,
    FormsModule,
    NzTagModule,
    ClipboardModule,
    NzModalModule,
    NzCheckboxModule,
    NzSpinModule,
    RouterModule,
  ],
  templateUrl: './key-table.component.html',
  styleUrl: './key-table.component.less',
})
export class KeyTableComponent implements OnInit, OnChanges, OnDestroy {
  @Input() public category: Category | null = null;
  @Input() public isFocus = false;

  public keys: Stream[] = [];
  public isLoading = false;
  public modalURLParams: ModalURLParams = {
    rtmpUrl: '',
    webrtcUrl: '',
    viewKey: '',
    id: '',
    category: '',
    ingestKey: '',
    name: '',
  };
  public isStreamUrlModalVisible = false;
  public isPlayUrlModalVisible = false;
  public isRevokeKeyModalVisible = false;
  public playerHost = environment.playerHost;
  public lastUpdatedOn = new Date();
  public environment = environment;

  public tableSettings: TableSettings = {
    enableRevokeKey: false,
  };

  public revokeKeyParams = {
    kickClient: true,
    isRevoking: false,
    canKickClient: false,
    id: '',
  };

  constructor(
    private keyService: KeyService,
    private eventService: EventService,
    private notification: NzNotificationService,
    private clipboard: ClipboardService,
  ) {}

  ngOnInit(): void {
    // this.getKeys();
    this.tableSettings.enableRevokeKey = JSON.parse(
      localStorage.getItem(LocalStorageKey.TableSettings.EnableRevokeKey) || 'false'
    );
  }

  ngOnChanges(): void {
    if (this.isFocus) {
      this.getKeys();
    }
  }

  ngOnDestroy(): void {

  }


  handleOk(): void {
    this.isPlayUrlModalVisible = false;
    this.isStreamUrlModalVisible = false;
    this.isRevokeKeyModalVisible = false;
  }


  public getKeys() {
    if (this.category === null) {
      console.error('Category is null');
      return;
    }
    this.isLoading = true;
    this.keyService.getKeysByCategory(
      this.eventService.getLocalCurrentEvent(), 
      this.category.id
    ).subscribe((result) => {
      this.isLoading = false;
      if (result.code < 0) {
        console.error(result);
        this.notification.create('error', 'Error', result.message || 'Failed to get keys');
      } else {
        this.lastUpdatedOn = new Date();
        this.keys = result.data;
      }
    });
  }

  public copyURL(stream: Stream): void {
    const key = `${this.category?.name}-${stream.name}?key=${stream.ingestKey}`;
    console.log('copy key:', key);
    this.clipboard.copy(key);
    this.notification.create(
      'success',
      'Success',
      'RTMP Publish Key copied to clipboard'
    );
  }

  public showStreamUrl(stream: Stream, e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    if (this.category === null){
      return;
    } 
    const params: StreamURLParams = {
      category: this.category.name,
      name: stream.name,
      key: stream.ingestKey,
      publish: true,
    };

    this.modalURLParams = {
      rtmpUrl: generateStreamUrl('rtmp', params),
      webrtcUrl: generateStreamUrl('webrtc', params),
      viewKey: stream.viewKey,
      id: stream.id,
      ingestKey: stream.ingestKey,
      category: this.category.name,
      name: stream.name,
    };

    this.isStreamUrlModalVisible = true;
  }

  public showPlayUrl(viewKey: string, e: Event): void {

    e.preventDefault();
    e.stopPropagation();
    const previewKeyValidTime = localStorage.getItem(LocalStorageKey.PreviewKeyValidTime);

    this.keyService.getStreamViewHMAC(viewKey, parseInt(previewKeyValidTime as string) || 3).subscribe({
      next: (result) => {
        if (this.category === null){
          return;
        } 
        if (result.code < 0) {
          this.notification.create('error', 'Error', result.message || 'Failed to get view key');
        } else {
          const params: StreamURLParams = {
            category: this.category.name,
            name: result.data.name,
            key: viewKey,
            publish: false,
            playbackParams: result.data,
          };
          this.modalURLParams = {
            rtmpUrl: generateStreamUrl('rtmp', params),
            webrtcUrl: generateStreamUrl('webrtc', params),
            viewKey: result.data.viewKey,
            id: result.data.id,
            ingestKey: result.data.ingestKey,
            category: this.category.name,
            name: result.data.name,
          };
          this.isPlayUrlModalVisible = true;
        }
      },
      error: (error) => {
        this.notification.create('error', 'Error', JSON.stringify(error));
      },
    });
  }

  public showRevokeKeyModal(stream: Stream, e: Event): void {
    e.preventDefault();
    e.stopPropagation();

    this.revokeKeyParams = {
      kickClient: false,
      id: stream.id,
      isRevoking: false,
      canKickClient: stream.srsIngestClientId !== null,
    };

    this.isRevokeKeyModalVisible = true;
  }

  public handleRevokeKey(): void {
    this.revokeKeyParams.isRevoking = true;
    this.keyService
      .revokeKey(
        this.revokeKeyParams.id,
        this.revokeKeyParams.kickClient,
      )
      .subscribe({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        next: (result: any) => {
          if (result['code'] < 0) {
            this.revokeKeyParams.isRevoking = false;
            this.notification.create('error', 'Error', result['message']);
          }
          this.getKeys();
          this.notification.create('success', 'Success', 'Key revoked');
          this.isRevokeKeyModalVisible = false;
          this.revokeKeyParams = {
            id: '',
            kickClient: true,
            isRevoking: false,
            canKickClient: false,
          };
        },
        error: () => {
          this.revokeKeyParams.isRevoking = false;
        },
      });
  }
}

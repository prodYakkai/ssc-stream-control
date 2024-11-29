/*
 * File: settings.component.ts
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

import { Component, OnInit } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {  LocalStorageKey, TableSettings } from '../../constants/StorageKey';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { environment } from './../../../environments/environment';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    NzGridModule,
    NzCheckboxModule,
    NzButtonModule,
    NzDividerModule,
    FormsModule,
    CommonModule,
    NzCardModule,
    NzMessageModule,
    NzInputModule,
    NzSpaceModule,
    NzInputNumberModule,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.less'
})
export class SettingsComponent implements OnInit{

  public locallyCachedMasterSheet: string = '';
  public tableSettings: TableSettings = {
    enableRevokeKey: false,
  };
  public previewKeyValidTime: number = 3;
  public clearKeyGenModalAfterCreate: boolean = false;

  public environment = environment;

  constructor(
    private messageService: NzMessageService,
  ) { }

  ngOnInit(): void {
    this.loadLocalStorage();
  }

  loadLocalStorage(){
    const lastGeneratedMasterSheet = localStorage.getItem(LocalStorageKey.LastGeneratedMasterSheet);
    if (lastGeneratedMasterSheet){
      this.locallyCachedMasterSheet = lastGeneratedMasterSheet;
    }
    this.previewKeyValidTime = parseInt(localStorage.getItem(LocalStorageKey.PreviewKeyValidTime) || '3');
  }

  onUpdateTableSettings(){
    localStorage.setItem(LocalStorageKey.TableSettings.EnableRevokeKey, JSON.stringify(this.tableSettings.enableRevokeKey));
    this.messageService.create('success', 'Table Settings Updated');
  }

  onClearLocalCachedMasterSheet(){
    localStorage.removeItem(LocalStorageKey.LastGeneratedMasterSheet);
    this.messageService.create('success', 'Local Cached Master Sheet Cleared');
  }

  onChangePreviewKeyValidTime(){
    if (this.previewKeyValidTime <= 0){
      this.messageService.create('error', 'Invalid Preview Key Valid Time, must greater than 0 hours');
      return;
    }
    localStorage.setItem(LocalStorageKey.PreviewKeyValidTime, this.previewKeyValidTime.toString());
    this.messageService.create('success', 'Preview Key Valid Time Updated');
  }

  onStreamKeyGeneration(){
    localStorage.setItem(LocalStorageKey.ClearKeyGenModalAfterCreate, this.clearKeyGenModalAfterCreate.toString());
  }

}

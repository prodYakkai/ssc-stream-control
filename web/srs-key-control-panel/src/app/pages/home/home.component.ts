/*
 * File: welcome.component.ts
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

import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CategoryService } from '../../services/category.service';
import {
  NzTabChangeEvent,
  NzTabSetComponent,
  NzTabsModule,
} from 'ng-zorro-antd/tabs';
import {
  NzNotificationModule,
  NzNotificationService,
} from 'ng-zorro-antd/notification';
import { CommonModule } from '@angular/common';
import { UnsnakeCasePipe } from '../../pipes/unsnake-case.pipe';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { KeyTableComponent } from '../../components/key-table/key-table.component';
import { KeyGenModalComponent } from '../../components/key-gen-modal/key-gen-modal.component';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { KeyService } from '../../services/key.service';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { BatchGenModalComponent } from '../../components/batch-gen-modal/batch-gen-modal.component';
import { EventService } from '../../services/event.service';
import { Category } from '@prisma/client';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    NzTabsModule,
    NzNotificationModule,
    CommonModule,
    UnsnakeCasePipe,
    NzSpinModule,
    KeyTableComponent,
    KeyGenModalComponent,
    BatchGenModalComponent,
    NzAlertModule,
    NzDividerModule,
    NzButtonModule,
    NzModalModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less'],
})
export class HomeComponent implements OnInit, AfterViewInit {
  @ViewChild('tabset') tabset: NzTabSetComponent | undefined;

  public isLoading = false;
  public categories: Category[] = [];
  
  public isKeyGenModalVisible = false;
  public isMasterSheetGenModalVisible = false;

  public headerErrorMsg = '';
  public lastGeneratedMasterSheet: string | null = null;

  constructor(
    private categoryService: CategoryService,
    private keyService: KeyService,
    private notification: NzNotificationService,
    private eventService: EventService,
    private modalService: NzModalService
  ) {}

  ngAfterViewInit(): void {}

  ngOnInit() {
    this.loadVhosts();
    this.lastGeneratedMasterSheet = localStorage.getItem('lastGeneratedMasterSheet');
  }

  private loadVhosts() {
    this.isLoading = true;
    this.categoryService.getCategories(this.eventService.getLocalCurrentEvent()).subscribe({
      next: (response) => {
        this.categories = response.data;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.headerErrorMsg = 'Failed to load categories. Please refresh the page. or check if you have selected the right event';
        console.error('Failed to load categories', error);
      }
    });
  }

  public showKeyGenModal(): void {
    this.isKeyGenModalVisible = true;
    const selectedTab = this.tabset?.tabs.get(
      this.tabset?.nzSelectedIndex || 0
    );
    if (selectedTab) {
      selectedTab.isActive = false; // WARNING: this is a hack to reload the key table
    }
  }

  public handleKeyGenResponse(isSuccess: boolean): void {
    if (isSuccess) {
      this.isKeyGenModalVisible = false;
      const selectedTab = this.tabset?.tabs.get(
        this.tabset?.nzSelectedIndex || 0
      );
      if (selectedTab) {
        selectedTab.isActive = true; // WARNING: this is a hack to reload the key table
      }
    }
  }

  public handleGenerateMasterSheet(): void{
    if (this.lastGeneratedMasterSheet !== null && this.lastGeneratedMasterSheet !== '') {
      this.modalService.confirm({
        nzTitle: 'Last Generated Master Sheet',
        nzContent: 'Last generated master sheet is available. Do you want to open it?',
        nzOnOk: () => {
          window.open(this.lastGeneratedMasterSheet || '', '_blank');
        },
        nzOnCancel: () => {
          this.requestGenerateMasterSheet();
        }
      });
    }
    else {
      this.requestGenerateMasterSheet();
    }
  }

  public requestGenerateMasterSheet(): void {
    this.isMasterSheetGenModalVisible = true;
  }

  public handleTabSelect(event: NzTabChangeEvent): void {
    if (event.index === undefined) {
      return;
    }

    if (event.index === 0) {
      // this.loadVhosts();
    }
  }
}

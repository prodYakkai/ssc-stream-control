/*
 * File: key-gen-modal.component.ts
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

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { KeyService } from '../../services/key.service';
import { NzFormModule } from 'ng-zorro-antd/form';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { CommonModule } from '@angular/common';
import { UnsnakeCasePipe } from '../../pipes/unsnake-case.pipe';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import {
  NzNotificationModule,
  NzNotificationService,
} from 'ng-zorro-antd/notification';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { LocalStorageKey } from '../../constants/StorageKey';
import { Category } from '@prisma/client';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-key-gen-modal',
  standalone: true,
  imports: [
    NzModalModule,
    NzFormModule,
    NzInputModule,
    ReactiveFormsModule,
    NzSelectModule,
    CommonModule,
    UnsnakeCasePipe,
    NzCheckboxModule,
    NzNotificationModule,
    NzButtonModule,
    NzPopconfirmModule,
  ],
  templateUrl: './key-gen-modal.component.html',
  styleUrl: './key-gen-modal.component.less',
})
export class KeyGenModalComponent implements OnInit {

  @Input() public vhost_list: Category[] = [];
  @Input() public isVisible = false;
  @Output() public isVisibleChange = new EventEmitter<boolean>();
  @Output() public keyGenEvent = new EventEmitter<boolean>();

  public isOkLoading = false;

  constructor(
    private keyService: KeyService,
    private eventService: EventService,
    private fb: NonNullableFormBuilder,
    private notification: NzNotificationService
  ) {}

  validateForm: FormGroup<{
    vhost: FormControl<string>;
    name: FormControl<string>;
    desc: FormControl<string>;
  }> = this.fb.group({
    vhost: ['', [Validators.required, Validators.pattern(/^[a-z0-9_]+$/)]],
    name: ['', [Validators.required, Validators.pattern(/^[a-z0-9_]+$/), Validators.maxLength(32)]],
    desc: [''],
  });

  private clearFormOnOK = false;

  ngOnInit(): void {
    const clearFormSetting = localStorage.getItem(LocalStorageKey.ClearKeyGenModalAfterCreate);
    if (clearFormSetting) {
      this.clearFormOnOK = clearFormSetting === 'true';
    }
  }

  handleOk(): void {
    if (!this.validateForm.valid) {
      return;
    }
    this.isOkLoading = true;
    this.validateForm.disable();
    this.keyService
      .generateKey(
        this.eventService.getLocalCurrentEvent(),
        // @ts-expect-error angular already checked
        this.validateForm.value.vhost,
        this.validateForm.value.name,
        this.validateForm.value.desc,
      )
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .subscribe({
        next: (result) => {
          this.isOkLoading = false;
          this.validateForm.enable();
          if (result.code < 0) {
            console.error(result);
            this.notification.create('error', 'Error', result.message || 'error with key gen', {
              nzDuration: 3000,
            });
          } else {
            this.keyGenEvent.emit(true);
            this.notification.create(
              'success',
              'Success',
              'Key generated successfully',
              { nzDuration: 3000 }
            );
            this.handleCancel();
            if (this.clearFormOnOK) {
              this.validateForm.reset();
            }
          }
        },
        error: (error: unknown) => {
          this.isOkLoading = false;
          this.validateForm.enable();
          console.error(error);
          this.notification.create('error', 'Error', JSON.stringify(error), {
            nzDuration: 3000,
          });
        }
      });
  }

  handleCancel(): void {
    this.isVisible = false;
    this.isVisibleChange.emit(this.isVisible);
  }

  handleClear(): void {
    this.validateForm.reset();
  }
  public onInputChanged(e: Event): void {
    const input = e.target as HTMLInputElement;
    // Getting the current value of the input
    const currentValue = input.value;

    // Replacing spaces with underscores
    const modifiedValue = currentValue.replace(/ /g, '_');

    // Updating the input's value
    // @ts-expect-error angular already checked
    this.validateForm.controls[input.id].setValue(modifiedValue);
  }
}

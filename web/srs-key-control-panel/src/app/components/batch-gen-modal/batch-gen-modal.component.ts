import { KeyService } from './../../services/key.service';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';

@Component({
  selector: 'app-batch-gen-modal',
  standalone: true,
  imports: [NzModalModule, FormsModule, CommonModule, NzInputModule, NzInputNumberModule],
  templateUrl: './batch-gen-modal.component.html',
  styleUrl: './batch-gen-modal.component.less',
})
export class BatchGenModalComponent implements OnInit {
  @Input() public isVisible = false;
  @Output() public isVisibleChange = new EventEmitter<boolean>();

  public isLoading = false;
  public lastGeneratedMasterSheet: string | null = null;

  public expireHours = 24;

  constructor(
    private keyService: KeyService,
    private modalService: NzModalService,
    private notification: NzNotificationService
  ) {}

  ngOnInit(): void {}

  showModal(): void {
    this.isVisible = true;
  }

  handleOk(): void {
    this.isLoading = true;
    this.keyService.generateBatchMasterSheet(this.expireHours).subscribe(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (result: any) => {
        this.isLoading = false;
        if (result['code'] < 0) {
          this.notification.create('error', 'Error', result['message']);
        } else {
          this.notification.create(
            'success',
            'Success',
            'Master sheet generated successfully'
          );
        }
        this.lastGeneratedMasterSheet = result['data']['url'];
        localStorage.setItem(
          'lastGeneratedMasterSheet',
          this.lastGeneratedMasterSheet || ''
        );
        this.handleCancel();
        this.modalService.confirm({
          nzTitle: 'Open Master Sheet',
          nzIconType: 'check-circle',
          nzContent:
            'Some data may still be processing. Do you want to open the master sheet now?',
          nzOnOk: () => {
            window.open(this.lastGeneratedMasterSheet || '', '_blank');
          },
        });
      },
      (error) => {
        this.isLoading = false;
        this.notification.create('error', 'Error', JSON.stringify(error));
      }
    );
  }

  handleCancel(): void {
    this.isVisible = false;
    this.isVisibleChange.emit(this.isVisible);
  }
}

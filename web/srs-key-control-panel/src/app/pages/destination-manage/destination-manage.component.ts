import { environment } from './../../../environments/environment';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ReservedDestination } from '@prisma/client';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';
import { EventService } from '../../services/event.service';
import { KeyService } from '../../services/key.service';
import { RouterModule } from '@angular/router';
import { StreamWithAll } from '../../../types/Stream';

interface DestinationWithStream extends ReservedDestination {
  stream?: StreamWithAll;
}

@Component({
  selector: 'app-destination-manage',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzGridModule,
    CommonModule,
    NzDividerModule,
    NzTableModule,
    RouterModule,
    NzModalModule,
  ],
  templateUrl: './destination-manage.component.html',
  styleUrl: './destination-manage.component.less',
})
export class DestinationManageComponent implements OnInit {
  destinationForm: FormGroup;
  destinations: DestinationWithStream[] = [];
  public isLoading = false;
  currentEventId: string = '';
  public environment = environment;

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private keyService: KeyService,
    private messageService: NzMessageService,
    private modalService: NzModalService,
  ) {
    // Initialize the form with validation
    this.destinationForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.maxLength(16),
          Validators.pattern(/^[a-z0-9]+$/),
        ],
      ],
      description: ['', []],
    });
  }

  ngOnInit(): void {
    this.currentEventId = this.eventService.getLocalCurrentEvent();
    this.loadDestinations();
  }

  // Function to handle form submission
  submitForm(): void {
    if (this.destinationForm.valid) {
      this.eventService
        .createDestination(
          this.currentEventId,
          this.destinationForm.value.name,
          this.destinationForm.value.description
        )
        .subscribe({
          next: () => {
            this.destinationForm.reset();
            this.messageService.success('Category created successfully');
            this.loadDestinations();
          },
          error: (err) => {
            console.error(err);
            this.messageService.error('Failed to create event');
          },
        });
    } else {
      Object.values(this.destinationForm.controls).forEach((control) => {
        control.markAsDirty();
        control.updateValueAndValidity();
      });
    }
  }

  loadDestinations(): void {
    this.isLoading = true;
    this.eventService.getDestinations(this.currentEventId).subscribe({
      next: (data: HttpResponse<DestinationWithStream[]>) => {
        if (data.code === 0) {
          this.destinations = data.data;
        } else {
          console.error(data);
          this.messageService.error('Failed to get destinations');
        }
      },
      error: (err) => {
        console.error(err);
        this.messageService.error('Failed to get destinations');
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  unpatchDestination(id: string): void {
    this.modalService.confirm({
      nzTitle: 'Do you want to unpatch this destination?',
      nzContent: 'This action cannot be undone',
      nzOnOk: () => {
        this.keyService.rerouteStream(id, null, false).subscribe({
          next: () => {
            this.loadDestinations();
            this.messageService.success('Destination unpatched successfully');
          },
          error: (err) => {
            console.error(err);
            this.messageService.error('Failed to unpatch destination');
          },
        });
      },
    });
  }

  deleteDestination(id: string): void {
    this.modalService.confirm({
      nzTitle: 'Do you want to delete this destination?',
      nzContent: 'This action cannot be undone',
      nzOnOk: () => {
        this.eventService.deleteDestination(this.currentEventId, id).subscribe({
          next: () => {
            this.loadDestinations();
            this.messageService.success('Destination deleted successfully');
          },
          error: (err) => {
            console.error(err);
            this.messageService.error('Failed to delete destination');
          },
        });
      },
    });
  }

}

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTableModule } from 'ng-zorro-antd/table';
import { EventService } from '../../services/event.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Event } from '@prisma/client';
import { EventStreamReducerPipe } from '../../pipes/event-stream-reducer.pipe';

export interface EventWithStats extends Event {
  categories: [
    {
      _count: {
        streams: number;
      }
    }
  ]
}

@Component({
  selector: 'app-event-manage',
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
    EventStreamReducerPipe
],
  templateUrl: './event-manage.component.html',
  styleUrl: './event-manage.component.less'
})
export class EventManageComponent implements OnInit {
  eventForm: FormGroup;
  events: EventWithStats[] = [];
  public isLoading = false;
  currentEventId: string = '';

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private messageService: NzMessageService
  ) {
    // Initialize the form with validation
    this.eventForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(32)]],
      description: ['', [Validators.maxLength(100)]]
    });
  }

  ngOnInit(): void {
    this.loadEvents();
    this.currentEventId = this.eventService.getLocalCurrentEvent();
  }

  // Function to handle form submission
  submitForm(): void {
    if (this.eventForm.valid) {
      this.eventService.createEvent(this.eventForm.value.name, this.eventForm.value.description).subscribe({
        next: () => {
          this.eventForm.reset();
          this.messageService.success('Event created successfully');
          this.loadEvents();
        },
        error: (err) => {
          console.error(err);
          this.messageService.error('Failed to create event');
        }
      })
    } else {
      Object.values(this.eventForm.controls).forEach(control => {
        control.markAsDirty();
        control.updateValueAndValidity();
      });
    }
  }

  loadEvents(): void {
    this.isLoading = true;
    this.eventService.getEvents().subscribe({
      next: (data) => {
        if (data.code === 0) {
          this.events = data.data;
        }else{
          this.messageService.error('Failed to load events');
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  setCurrentEvent(eventId: string): void {
    this.eventService.setLocalCurrentEvent(eventId);
    this.currentEventId = eventId;
  }
}

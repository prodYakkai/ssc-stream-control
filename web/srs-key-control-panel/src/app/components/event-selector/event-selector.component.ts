import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { EventService } from '../../services/event.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Router } from '@angular/router';

@Component({
  selector: 'app-event-selector',
  standalone: true,
  imports: [NzDropDownModule, CommonModule],
  templateUrl: './event-selector.component.html',
  styleUrl: './event-selector.component.less'
})
export class EventSelectorComponent implements OnInit {
  constructor(
    private eventService: EventService,
    private router: Router,
    private messageService: NzMessageService
  ) { }

  currentEventId: string = '';
  currentEventName: string = '...';

  ngOnInit(): void {
    this.currentEventId = this.eventService.getLocalCurrentEvent();
    if (this.currentEventId) {
      this.getEventInfo(this.currentEventId);
    }else{
      this.router.navigate(['/manage/event']);
      this.messageService.error('Please select an event to continue');
    }
    this.eventService.eventChangeEmitter.subscribe({
      next: (eventId: string) => {
        this.currentEventId = eventId;
        this.getEventInfo(eventId);
      }
    });
  }

  getEventInfo(eventId: string) {
    this.eventService.getEvent(eventId).subscribe({
      next: (event) => {
        if (event.code === 0) {
        this.currentEventName = event.data.name;
        }
      }
    });
  }

}

import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { LocalStorageKey } from '../constants/StorageKey';
import { Event, ReservedDestination } from '@prisma/client';
import { EventWithStats } from '../pages/event-manage/event-manage.component';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  constructor(private http: HttpClient) {}

  public eventChangeEmitter = new EventEmitter<string>();

  getLocalCurrentEvent(): string {
    return localStorage.getItem(LocalStorageKey.CurrentEventId) || '';
  }

  setLocalCurrentEvent(eventId: string) {
    this.eventChangeEmitter.emit(eventId);
    localStorage.setItem(LocalStorageKey.CurrentEventId, eventId);
  }

  getEvents() {
    return this.http.get<HttpResponse<EventWithStats[]>>(environment.apiHost + '/event');
  }

  createEvent(name: string, description: string) {
    return this.http.post(environment.apiHost + '/event', {
      name,
      description,
    });
  }

  getEvent(id: string) {
    return this.http.get<HttpResponse<Event>>(
      environment.apiHost + '/event/' + id
    );
  }

  updateEvent(id: string, name: string, description: string) {
    return this.http.put(environment.apiHost + '/event/' + id, {
      name,
      description,
    });
  }

  archiveEvent(id: string, removeEvent: boolean) {
    return this.http.delete(environment.apiHost + '/event/' + id, {
      params: { removeEvent: removeEvent.toString() },
    });
  }

  getDestinations(eventId: string) {
    return this.http.get<HttpResponse<ReservedDestination[]>>(
      environment.apiHost + '/event/' + eventId + '/destination'
    );
  }

  getDestination(eventId: string, id: string) {
    return this.http.get<HttpResponse<ReservedDestination>>(
      environment.apiHost + '/event/' + eventId + '/destination/' + id
    );
  }

  updateDestination(
    eventId: string,
    id: string,
    name: string,
    description: string
  ) {
    return this.http.put<HttpResponse<ReservedDestination>>(
      environment.apiHost + '/event/' + eventId + '/destination/' + id,
      { name, description }
    );
  }

  createDestination(eventId: string, name: string, description: string) {
    return this.http.post<HttpResponse<ReservedDestination>>(
      environment.apiHost + '/event/' + eventId + '/destination',
      { name, description }
    );
  }

  deleteDestination(eventId: string, id: string) {
    return this.http.delete(environment.apiHost + '/event/' + eventId + '/destination/' + id);
  }

  deleteEvent(id: string, remove=false) {
    return this.http.delete(environment.apiHost + '/event/' + id, {
      params: { remove: remove.toString() },
    });
  }
}

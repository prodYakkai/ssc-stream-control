import { Pipe, PipeTransform } from '@angular/core';
import { EventWithStats } from '../pages/event-manage/event-manage.component';

@Pipe({
  name: 'eventStreamReducer',
  standalone: true
})
export class EventStreamReducerPipe implements PipeTransform {

  transform(value: EventWithStats): unknown {
    return value.categories.reduce((acc, category) => acc + category._count.streams, 0);
  }

}

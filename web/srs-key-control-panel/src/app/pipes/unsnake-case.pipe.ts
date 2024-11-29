import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'unsnakeCase',
  standalone: true
})
export class UnsnakeCasePipe implements PipeTransform {

  transform(value: string): string {
    return value.replace(/^_*(.)|_+(.)/g, (s, c, d) => c ? c.toUpperCase() : ' ' + d.toUpperCase())
  }

}

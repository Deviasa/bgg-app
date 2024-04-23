import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sort',
})
export class SortPipe implements PipeTransform {
  transform(array: Array<any> | undefined, args: any): Array<any> {
    array = array ? array : [];
    return array.sort((a, b) => {
      if (a[args.property] < b[args.property]) {
        return -1 * args.order;
      } else if (a[args.property] > b[args.property]) {
        return 1 * args.order;
      } else {
        return 0;
      }
    });
  }
}

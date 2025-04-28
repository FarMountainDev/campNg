import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pascalCaseToWords'
})
export class PascalCaseToWordsPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) {
      return value;
    }
    // This regex inserts a space before each uppercase letter (except at the start)
    return value.replace(/([A-Z])/g, ' $1').trim();
  }
}

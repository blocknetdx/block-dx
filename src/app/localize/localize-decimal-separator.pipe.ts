import { Pipe, PipeTransform } from '@angular/core';
import {Localize} from './localize.component';

@Pipe({
  name: 'localizeDecimalSeparator'
})
export class LocalizeDecimalSeparatorPipe implements PipeTransform {

  separator: string;

  constructor() {
    this.separator = Localize.decimalSeparator();
  }

  transform(value: any) {
    const { separator } = this;
    return separator === '.' ? value : value.replace('.', this.separator);
  }

}

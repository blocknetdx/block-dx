import { Pipe, PipeTransform } from '@angular/core';
import {Localize} from './localize.component';

@Pipe({
  name: 'localizeDecimalSeparator'
})
export class LocalizeDecimalSeparatorPipe implements PipeTransform {

  decimalSeparator: string;
  groupingSeparator: string;

  constructor() {
    this.decimalSeparator = Localize.decimalSeparator();
    this.groupingSeparator = Localize.groupingSeparator();
  }

  transform(value: any) {
    const { decimalSeparator, groupingSeparator } = this;
    if(decimalSeparator === '.') {
      return value;
    } else if(!/,/.test(value)) { // there are no grouping separators
      return value.replace('.', decimalSeparator);
    } else { // there are grouping separators
      let newVal = '';
      for(let i = value.length - 1; i > -1; i--) {
        if(value[i] === '.') {
          newVal = decimalSeparator + newVal;
        } else if(value[i] === ',') {
          newVal = groupingSeparator + newVal;
        } else {
          newVal = value[i] + newVal;
        }
      }
      return newVal;
    }
  }

}

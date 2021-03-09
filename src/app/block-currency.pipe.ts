import { Pipe, PipeTransform } from '@angular/core';
import {NumberFormatPipe} from './pipes/decimal.pipe';

@Pipe({
  name: 'blockCurrency'
})
export class BlockCurrencyPipe implements PipeTransform {

  constructor(private numberFormatPipe: NumberFormatPipe) {}

  transform(value: any, symbol: any, decimalMax, ignoreRemainingZeroes = false, decimalMinimum): any {
    const format = symbol !== 'USD' ? `1.${decimalMax}-${decimalMax}` : '1.2-2';
    let v = this.numberFormatPipe.transform(value,format);

    if(v && !ignoreRemainingZeroes) {
      // Add remaining zeroes afte the decimal into separate span for display purposes
      v = v.replace(/(0{2,})$/, '<span>$1</span>');
    }
    return v;
  }

}

import { Pipe, PipeTransform } from '@angular/core';
import {NumberFormatPipe} from './pipes/decimal.pipe';

@Pipe({
  name: 'blockCurrency'
})
export class BlockCurrencyPipe implements PipeTransform {

  constructor(private numberFormatPipe: NumberFormatPipe) {}

  transform(value: any, symbol: any, decimalMax, removeRemainingZeroes = false): any {
    const format = symbol !== 'USD' ? `1.${decimalMax}-${decimalMax}` : '1.2-2';
    let v = this.numberFormatPipe.transform(value,format);

    if(v && !removeRemainingZeroes) {
      // Add remaining zeroes afte the decimal into separate span for display purposes
      v = v.replace(/(0{2,})$/, '<span>$1</span>');
    } else if(v && /\./.test(v) && removeRemainingZeroes) {
      // Remove remaining zeroes after the decimal
      const final = v.length - 1;
      let begin;
      for(let i = final; i--; i > 0) {
        const char = v[i];
        if(char === '.') {
          begin = i + 2;
          break;
        } else if(char !== '0') {
          begin = i + 1;
          break;
        }
      }
      v = v.slice(0, begin);
    }
    return v;
  }

}

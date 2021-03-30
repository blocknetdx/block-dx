import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'numberFormat' })
export class NumberFormatPipe implements PipeTransform {

  toNumberString(num: number|string) {
    if(typeof num === 'string' && !/e/.test(num)) return num;
    const newNum = typeof num === 'number' ? num : Number(num);
    return newNum.toLocaleString('en', {useGrouping: false, maximumFractionDigits: 20});
  }

  transform(num: string = '0', format: string, noPadding = false): string {
    num = this.toNumberString(num);
    const formatPatt = /(\d+)\.(\d+)-(\d+)/;
    if(!formatPatt.test(format))
      throw new Error('Invalid format sent to decimal pipe.');
    const matches = format.match(formatPatt);
    const intMin = parseInt(matches[1], 10);
    const decMin = parseInt(matches[2], 10);
    const decMax = parseInt(matches[3], 10);
    let [int = '', dec = ''] = num.split('.');
    const intLen = int.length;
    const decLen = dec.length;
    if(int.length < intMin) {
      for(let i = 0; i < intMin - intLen; i++) {
        int = '0' + int;
      }
    }

    const hangingZeroesPatt = /0+$/;
    if(hangingZeroesPatt.test(dec))
      dec = dec.replace(hangingZeroesPatt, '');

    if(decMax === 0) return int;

    if(noPadding && decLen <= decMax) {
      while(dec.length < decMin) {
        dec += '0';
      }
      return int + '.' + dec;
    } else {
      let multiplierStr = '1';
      for(let i = 0; i < decMax; i++) {
        multiplierStr += '0';
      }
      const multiplier = Number(multiplierStr);
      return (Math.round(multiplier * Number(int + '.' + dec)) / multiplier).toFixed(decMax);
    }
  }
}

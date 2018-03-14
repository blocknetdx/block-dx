import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'numberFormat' })
export class NumberFormatPipe implements PipeTransform {
  transform(num: string = '0', format: string): string {
    num = String(num);
    const formatPatt = /(\d+)\.(\d+)-(\d+)/;
    if(!formatPatt.test(format)) throw new Error('Invalid format sent to decimal pipe.');
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

    if(decMax === 0) return int;

    if(dec.length < decMin) {
      for(let i = 0; i < decMin - decLen; i++) {
        dec = dec + '0';
      }
    } else {
      dec = dec.slice(0, decMax);
    }
    return int + '.' + dec;
  }
}

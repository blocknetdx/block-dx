import { Pipe, PipeTransform } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Pipe({
  name: 'blockCurrency'
})
export class BlockCurrencyPipe implements PipeTransform {

  constructor(private decimalPipe: DecimalPipe) {}

  transform(value: any, symbol?: any): any {
    const format = symbol !== "USD" ? "1.8-8" : "1.2-2";
    return this.decimalPipe.transform(value,format);
  }

}

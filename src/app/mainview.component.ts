import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AppService } from './app.service';
import { OrderbookService } from './orderbook.service';
import { OrderbookComponent } from './orderbook.component';

@Component({
  selector: 'app-mainview',
  templateUrl: './mainview.component.html',
  styleUrls: ['./mainview.component.scss']
})
export class MainviewComponent {
  @ViewChild('orderbook')
  public orderbook: OrderbookComponent;

  public orderCardIndex = 0; // Temporary FIXME
  public decimalOptions: any[];
  public initialDecimalIdx: number;

  constructor(
    private route: ActivatedRoute,
    private appService: AppService,
    private orderbookService: OrderbookService
  ) {
    this.decimalOptions = [
      {value: '8', viewValue:'8 decimals'},
      {value: '6', viewValue:'6 decimals'},
      {value: '4', viewValue:'4 decimals'},
      {value: '2', viewValue:'2 decimals'}
    ];
    const initialPriceDecimal = localStorage.getItem('priceDecimal') || '6';
    this.initialDecimalIdx = this.decimalOptions.findIndex(({ value }) => value === initialPriceDecimal);
  }

  onNavChange(list) {
    if (list.contains('book')) {
      this.orderbook.orderbookTable.scrollToMiddle();
    }
  }

  setPriceDecimal(num) {
    this.orderbookService.setPriceDecimal(num);
  }

}

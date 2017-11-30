import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AppService } from './app.service';
import { OrderbookComponent } from './orderbook.component';

@Component({
  selector: 'mainview',
  templateUrl: './mainview.component.html',
  styleUrls: ['./mainview.component.scss']
})
export class MainviewComponent {
  @ViewChild('orderbook')
  public orderbook: OrderbookComponent;

  public orderCardIndex: number = 0; // Temporary FIXME

  constructor(
    private route: ActivatedRoute,
    private appService: AppService
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      const pair = params['pair'];
      const symbols = pair ? pair.split('-') : ['ETH', 'BTC'];
      this.appService.updateMarketPair(symbols);
    });
  }

  onNavChange(list) {
    if (list.contains('book')) {
      this.orderbook.orderbookTable.scrollToMiddle();
    }
  }
}

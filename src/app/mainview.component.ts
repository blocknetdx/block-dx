import { Component, ViewChild, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AppService } from './app.service';
import { PricingService } from './pricing.service';
import { OrderbookService } from './orderbook.service';
import { OrderbookComponent } from './orderbook.component';

@Component({
  selector: 'app-mainview',
  templateUrl: './mainview.component.html',
  styleUrls: ['./mainview.component.scss']
})
export class MainviewComponent implements OnInit {
  @ViewChild('orderbook')
  public orderbook: OrderbookComponent;

  public orderCardIndex = 0; // Temporary FIXME
  public decimalOptions: any[];
  public initialDecimalIdx: number;
  public pricingEnabled = false;

  constructor(
    private route: ActivatedRoute,
    private appService: AppService,
    private orderbookService: OrderbookService,
    private pricingService: PricingService,
    private zone: NgZone
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

  ngOnInit() {
    this.pricingService.getPricingEnabled().subscribe(enabled => {
      this.zone.run(() => {
        this.pricingEnabled = enabled;
      });
    });
  }

  onNavChange(list) {
    if (list.contains('book')) {
      this.orderbook.orderbookTopTable.scrollToBottom();
    }
  }

  setPriceDecimal(num) {
    this.orderbookService.setPriceDecimal(num);
  }

  tooltip(id, displayType) {
    document.getElementById('tip-panel').style.display = displayType;
    document.getElementById(id).style.display = displayType;
  }

}

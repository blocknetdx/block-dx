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

  public balancesTooltipText = [
    'Balances only show for connected wallets. If you did not yet connect the wallet, in the right sidebar menu select Configuration Setup > Add Wallet.',
    'Balances only show available funds. If UTXOs are locked in the wallet, or used in trades, then they will not count towards the balance.',
    'Balances only show funds in legacy addresses. If you are using a Segwit address, please create a new address to send the funds to. A legacy address will automatically be created when generating a new address.',
    'Balances do not show staked funds. If you have been staking, please send the funds to a new address for them to register.'
  ].map(s => '\u2022 ' + s).join('\n');

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

}

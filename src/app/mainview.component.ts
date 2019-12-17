import { Component, ViewChild, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AppService } from './app.service';
import { PricingService } from './pricing.service';
import { OrderbookService } from './orderbook.service';
import { OrderbookComponent } from './orderbook.component';
import { BigTooltipComponent } from './big-tooltip/big-tooltip.component';
import { shouldHidePricing } from './util';
import {OrderbookViewService} from './orderbook.view.service';
import { OrderbookViews } from './enums';
import {Localize} from './localize/localize.component';

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
  public symbols:string[] = [];
  public OrderbookViews = OrderbookViews;

  public showBalancesTooltip = false;
  public showOrderFormTooltip = false;
  public showOrderBookTooltip = false;
  public showActiveInactiveOrderTooltip1 = false;
  public showActiveInactiveOrderTooltip2 = false;
  public showActiveInactiveOrderTooltip = false;

  shouldHidePricing = shouldHidePricing;

  public Localize = Localize;

  constructor(
    private route: ActivatedRoute,
    private appService: AppService,
    private orderbookService: OrderbookService,
    private pricingService: PricingService,
    private orderbookViewService: OrderbookViewService,
    private zone: NgZone
  ) {
    this.decimalOptions = [
      {value: '8', viewValue: Localize.text('8 decimals', 'mainview')},
      {value: '6', viewValue: Localize.text('6 decimals', 'mainview')},
      {value: '4', viewValue: Localize.text('4 decimals', 'mainview')},
      {value: '2', viewValue: Localize.text('2 decimals', 'mainview')}
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
    this.appService.marketPairChanges.subscribe((symbols) => {
      this.symbols = symbols;
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

  balancesTooltip(show) {
    this.showBalancesTooltip = show;
  }
  orderFormTooltip(show) {
    this.showOrderFormTooltip = show;
  }
  orderBookTooltip(show) {
    this.showOrderBookTooltip = show;
  }
  activeInactiveOrderTooltip1(show) {
    this.showActiveInactiveOrderTooltip1 = show;
    this.activeInactiveOrderTooltip();
  }
  activeInactiveOrderTooltip2(show) {
    this.showActiveInactiveOrderTooltip2 = show;
    this.activeInactiveOrderTooltip();
  }
  activeInactiveOrderTooltip() {
    if (this.showActiveInactiveOrderTooltip1 || this.showActiveInactiveOrderTooltip2) {
      this.showActiveInactiveOrderTooltip = true;
    } else {
      this.showActiveInactiveOrderTooltip = false;
    }
  }

  updateView(view) {
    this.orderbookViewService.orderbookView().next(view);
  }

  clearInactiveOrders(e) {
    e.preventDefault();
    window.electron.ipcRenderer.send('flushCancelledOrders');
  }

}

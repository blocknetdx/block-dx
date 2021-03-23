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
import {BigTooltipService} from './big-tooltip.service';

@Component({
  selector: 'app-mainview',
  templateUrl: './mainview.component.html',
  styleUrls: ['./mainview.component.scss']
})
export class MainviewComponent implements OnInit {
  @ViewChild('orderbook', {static: false})
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
  public showActiveInactiveOrderTooltip2 = false;
  public showActiveInactiveOrderTooltip = false;

  shouldHidePricing = shouldHidePricing;

  public Localize = Localize;

  tooltipDelay = 200;
  showBalancesTooltipTimeout = null;
  showOrderFormTooltipTimeout = null;
  showOrderBookTooltipTimeout = null;
  showActiveInactiveOrderTooltipTimeout = null;

  constructor(
    private route: ActivatedRoute,
    private appService: AppService,
    private orderbookService: OrderbookService,
    private pricingService: PricingService,
    private orderbookViewService: OrderbookViewService,
    private zone: NgZone,
    private bigTooltipService: BigTooltipService,
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
    this.bigTooltipService.bigTooltip().subscribe(({ tooltip, show }) => {
      this.showHideTooltip(tooltip, show);
    });
  }

  onNavChange(list) {
    if (list.contains('book')) {
      // this.orderbook.orderbookTopTable.scrollToBottom();
    }
  }

  setPriceDecimal(num) {
    this.orderbookService.setPriceDecimal(num);
  }

  showHideTooltip(tooltip: string, show: boolean) {
    const timeoutProp = `${tooltip}Timeout`;
    if(show) {
      this[timeoutProp] = setTimeout(() => {
        this[tooltip] = show;
      }, this.tooltipDelay);
    } else {
      clearTimeout(this[timeoutProp]);
      this[tooltip] = show;
    }
  }

  activeInactiveOrderTooltip1(show) {
    if(show) {
      this.showActiveInactiveOrderTooltipTimeout = setTimeout(() => {
        this.showActiveInactiveOrderTooltip2 = true;
        this.showActiveInactiveOrderTooltip = true;
      }, this.tooltipDelay);
    } else if(!this.showActiveInactiveOrderTooltip2) {
      clearTimeout(this.showActiveInactiveOrderTooltipTimeout);
      this.showActiveInactiveOrderTooltip = false;
    }
  }
  activeInactiveOrderTooltip2(show) {
    this.showActiveInactiveOrderTooltip2 = show;
    this.showActiveInactiveOrderTooltip = show;
  }

  updateView(view) {
    this.orderbookViewService.orderbookView().next(view);
  }

  clearInactiveOrders(e) {
    e.preventDefault();
    window.electron.ipcRenderer.send('flushCancelledOrders');
  }

}

import { Component, OnInit, Input, NgZone } from '@angular/core';
import * as math from 'mathjs';

import { AppService } from './app.service';
import { Trade } from './trade';
import { TradehistoryService } from './tradehistory.service';
import { PricingService } from './pricing.service';
import { Pricing } from './pricing';
import {Localize} from './localize/localize.component';

math.config({
  number: 'BigNumber',
  precision: 64
});

@Component({
  selector: 'app-tradehistory',
  templateUrl: './tradehistory.component.html',
  styleUrls: ['./tradehistory.component.scss']
  // providers: [TradehistoryService]
})
export class TradehistoryComponent implements OnInit {
  public tradehistory: Trade[];

  public symbols:string[] = [];
  public pricing: Pricing;
  public pricingEnabled = false;
  public pricingAvailable = false;
  public priceDecimal = '6';

  public Localize = Localize;

  constructor(
    private appService: AppService,
    private tradehistoryService: TradehistoryService,
    private pricingService: PricingService,
    private zone: NgZone
  ) {}

  ngOnInit() {
    const { zone } = this;
    this.appService.marketPairChanges.subscribe((symbols) => {
      zone.run(() => {
        this.symbols = symbols;
      });
    });

    // Just some sample data for checking UI
    // const sampleData = [
    //   {time: new Date().toISOString(), trade_id: '12345', price: '.025', size: '4', side: 'buy'},
    //   {time: new Date().toISOString(), trade_id: '23451', price: '.025', size: '5', side: 'buy'},
    //   {time: new Date().toISOString(), trade_id: '34512', price: '.033', size: '1', side: 'sell'},
    //   {time: new Date().toISOString(), trade_id: '45123', price: '.025', size: '4', side: 'sell'},
    //   {time: new Date().toISOString(), trade_id: '54321', price: '.025', size: '4', side: 'buy'},
    //   {time: new Date().toISOString(), trade_id: '23456', price: '.025', size: '5', side: 'buy'},
    //   {time: new Date().toISOString(), trade_id: '34562', price: '.033', size: '1', side: 'sell'},
    //   {time: new Date().toISOString(), trade_id: '45623', price: '.025', size: '4', side: 'sell'}]
    //   .map(t => Trade.fromObject(t));
    // this.tradehistory = sampleData;

    this.tradehistoryService.getTradehistory()
      .subscribe(tradehistory => {
        zone.run(() => {
          this.tradehistory = tradehistory;
        });
      });

    this.pricingService.getPricing().subscribe(pricing => {
      zone.run(() => {
        this.pricing = pricing;
        this.pricingAvailable = pricing.enabled;
      });
    });
    this.pricingService.getPricingEnabled().subscribe(enabled => {
      zone.run(() => {
        this.pricingEnabled = enabled;
      });
    });
  }

  onRowContextMenu({ row, clientX, clientY }) {
    const { Menu } = window.electron.remote;
    const { clipboard, ipcRenderer } = window.electron;

    const orderId = row.trade_id;
    const menuTemplate = [];

    menuTemplate.push({
      label: Localize.text('Copy Order ID', 'tradehistory'),
      click: () => {
        clipboard.writeText(orderId);
      }
    });
    menuTemplate.push({
      label: Localize.text('View Details', 'tradehistory'),
      click: () => {
        ipcRenderer.send('openOrderHistoryDetailsWindow', orderId);
      }
    });

    const menu = Menu.buildFromTemplate(menuTemplate);
    menu.popup({x: clientX, y: clientY});
  }

}

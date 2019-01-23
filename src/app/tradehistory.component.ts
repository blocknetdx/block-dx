import { Component, OnInit, Input, NgZone } from '@angular/core';
import * as math from 'mathjs';
import * as moment from 'moment';

import { AppService } from './app.service';
import { Trade } from './trade';
import { TradehistoryService } from './tradehistory.service';
import { NumberFormatPipe } from './pipes/decimal.pipe';
import { PricingService } from './pricing.service';
import { Pricing } from './pricing';

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

  calculatePairPrice(total, size) {
    //return math.round(math.divide(total, size),6);
    return math.divide(total, size).toFixed(6);
  }

  prepareNumber(num) {
    return math.round(num, 6);
  }

  datetimeFormat(datetime) {
    //datetime format: 2019-01-18T21:18:05.005537Z
    if (moment(new Date()).format('MMM DD')==moment(datetime).format('MMM DD')) {
      // if today, show hr:min:s:ms format
      return moment(datetime).format('HH:mm:ss');
    } else {
      // if not today, show month-day-hr:min format
      return moment(datetime).format('MMM DD HH:mm');
    }
  }
}

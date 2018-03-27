import { Component, OnInit, Input, NgZone } from '@angular/core';

import { AppService } from './app.service';
import { Trade } from './trade';
import { TradehistoryService } from './tradehistory.service';

@Component({
  selector: 'app-tradehistory',
  templateUrl: './tradehistory.component.html',
  styleUrls: ['./tradehistory.component.scss']
  // providers: [TradehistoryService]
})
export class TradehistoryComponent implements OnInit {
  public tradehistory: Trade[];

  public symbols:string[] = [];

  constructor(
    private appService: AppService,
    private tradehistoryService: TradehistoryService,
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
  }
}

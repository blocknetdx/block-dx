import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { WebSocketService } from './web-socket.service';

@Injectable()
export class AppService {

  public marketPairChanges: BehaviorSubject<string[]> = new BehaviorSubject(null);

  constructor(private wsService: WebSocketService) {
    // this.wsService.connect('wss://ws-feed.gdax.com')
    //   .subscribe((data) => {
    //     console.log('connect', JSON.parse(data.data));
    //   }, (e) => console.log('error', e));
    //
    // setTimeout(() => {
    //   this.wsService.socket.next({
    //     type: "subscribe",
    //     product_ids: [
    //       "ETH-USD",
    //     ],
    //     "channels": [
    //       "level2",
    //       "heartbeat",
    //     ]
    //   });
    //
    //   setTimeout(() => {
    //     this.wsService.socket.next({
    //       type: "unsubscribe",
    //       product_ids: [
    //         "ETH-USD",
    //       ],
    //       "channels": [
    //         "level2",
    //         "heartbeat",
    //       ]
    //     });
    //   }, 1000);
    // }, 2500);
  }

  public updateMarketPair(pair: string[]) {
    this.marketPairChanges.next(pair);
  }
}

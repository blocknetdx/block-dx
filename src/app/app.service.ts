import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { WebSocketService } from './web-socket.service';

@Injectable()
export class AppService {

  public marketPairChanges: BehaviorSubject<string[]> = new BehaviorSubject(null);

  constructor(private wsService: WebSocketService) {

    this.marketPairChanges = Observable.create(observer => {
      try {

        window.electron.ipcRenderer.on('keyPair', (e, pair) => {
          observer.next(pair);
        });

        window.electron.ipcRenderer.send('getKeyPair');

      } catch(err) {
        console.error(err);
      }
    });

    // this.wsService.connect('wss://ws-feed.gdax.com')
    //   .subscribe((data) => {
    //     if (data.type) {
    //       if (data.type === 'open') {
    //         this.wsService.socket.next({
    //           type: "subscribe",
    //           product_ids: [
    //             "ETH-USD",
    //           ],
    //           "channels": [
    //             "level2",
    //             "heartbeat",
    //           ]
    //         });
    //
    //         setTimeout(() => {
    //           this.wsService.socket.next({
    //             type: "unsubscribe",
    //             product_ids: [
    //               "ETH-USD",
    //             ],
    //             "channels": [
    //               "level2",
    //               "heartbeat",
    //             ]
    //           });
    //         }, 1000);
    //
    //       } else if (data.type === 'message') {
    //         const d = JSON.parse(data.data);
    //         // console.log(d.type);
    //         if (d.type === 'subscriptions') {
    //           console.log(d);
    //         }
    //       }
    //     }
    //   }, (e) => console.log('error', e));
  }

  public updateMarketPair(pair: string[]) {
    window.electron.ipcRenderer.send('setKeyPair', pair);
    // this.marketPairChanges.next(pair);
  }
}

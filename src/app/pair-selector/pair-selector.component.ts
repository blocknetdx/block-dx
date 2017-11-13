import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import { fadeInOut } from '../animations';

@Component({
  selector: 'app-pair-selector',
  templateUrl: './pair-selector.component.html',
  styleUrls: ['./pair-selector.component.scss'],
  animations: [fadeInOut]
})
export class PairSelectorComponent implements OnInit {

  symbols: string[] = ['ETH', 'BTC'];
  active: boolean;

  rows: any[] = [

  ];

  constructor() { }

  ngOnInit() {
    this.rows = Array.from(Array(10)).map((obj) => {
      return {
        coin: 'ABC',
        currency: 'Bitcoin',
        last_price: 0.00020220,
        volume: 30003,
        change: 1.508,
        section: 'My Wallet'
      }
    });
    console.log(this.rows);
  }

}

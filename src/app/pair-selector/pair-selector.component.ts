import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import { fadeInOut } from '../animations';

@Component({
  selector: 'app-pair-selector',
  templateUrl: './pair-selector.component.html',
  styleUrls: ['./pair-selector.component.scss'],
  animations: [fadeInOut]
})
export class PairSelectorComponent implements OnInit {

  public active: boolean;
  public symbols: string[] = ['ETH', 'BTC'];
  public rows: any[];
  public model: {coinA?: string, coinB?: string};

  constructor() { }

  ngOnInit() {
    this.model = {};
    this.rows = Array.from(Array(50)).map((obj, idx) => {
      return {
        coin: makeid(),
        currency: 'Bitcoin',
        last_price: 0.00020220,
        volume: 30003,
        change: 1.508,
        section: idx <= 8 ? 'My Wallet' : 'All Coins'
      }
    });
  }

  onRowSelect(row) {
    console.log('Row selected', row.coin);
  }

  onSubmit() {
    console.log('submit form', this.model);
  }

}

function makeid() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  for (var i = 0; i < 3; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

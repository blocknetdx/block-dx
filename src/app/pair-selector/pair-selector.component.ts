import {
  Component, OnInit, ViewEncapsulation,
  ElementRef, ViewChildren, QueryList
} from '@angular/core';

import { fadeInOut } from '../animations';

@Component({
  selector: 'app-pair-selector',
  templateUrl: './pair-selector.component.html',
  styleUrls: ['./pair-selector.component.scss'],
  animations: [fadeInOut]
})
export class PairSelectorComponent implements OnInit {
  @ViewChildren('input') public inputs: QueryList<ElementRef>;

  public symbols: string[] = ['ETH', 'BTC'];
  public rows: any[];
  public filteredRows: any[];
  public model: {coinA?: string, coinB?: string};
  public activeInputKey: string;
  public coinASuggest: string;
  public coinBSuggest: string;

  private _active: boolean;
  public get active(): boolean { return this._active; }
  public set active(val: boolean) {
    this._active = val;
    this.model = {};
    if (val) {
      setTimeout(() => {
        this.inputs.first.nativeElement.focus();
      });
    }
  }

  constructor() { }

  ngOnInit() {
    this.rows = Array.from(Array(50)).map((obj, idx) => {
      return {
        coin: makeid(),
        currency: nameGenerator(),
        last_price: 0.00020220,
        volume: 30003,
        change: 1.508,
        section: idx <= 8 ? 'My Wallet' : 'All Coins'
      }
    });
    this.filteredRows = this.rows;
  }

  filterCoins(key: string, val: string) {
    this.model[key] = val;

    this.filteredRows = this.rows.filter((row) => {
      if (val.length <= 0) return true;
      const coinIdx = row.coin.toLowerCase().indexOf(val.toLowerCase());
      const currencyIdx = row.currency.toLowerCase().indexOf(val.toLowerCase());
      return coinIdx >= 0 || currencyIdx >= 0;
    });
    if (this.filteredRows.length > 0 && val.length >= 2) {
      this[key+'Suggest'] = this.filteredRows[0].coin;
    } else {
      this[key+'Suggest'] = '';
    }
  }

  onRowSelect(row) {
    if (this.activeInputKey) {
      this.model[this.activeInputKey] = row.coin;
      if (this.activeInputKey === 'coinA') {
        setTimeout(() => {
          this.inputs.last.nativeElement.focus();
        });
      } else {
        this.activeInputKey = null;
      }
    }
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

function nameGenerator() {
  var things = ['basin','minute','certain','callous','judicious','deranged','worm','enchanting','gabby','skinny','iron','motion','ahead','excited','medical','leather','mist','secretive','ripe','terrify','supreme','plough','mellow','inquisitive','quill'];
  var thing = things[Math.floor(Math.random()*things.length)];
  return thing;
}

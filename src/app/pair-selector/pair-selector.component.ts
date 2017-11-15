import {
  Component, ViewChild,
  ElementRef, ViewChildren, QueryList
} from '@angular/core';

import { fadeInOut } from '../animations';
import { TableComponent } from '../table/table.component';
import { CryptocurrencyService } from '../cryptocurrency.service';

@Component({
  selector: 'app-pair-selector',
  templateUrl: './pair-selector.component.html',
  styleUrls: ['./pair-selector.component.scss'],
  animations: [fadeInOut]
})
export class PairSelectorComponent {
  @ViewChild('pairTable') public pairTable: TableComponent;
  @ViewChild('submit') public submit: ElementRef;
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

  constructor(
    private cryptoService: CryptocurrencyService
  ) { }

  ngOnInit() {
    this.cryptoService.getCurrencies().first()
      .subscribe((data) => {
        this.rows = data.map((coin) => {
          return {
            coin: coin.symbol,
            currency: coin.name,
            last_price: coin.last,
            volume: coin.volume,
            change: coin.change,
            section: 'All Coins'
          };
        });

        this.filteredRows = this.rows;
      });

    // this.rows = Array.from(Array(50)).map((obj, idx) => {
    //   return {
    //     coin: makeid(),
    //     currency: nameGenerator(),
    //     last_price: 0.00020220,
    //     volume: 30003,
    //     change: 1.508,
    //     section: idx <= 8 ? 'My Wallet' : 'All Coins'
    //   }
    // });
    // this.filteredRows = this.rows;
  }

  filterCoins(key: string, val: string) {
    this.model[key] = val;

    this.filteredRows = this.rows.filter((row) => {
      if (val.length <= 0) return true;
      const coinIdx = row.coin.toLowerCase().indexOf(val.toLowerCase());
      const currencyIdx = row.currency.toLowerCase().indexOf(val.toLowerCase());
      return coinIdx >= 0 || currencyIdx >= 0;
    });
  }

  onArrowDown(e) {
    if (e) e.preventDefault();
    this.pairTable.focusNextRow();
  }

  onRowSelect(row) {
    if (this.activeInputKey) {
      this.model[this.activeInputKey] = row;
      if (this.activeInputKey === 'coinA') {
        setTimeout(() => {
          this.inputs.last.nativeElement.focus();
        });
      } else if (this.activeInputKey === 'coinB') {
        setTimeout(() => {
          this.submit.nativeElement.focus();
        });
      } else {
        this.activeInputKey = null;
      }
    }
  }

  formatRow(row) {
    if (typeof row === 'object') {
      return `${row.currency.capitalize()} (${row.coin.toUpperCase()})`
    } else if(typeof row === 'string') {
      return row;
    }
    return null;
  }

  onSubmit() {
    console.log('submit form', this.model);
  }

}

/**
 * Temporary
 */
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

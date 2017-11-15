import {
  Component, ViewChild,
  ElementRef, ViewChildren, QueryList
} from '@angular/core';

import { fadeInOut } from '../animations';
import { TableComponent } from '../table/table.component';
import { CryptocurrencyService } from '../cryptocurrency.service';
import { Cryptocurrency } from '../cryptocurrency';

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
  public model: {coinA?: Cryptocurrency, coinB?: Cryptocurrency};
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
        const user_wallet = data.slice(0,5).map((coin) => {
          return Object.assign({}, coin, { section: 'My Wallet'});
        });
        const all_coins = data.map((coin) => {
          return Object.assign({}, coin, {section: 'All Coins'});
        });

        this.rows = [...user_wallet, ...all_coins];

        this.filteredRows = this.rows;
      });
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
      return `${row.name.capitalize()} (${row.symbol.toUpperCase()})`
    } else if(typeof row === 'string') {
      return row;
    }
    return null;
  }

  onSubmit() {
    console.log('submit form', this.model);
  }

}

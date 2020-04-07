import {
  Component, ViewChild, ElementRef, EventEmitter,
  ViewChildren, QueryList, Output, OnInit, NgZone, AfterViewInit
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subject } from 'rxjs/Subject';

import { AppService } from '../app.service';
import { fadeInOut } from '../animations';
import { TableComponent } from '../table/table.component';
import { TableColumnDirective } from '../table/table-column.directive';
import { CryptocurrencyService } from '../cryptocurrency.service';
import { Cryptocurrency } from '../cryptocurrency';
import { AppConstants } from '../constants';
import { briefTimeout } from '../util';
import {Localize} from '../localize/localize.component';
import { renderSwitch } from '../modules/render-switch';

@Component({
  selector: 'app-pair-selector',
  templateUrl: './pair-selector.component.html',
  styleUrls: ['./pair-selector.component.scss'],
  animations: [fadeInOut]
})
export class PairSelectorComponent implements OnInit, AfterViewInit {
  @ViewChild('pairTable') public pairTable: TableComponent;
  @ViewChild('submit') public submit: ElementRef;
  @ViewChild('pairForm') public pairForm: NgForm;
  @ViewChildren('input') public inputs: QueryList<ElementRef>;

  @Output()
  public onActiveStatus: EventEmitter<boolean> = new EventEmitter();

  public Localize = Localize;

  public get symbols(): string[] {
    let _s = this._loadedSymbols;
    if (this.state === 'stage2') _s = [this.model.coinA.symbol, '___'];
    if (this.state === 'stage3') _s = [this.model.coinA.symbol, this.model.coinB.symbol];
    return _s;
  }

  public filteredRows: any[];
  public model: {coinA?: any, coinB?: any} = {coinA: '', coinB: ''};
  public activeInputKey = 'coinA';
  public coinASuggest: string;
  public coinBSuggest: string;

  public coinAValid = false;
  public coinBValid = false;

  private get connectedTokensLabel() {
    return Localize.text('Connected Assets', 'pairSelector');
  }
  private get allTokensLabel() {
    return Localize.text('All Assets', 'pairSelector');
  }

  public showBody = true;

  public get sections(): any[] {
    let arr;
    switch(this.state) {
      case 'stage1' :
        arr = [
          {title: this.connectedTokensLabel + ' ' + this.refreshButtonMarkup(), rows: this._userWallet},
          {title: this.allTokensLabel, rows: PairSelectorComponent.uniqueCoinsNotIn(this._allCoins, this._userWallet)}
        ];
        break;
      case 'stage2' :
      case 'stage3' :
        arr = [
          {title: this.connectedTokensLabel + ' ' + this.refreshButtonMarkup(), rows: this._userWallet.filter(c => c.symbol !== this.model.coinA.symbol)},
          {title: this.allTokensLabel, rows: PairSelectorComponent.uniqueCoins(this._allCoins.filter(c => c.symbol !== this.model.coinA.symbol))}
        ];
        break;
    }
    return arr;
  }

  public comparisons: any[] = [];
  public filteredComparisons: any[] = [];

  private _userWallet: any[];
  private _allCoins: any[];
  private _loadedSymbols: string[];
  private _controlStatus: Subject<boolean> = new Subject();

  private _state = 'stage1';
  public get state(): string { return this._state; }
  public set state(val: string) {
    this._state = val;
  }

  private _active: boolean;
  public get active(): boolean { return this._active; }
  public set active(val: boolean) {
    this._active = val;
    this.model = {};
    if (val) {
      setTimeout(() => {
        // this.pairTable.sort(this.pairTable.columns[3]);
        this.inputs.first.nativeElement.focus();
      }, 0);
    } else {
      this.state = 'stage1';
      this._controlStatus.next(true);
      this.filterCoins('coinA', '');
      this.filterCoins('coinB', '');
      this.resetModel('coinA');
    }
    this.onActiveStatus.emit(val);
  }

  /**
   * All unique coins (prefer local).
   * @param coins
   */
  private static uniqueCoins(coins: any[]): any[] {
    const hash = {};
    coins.forEach(coin => {
      if (hash[coin.symbol] && !coin.local)
        return;
      hash[coin.symbol] = coin;
    });
    const arr = [];
    Object.keys(hash).forEach(key => {
      arr.push(hash[key]);
    });
    return arr;
  }

  /**
   * All unique coins not in the specified collection. (prefer local)
   * @param coins
   * @param notIn
   */
  private static uniqueCoinsNotIn(coins: any[], notIn: any[]): any[] {
    const hashNotIn = {};
    notIn.forEach(coin => {
      hashNotIn[coin.symbol] = coin;
    });
    const hash = {};
    coins.forEach(coin => {
      if ((hash[coin.symbol] && !coin.local) && !hashNotIn[coin.symbol])
        return;
      hash[coin.symbol] = coin;
    });
    const arr = [];
    Object.keys(hash).forEach(key => {
      arr.push(hash[key]);
    });
    return arr;
  }

  constructor(
    private appService: AppService,
    private cryptoService: CryptocurrencyService,
    private zone: NgZone
  ) {
    this.onRefreshWalletsClick = this.onRefreshWalletsClick.bind(this);
  }

  ngOnInit() {
    this.appService.marketPairChanges.subscribe((symbols) => {
      this.zone.run(() => {
        this._loadedSymbols = symbols;
      });
    });
    this.cryptoService.getTokens()
      .subscribe((data) => {
        this.zone.run(() => {
          this._userWallet = data
            .filter(c => c.local);
          this._allCoins = data;

          this.filteredRows = this.sections;
          this.registerRefreshClickEvent();
        });
      });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      const isFirstRun = window.electron.ipcRenderer.sendSync('isFirstRun');
      this._loadedSymbols = window.electron.ipcRenderer.sendSync('getKeyPairSync');
      if(isFirstRun)  window.electron.ipcRenderer.send('openInformation');
      if(isFirstRun || !this._loadedSymbols || this._loadedSymbols[0] === null || /^\s*$/.test(this._loadedSymbols[0]))
        this.active = true;
    }, 0);

    this.onActiveStatus.subscribe(async function(active) {
      // if pair selector is opening
      if(active) {
        await briefTimeout();
        this.registerRefreshClickEvent();
      }
    }.bind(this));
  }

  refreshButtonMarkup(): String {
    return `<a href="#" style="color:#8e98a4;" class="js-refreshWallets refresh-wallets-button" title="${this.Localize.text('Refresh wallets', 'pairSelector')}"><i class="material-icons refresh-wallets-icon">refresh</i></a>`;
  }

  async registerRefreshClickEvent() {
    await briefTimeout();
    const element = document.querySelector('.js-refreshWallets');
    if(!element) return;
    element.removeEventListener('click', this.onRefreshWalletsClick);
    element.addEventListener('click', this.onRefreshWalletsClick);
  }

  onRefreshWalletsClick(e) {
    e.preventDefault();
    this.refreshBalances();
  }

  filterCoins(key: string, val: string) {
    this.model[key] = val;
    if(key === 'coinA') {
      this.filteredRows = this.sections.map((section) => {
        return Object.assign({}, section, {
          rows: section.rows.filter(row => {
            if (val.length <= 0) return true;
            const coinIdx = row.symbol.toLowerCase().indexOf(val.toLowerCase());
            const currencyIdx = row.name.toLowerCase().indexOf(val.toLowerCase());
            return coinIdx >= 0 || currencyIdx >= 0;
          })
        });
      });
    } else if(key === 'coinB') {
      this.filteredComparisons = this.comparisons.map((section) => {
        return Object.assign({}, section, {
          rows: section.rows.filter((row) => {
            if (val.length <= 0) return true;
            const coinIdx = row.symbol.toLowerCase().indexOf(val.toLowerCase());
            const currencyIdx = row.name.toLowerCase().indexOf(val.toLowerCase());
            return coinIdx >= 0 || currencyIdx >= 0;
          })
        });
      });
    }
  }

  onArrowDown(e) {
    if (e) e.preventDefault();
    this.pairTable.focusNextRow();
  }

  onRowSelect(row) {
    const { activeInputKey } = this;
    if (row && activeInputKey) {
      this.model[activeInputKey] = row;
      this[activeInputKey + 'Valid'] = true;
      if(activeInputKey === 'coinA') {
        this.activeInputKey = 'coinB';
        const data = this.currencyComparisons(row.symbol);
        this.zone.run(() => {
          const userTokens = new Set(this._userWallet.map(t => t.symbol));
          const connectedTokens = [];
          const otherTokens = [];
          for(const t of data) {
            if(userTokens.has(t.symbol)) {
              connectedTokens.push(t);
            } else {
              otherTokens.push(t);
            }
          }
          this.comparisons = [
            {title: this.connectedTokensLabel, rows: connectedTokens},
            {title: this.allTokensLabel, rows: otherTokens}
          ];
          this.filteredComparisons = this.comparisons;
          setTimeout(() => this.inputs.last.nativeElement.focus(), 0);
        });
      }
    }
  }

  resetModel(coin) {
    if (coin === 'coinA') {
      this.model = {};
      this.state = 'stage1';
      this.activeInputKey = 'coinA';
      this.coinAValid = false;
      this.coinBValid = false;
      this.inputs.first.nativeElement.focus();
      this.registerRefreshClickEvent();
    } else if (coin === 'coinB') {
      this.model.coinB = '';
      this.coinBValid = false;
      this.inputs.last.nativeElement.focus();
      this.state = 'stage2';
    }
    this.filteredRows = this.sections;
    this.pairTable.rowSelected(null);
  }

  currencyComparisons(symbol) {
    return PairSelectorComponent.uniqueCoinsNotIn(this._allCoins
      .filter(coin => coin.symbol !== symbol), this._userWallet);
  }

  formatRow(row) {
    if (typeof row === 'object') {
      return `${row.name.capitalize()} (${row.symbol.toUpperCase()})`;
    } else if(typeof row === 'string') {
      return row;
    }
    return null;
  }

  async onSubmit() {
    const a: string = this.model.coinA.symbol;
    const b: string = this.model.coinB.symbol;

    const tokenArr = [a, b];

    const { ipcRenderer } = window.electron;
    const approved = ipcRenderer.sendSync('checkTokensAgainstManifest', tokenArr);
    let doNotShowWarningPairs = ipcRenderer.sendSync('getDoNotShowWarningAssetPairs');
    doNotShowWarningPairs = [
      ...doNotShowWarningPairs,
      ...doNotShowWarningPairs.map(arr => [...arr].reverse())
    ];
    const notVerified = tokenArr.filter(t => !approved[t]);

    if(notVerified.length > 0 && !doNotShowWarningPairs.some(([t0, t1]) => t0 === a && t1 === b)) {
      const notShowAgain = await renderSwitch.send('openUnverifiedAssetWindow', notVerified);
      if(notShowAgain) ipcRenderer.send('addToDoNotShowWarningAssetPairs', tokenArr);
    }

    window.electron.ipcRenderer.send('setKeyPair', tokenArr);
    this.active = false;
  }

  async refreshBalances() {
    this.showBody = false;
    window.electron.ipcRenderer.send('refreshBalances');
    await briefTimeout(AppConstants.refreshBalancesTimeout);
    this.zone.run(() => {
      this.showBody = true;
      this.registerRefreshClickEvent();
    });
  }

}

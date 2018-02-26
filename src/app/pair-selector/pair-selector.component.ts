import {
  Component, ViewChild, ElementRef, EventEmitter,
  ViewChildren, QueryList, Output, OnInit
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subject } from 'rxjs/Subject';

import { AppService } from '../app.service';
import { fadeInOut } from '../animations';
import { TableComponent } from '../table/table.component';
import { TableColumnDirective } from '../table/table-column.directive';
import { CryptocurrencyService } from '../cryptocurrency.service';
import { Cryptocurrency } from '../cryptocurrency';

@Component({
  selector: 'app-pair-selector',
  templateUrl: './pair-selector.component.html',
  styleUrls: ['./pair-selector.component.scss'],
  animations: [fadeInOut]
})
export class PairSelectorComponent implements OnInit {
  @ViewChild('pairTable') public pairTable: TableComponent;
  @ViewChild('submit') public submit: ElementRef;
  @ViewChild('pairForm') public pairForm: NgForm;
  @ViewChildren('input') public inputs: QueryList<ElementRef>;

  @Output('onActiveStatus')
  public onActiveStatus: EventEmitter<boolean> = new EventEmitter();

  public get symbols(): string[] {
    let _s = this._loadedSymbols;
    if (this.state === 'stage2') _s = [this.model.coinA.symbol, '___'];
    if (this.state === 'stage3') _s = [this.model.coinA.symbol, this.model.coinB.symbol];
    return _s;
  }

  public filteredRows: any[];
  public model: {coinA?: any, coinB?: any};
  public activeInputKey: string;
  public coinASuggest: string;
  public coinBSuggest: string;

  public get sections(): any[] {
    let arr;
    switch(this.state) {
      case 'stage1' :
        arr = [
          {title: 'My Wallet', rows: this._userWallet},
          {title: 'All Coins', rows: this._allCoins}
        ];
        break;
      case 'stage2' :
      case 'stage3' :
        arr = [{
          rows: this._allCoins
            .filter(c => c.symbol !== this.model.coinA.symbol)
        }];
        break;
    }
    console.log('filtered sections', arr);
    return arr;
  }

  public comparisons: any[] = [];

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
        Object.keys(this.pairForm.controls).forEach((key) => {
          const control = this.pairForm.controls[key];
          control.statusChanges.takeUntil(this._controlStatus)
            .subscribe((status) => {
              if (status === 'VALID') {
                if (key === 'coinA') {
                  this.state = 'stage2';
                  this.filteredRows = this.sections;
                  this.pairTable.rowSelected(null);
                  setTimeout(() => {
                    this.inputs.last.nativeElement.focus();
                  });
                } else if (key === 'coinB') {
                  this.state = 'stage3';
                  setTimeout(() => {
                    this.submit.nativeElement.focus();
                  });
                }
              }
            });
        });
        this.pairTable.sort(this.pairTable.columns[3]);
        this.inputs.first.nativeElement.focus();
      });
    } else {
      this.state = 'stage1';
      this._controlStatus.next(true);
      this.filterCoins('coinA', '');
    }
    this.onActiveStatus.emit(val);
  }

  constructor(
    private appService: AppService,
    private cryptoService: CryptocurrencyService
  ) { }

  ngOnInit() {
    this.appService.marketPairChanges.subscribe((symbols) => {
      this._loadedSymbols = symbols;
    });
    this.cryptoService.getCurrencies()
      .subscribe((data) => {
        this._userWallet = data
          .filter(c => c.local);
        this._allCoins = data;

        this.filteredRows = this.sections;
      });
  }

  filterCoins(key: string, val: string) {
    this.model[key] = val;

    this.filteredRows = this.sections.map((section) => {
      section.rows = section.rows.filter((row) => {
        if (val.length <= 0) return true;
        const coinIdx = row.symbol.toLowerCase().indexOf(val.toLowerCase());
        const currencyIdx = row.name.toLowerCase().indexOf(val.toLowerCase());
        return coinIdx >= 0 || currencyIdx >= 0;
      });
      return section;
    });
  }

  onArrowDown(e) {
    if (e) e.preventDefault();
    this.pairTable.focusNextRow();
  }

  onRowSelect(row) {
    const { activeInputKey } = this;
    if (row && activeInputKey) {
      this.model[activeInputKey] = row;
      if(activeInputKey === 'coinA') {
        this.activeInputKey = 'coinB';

        this.cryptoService.getCurrencyComparisons(row.symbol)
          .subscribe(data => {
            console.log('comparisons', data);
            this.comparisons = [{rows: data}];
          });

      }
    }
  }

  resetModel(coin) {
    if (coin === 'coinA') {
      this.model = {};
      this.inputs.first.nativeElement.focus();
      this.state = 'stage1';
    } else if (coin === 'coinB') {
      this.model.coinB = '';
      this.inputs.last.nativeElement.focus();
      this.state = 'stage2';
    }
    this.filteredRows = this.sections;
    this.pairTable.rowSelected(null);
  }

  formatRow(row) {
    if (typeof row === 'object') {
      return `${row.name.capitalize()} (${row.symbol.toUpperCase()})`;
    } else if(typeof row === 'string') {
      return row;
    }
    return null;
  }

  onSubmit() {
    console.log(this.model);
    const a: string = this.model.coinA.symbol;
    const b: string = this.model.coinB.symbol;
    // this.router.navigate(['/trading', `${a}-${b}`]);
    this.active = false;
  }

}

import {
  Component, ViewChild, ElementRef, EventEmitter,
  ViewChildren, QueryList, Output
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
export class PairSelectorComponent {
  @ViewChild('pairTable') public pairTable: TableComponent;
  @ViewChild('submit') public submit: ElementRef;
  @ViewChild('pairForm') public pairForm: NgForm;
  @ViewChildren('input') public inputs: QueryList<ElementRef>;

  @Output('onActiveStatus')
  public onActiveStatus: EventEmitter<boolean> = new EventEmitter();

  public symbols: string[];
  public rows: any[];
  public filteredRows: any[];
  public model: {coinA?: any, coinB?: any};
  public activeInputKey: string;
  public coinASuggest: string;
  public coinBSuggest: string;

  private _rawData: any[];
  private _controlStatus: Subject<boolean> = new Subject();

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
                  setTimeout(() => {
                    this.inputs.last.nativeElement.focus();
                  });
                } else if (key === 'coinB') {
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
      this._controlStatus.next(true);
    }
    this.onActiveStatus.emit(val);
  }

  constructor(
    private appService: AppService,
    private cryptoService: CryptocurrencyService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.appService.marketPairChanges.subscribe((symbols) => {
      this.symbols = symbols;
    });
    this.cryptoService.getCurrencies().first()
      .subscribe((data) => {
        this._rawData = data;
        
        const user_wallet = data.slice(0,5).map((coin) => {
          return Object.assign({section: 'My Wallet'}, coin);
        });
        const all_coins = data.map((coin) => {
          return Object.assign({section: 'All Coins'}, coin);
        });

        this.rows = [...user_wallet, ...all_coins];

        this.filteredRows = this.rows;
      });
  }

  filterCoins(key: string, val: string) {
    this.model[key] = val;

    this.filteredRows = this.rows.filter((row) => {
      if (val.length <= 0) return true;
      const coinIdx = row.symbol.toLowerCase().indexOf(val.toLowerCase());
      const currencyIdx = row.name.toLowerCase().indexOf(val.toLowerCase());
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
    }
  }

  resetModel(coin) {
    if (coin === 'coinA') {
      this.model = {};
      this.inputs.first.nativeElement.focus();
    } else if (coin === 'coinB') {
      this.model.coinB = '';
      this.inputs.last.nativeElement.focus();
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
    const a: string = this.model.coinA.symbol;
    const b: string = this.model.coinB.symbol;
    this.router.navigate(['/trading', `${a}-${b}`]);
    this.active = false;
  }

}

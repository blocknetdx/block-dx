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

  @Output('onActiveStatus')
  public onActiveStatus: EventEmitter<boolean> = new EventEmitter();

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

  private coinAValid = false;
  private coinBValid = false;

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
        this.pairTable.sort(this.pairTable.columns[3]);
        this.inputs.first.nativeElement.focus();

        /*console.log(this.inputs);
        debugger;
        Object.keys(this.pairForm.controls).forEach((key) => {
          if(key === 'coinA' && this.coinAValid) {
            this.state = 'stage2';
            this.filteredRows = this.sections;
            this.pairTable.rowSelected(null);
            setTimeout(() => {
              console.log(this.inputs[1]);
              this.inputs._results[1].focus();
              // this.inputs.last.nativeElement.focus();
            }, 100);
          } else if (key === 'coinB' && this.coinBValid) {
            this.state = 'stage3';
            setTimeout(() => {
              this.submit.nativeElement.focus();
            }, 0);
          }
        });*/
      }, 0);

      // setTimeout(() => {
      //   Object.keys(this.pairForm.controls).forEach((key) => {
      //     const control = this.pairForm.controls[key];
      //     control.statusChanges.takeUntil(this._controlStatus)
      //       .subscribe((status) => {
      //         if (status === 'VALID') {
      //           if (key === 'coinA') {
      //             this.state = 'stage2';
      //             this.filteredRows = this.sections;
      //             this.pairTable.rowSelected(null);
      //             setTimeout(() => {
      //               this.inputs.last.nativeElement.focus();
      //             });
      //           } else if (key === 'coinB') {
      //             this.state = 'stage3';
      //             setTimeout(() => {
      //               this.submit.nativeElement.focus();
      //             });
      //           }
      //         }
      //       });
      //   });
      //   this.pairTable.sort(this.pairTable.columns[3]);
      //   this.inputs.first.nativeElement.focus();
      // });
    } else {
      this.state = 'stage1';
      this._controlStatus.next(true);
      this.filterCoins('coinA', '');
      this.filterCoins('coinB', '');
      this.resetModel('coinA');
    }
    this.onActiveStatus.emit(val);
  }

  constructor(
    private appService: AppService,
    private cryptoService: CryptocurrencyService,
    private zone: NgZone
  ) { }

  ngOnInit() {
    this.appService.marketPairChanges.subscribe((symbols) => {
      this.zone.run(() => {
        this._loadedSymbols = symbols;
      });
    });
    this.cryptoService.getCurrencies()
      .subscribe((data) => {
        this.zone.run(() => {
          this._userWallet = data
            .filter(c => c.local);
          this._allCoins = data;

          this.filteredRows = this.sections;
        });
      });
  }

  ngAfterViewInit() {
    const isFirstRun = window.electron.ipcRenderer.sendSync('isFirstRun');
    if(isFirstRun) this.active = true;
  }

  filterCoins(key: string, val: string) {
    this.model[key] = val;
    if(key === 'coinA') {

      // this.filteredRows = this.sections.map((section) => {
      //   section.rows = section.rows.filter((row) => {
      //     if (val.length <= 0) return true;
      //     const coinIdx = row.symbol.toLowerCase().indexOf(val.toLowerCase());
      //     const currencyIdx = row.name.toLowerCase().indexOf(val.toLowerCase());
      //     return coinIdx >= 0 || currencyIdx >= 0;
      //   });
      //   return section;
      // });
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
        this.cryptoService.getCurrencyComparisons(row.symbol)
          // .first()
          .subscribe(data => {
            this.zone.run(() => {
              this.comparisons = [{rows: data}];
              this.filteredComparisons = this.comparisons;
              setTimeout(() => {
                // this.inputs.last.nativeElement.click();
                setTimeout(() => this.inputs.last.nativeElement.focus(), 0);
              }, 0);
            });
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
    } else if (coin === 'coinB') {
      this.model.coinB = '';
      this.coinBValid = false;
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
    // console.log(this.model);
    const a: string = this.model.coinA.symbol;
    const b: string = this.model.coinB.symbol;
    // this.router.navigate(['/trading', `${a}-${b}`]);
    window.electron.ipcRenderer.send('setKeyPair', [a, b]);
    this.active = false;
  }

}

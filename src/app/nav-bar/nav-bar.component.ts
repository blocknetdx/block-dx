import { Component, Input, ViewEncapsulation, OnInit, NgZone } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { AppService } from '../app.service';
import { Currentprice } from '../currentprice';
import { CurrentpriceService } from '../currentprice.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NavBarComponent implements OnInit {
  public symbols: string[];
  public currentPrice: Currentprice;

  public navCollapsed: boolean;
  public pairSelectorActiveState: boolean;

  constructor(
    private appService: AppService,
    private currentpriceService: CurrentpriceService,
    private decimalPipe: DecimalPipe,
    private zone: NgZone
  ) { }

  ngOnInit() {

    this.appService.marketPairChanges.subscribe((symbols) => {
      this.zone.run(() => {
        // console.log('symbols', symbols);
        this.symbols = symbols;
      });
    });

    this.currentpriceService.currentprice.subscribe((cp) => {
      this.zone.run(() => {
        // console.log('currentPrice', cp);
        this.currentPrice = cp;
      });
    });

  }

  toggleNav() {
    this.navCollapsed = !this.navCollapsed;
  }

  openSettings(e) {
    e.preventDefault();
    window.electron.ipcRenderer.send('openSettings');
    this.toggleNav();
  }

  openNotices(e) {
    e.preventDefault();
    window.electron.ipcRenderer.send('openTOS');
    this.toggleNav();
  }

}

import { Component, Input, ViewEncapsulation, OnInit, NgZone } from '@angular/core';

import { AppService } from '../app.service';
import { Currentprice } from '../currentprice';
import { CurrentpriceService } from '../currentprice.service';
import {NumberFormatPipe} from '../pipes/decimal.pipe';

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
    private numberFormatPipe: NumberFormatPipe,
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

  openLink(e, name) {
    e.preventDefault();
    const { openExternal } = window.electron.remote.shell;
    switch(name) {
      case 'email':
        openExternal('mailto:contact@blocknet.co');
        break;
      case 'reddit':
        openExternal('https://www.reddit.com/r/theblocknet/');
        break;
      case 'twitter':
        openExternal('https://twitter.com/The_Blocknet/');
        break;
      case 'faq':
        openExternal('https://blocknetsupport.cayzu.com/KnowledgeBase/Folder/4472');
        break;
      case 'fees':
        openExternal('https://blocknetsupport.cayzu.com/KnowledgeBase/Details/?id=1-What-are-the-fees-on-Block-DX?');
        break;
      case 'help':
        openExternal('https://blocknetsupport.cayzu.com/');
        break;
      case 'community':
        openExternal('https://discord.gg/2e6s7H8');
        break;
    }
    this.toggleNav();
  }

}

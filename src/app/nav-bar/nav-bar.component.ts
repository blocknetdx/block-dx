import { Component, Input, ViewEncapsulation, OnInit, NgZone } from '@angular/core';
import { AppService } from '../app.service';
import { Currentprice } from '../currentprice';
import { CurrentpriceService } from '../currentprice.service';
import {NumberFormatPipe} from '../pipes/decimal.pipe';
import {Localize} from '../localize/localize.component';
import {alert} from '../util';

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

  public appName: string;
  public appVersion: string;

  public Localize = Localize;

  constructor(
    private appService: AppService,
    private currentpriceService: CurrentpriceService,
    private numberFormatPipe: NumberFormatPipe,
    private zone: NgZone
  ) {
    this.appName = window.electron.ipcRenderer.sendSync('getAppName');
    this.appVersion = window.electron.ipcRenderer.sendSync('getAppVersion');
  }

  ngOnInit() {

    this.appService.marketPairChanges.subscribe((symbols) => {
      this.zone.run(() => {
        this.symbols = symbols;
      });
    });

    this.currentpriceService.currentprice.subscribe((cp) => {
      this.zone.run(() => {
        this.currentPrice = cp;
      });
    });

  }

  toggleNav() {
    this.navCollapsed = !this.navCollapsed;
  }

  openGeneralSettings(e) {
    e.preventDefault();
    window.electron.ipcRenderer.send('openGeneralSettings');
    this.toggleNav();
  }

  openInformation(e) {
    e.preventDefault();
    window.electron.ipcRenderer.send('openInformation');
    this.toggleNav();
  }

  openSettings(e) {
    e.preventDefault();
    window.electron.ipcRenderer.send('openSettings');
    this.toggleNav();
  }

  openConfigurationWizard(e) {
    e.preventDefault();
    window.electron.ipcRenderer.send('openConfigurationWizard');
    this.toggleNav();
  }

  checkForUpdates(e) {
    e.preventDefault();
    if(window.electron.ipcRenderer.sendSync('updateError')) {
      const { openExternal } = window.electron.remote.shell;
      openExternal('https://github.com/blocknetdx/block-dx/releases/latest');
    } else {
      const status = window.electron.ipcRenderer.sendSync('checkForUpdates');
      switch(status) {
        case 'available':
          break;
        case 'downloading':
          alert(this.Localize.text('An update is currently being downloaded in the background and can take a few minutes. A prompt will appear when complete.', 'navbar'));
          break;
        case 'downloaded':
          // alert('Update has been downloaded and will be installed once you restart the application.');
          break;
        default:
          alert(this.Localize.text('There are no Block DX updates available at this time.', 'navbar'));
      }
      this.toggleNav();
    }
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
      case 'reddit':
        openExternal('https://www.reddit.com/r/theblocknet/');
        break;
      case 'twitter':
        openExternal('https://twitter.com/The_Blocknet/');
        break;
      case 'api':
        openExternal('https://api.blocknet.co/#xbridge-api');
        break;
      case 'exchanges':
        openExternal('https://docs.blocknet.co/project/exchanges/');
        break;
      case 'faq':
        openExternal('https://docs.blocknet.co/blockdx/faq/');
        break;
      case 'fees':
        openExternal('https://docs.blocknet.co/blockdx/fees/');
        break;
      case 'resources':
        openExternal('https://docs.blocknet.co/');
        break;
      case 'community':
        openExternal('https://discord.gg/2e6s7H8');
        break;
      case 'discord':
        openExternal('https://discord.gg/2e6s7H8');
        break;
    }
    this.toggleNav();
  }

  openReleaseNotesWindow(e) {
    e.preventDefault();
    window.electron.ipcRenderer.send('openReleaseNotesWindow');
    this.toggleNav();
  }

}

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import {Cryptocurrency} from './cryptocurrency';
import {GeneralSettingsService} from './general-settings.service';

@Injectable()
export class ConfigurationOverlayService {

  private showAllOrders = false;

  constructor(
    private generalSettingsService: GeneralSettingsService,
  ) { }

  private localTokens: Set<string>;
  private marketPair = [];

  private configurationOverlayObservable: BehaviorSubject<boolean[]>;

  public showConfigurationOverlay(): BehaviorSubject<boolean[]> {
    if(!this.configurationOverlayObservable) {
      this.configurationOverlayObservable = new BehaviorSubject([false]);

      this.generalSettingsService.generalSettings()
        .subscribe(({ showAllOrders }) => {
          this.showAllOrders = showAllOrders;
          this.setShowOverlay();
        });

      window.electron.ipcRenderer.on('localTokens', (e, tokens) => {
        this.localTokens = new Set(tokens);
        this.setShowOverlay();
      });

      window.electron.ipcRenderer.on('keyPair', (e, pair) => {
        this.marketPair = pair;
        this.setShowOverlay();
      });

    }
    return this.configurationOverlayObservable;
  }

  private setShowOverlay() {
    const { ipcRenderer } = window.electron;
    const { marketPair, localTokens, showAllOrders } = this;
    const xBridgeExists = ipcRenderer.sendSync('xBridgeConfExists');
    if(localTokens !== undefined && marketPair.length > 0) {
      const allLocal = marketPair.every(t => localTokens.has(t));
      if(allLocal) {
        this.configurationOverlayObservable.next([false, false]);
      } else {
        this.configurationOverlayObservable.next([true, xBridgeExists && !showAllOrders]);
      }
    } else {
      this.configurationOverlayObservable.next([false, false]);
    }
  }

}

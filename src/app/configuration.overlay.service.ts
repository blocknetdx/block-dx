import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import {Cryptocurrency} from './cryptocurrency';

@Injectable()
export class ConfigurationOverlayService {

  constructor() { }

  private localTokens: Set<string>;
  private marketPair = [];

  private configurationOverlayObservable: BehaviorSubject<boolean>;

  public showConfigurationOverlay(): BehaviorSubject<boolean> {
    if(!this.configurationOverlayObservable) {
      this.configurationOverlayObservable = new BehaviorSubject(false);

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
    const { marketPair, localTokens } = this;
    if(localTokens !== undefined && marketPair.length > 0) {
      if(marketPair.every(t => localTokens.has(t))) {
        this.configurationOverlayObservable.next(false);
      } else {
        this.configurationOverlayObservable.next(true);
      }
    } else {
      this.configurationOverlayObservable.next(false);
    }
  }

}

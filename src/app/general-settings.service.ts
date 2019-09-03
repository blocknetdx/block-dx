import { Injectable } from '@angular/core';
import { Pricing } from './pricing';
import { GeneralSettings } from './general-settings';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class GeneralSettingsService {

  private generalSettingsObservable: BehaviorSubject<GeneralSettings>;

  /**
   * Returns general settings observable
   * @returns {BehaviorSubject<GeneralSettings>}
   */
  public generalSettings(): BehaviorSubject<GeneralSettings> {
    if(!this.generalSettingsObservable) {
      const { ipcRenderer } = window.electron;
      const initialSettings = GeneralSettings.fromObject(ipcRenderer.sendSync('getGeneralSettings'));
      this.generalSettingsObservable = new BehaviorSubject(initialSettings);
      ipcRenderer.on('generalSettings', (e, settings) => {
        const generalSettings = GeneralSettings.fromObject(settings);
        this.generalSettingsObservable.next(generalSettings);
      });
    }
    return this.generalSettingsObservable;
  }

}

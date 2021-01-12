import {Component, NgZone, OnInit} from '@angular/core';

import {BalancesService} from './balances.service';
import {Balance} from './balance';
import {AppService} from './app.service';
import {NumberFormatPipe} from './pipes/decimal.pipe';
import { GeneralSettingsService } from './general-settings.service';
import {Localize} from './localize/localize.component';

@Component({
  selector: 'app-balances',
  templateUrl: './balances.component.html'
})
export class BalancesComponent implements OnInit {

  public get title() {
    return Localize.text('Balances', 'balances');
  }
  public sections: {rows: Balance[]}[] = [];
  public showWallet: boolean;

  constructor(
    private numberFormatPipe: NumberFormatPipe,
    private appService: AppService,
    private balanceService: BalancesService,
    private generalSettingsService: GeneralSettingsService,
    private zone: NgZone
  ) {

    // const sampleData = [
    //   {coin: 'BTC', amount: '0.00000432'},
    //   {coin: 'LTC', amount: '0.00323242'},
    //   {coin: 'ETH', amount: '34.0000'},
    //   {coin: 'SYS', amount: '5.00000432'},
    //   {coin: 'DGB', amount: '103.0009743'},]
    //   .map(b => Balance.fromObject(b));
    // this.sections = [{
    //   rows: sampleData
    // }];

  }

  ngOnInit() {
    const { zone } = this;
    this.generalSettingsService.generalSettings().subscribe(generalSettings => {
      zone.run(() => {
        this.showWallet = generalSettings.showWallet;
      });
    });
    this.balanceService.getBalances().subscribe(balances => {
      zone.run(() => {
        this.sections = [{
          rows: balances
        }];
      });
    });
  }

}

import {Component, NgZone, OnInit} from '@angular/core';
// import {CoinBalanceService} from './coinbalance.service';
import {CoinBalance} from './coinbalance';
import {AppService} from './app.service';

@Component({
  selector: 'app-balances',
  templateUrl: './balances.component.html'
})
export class BalancesComponent implements OnInit {
  public title = 'My Balances';
  public coinbalances: CoinBalance[];

  public symbols:string[] = [];

  constructor(
    private appService: AppService,
    // private coinbalanceService: CoinBalanceService,
    private zone: NgZone
  ) {}

  ngOnInit() {
    const { zone } = this;
  }
}

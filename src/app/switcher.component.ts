import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';

@Component({
  selector: 'app-switcher',
  templateUrl: './switcher.component.html',
  // styleUrls: ['./switcher.component.scss']
})
export class SwitcherComponent {
  currencies = [ 'BTC-USD', 'ETH-BTC', 'ETH-USD' ];

  onChange(currency:String): void {
    // refresh page with correct currency
    console.log(currency);
  }
}

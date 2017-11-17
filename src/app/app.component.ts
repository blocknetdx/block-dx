import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AppService } from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(
    private route: ActivatedRoute,
    private appService: AppService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const pair = params['pair'];
      const symbols = pair ? pair.split('-') : ['ETH', 'BTC'];
      this.appService.updateMarketPair(symbols);
    });
  }
}

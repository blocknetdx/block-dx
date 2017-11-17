import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AppService } from './app.service';

@Component({
  selector: 'mainview',
  templateUrl: './mainview.component.html',
  styleUrls: ['./mainview.component.scss']
})
export class MainviewComponent {

  constructor(
    private route: ActivatedRoute,
    private appService: AppService
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      const pair = params['pair'];
      const symbols = pair ? pair.split('-') : ['ETH', 'BTC'];
      this.appService.updateMarketPair(symbols);
    });
  }
}

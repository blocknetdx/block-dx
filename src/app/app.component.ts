import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AppService } from './app.service';
// import { CurrentpriceService } from './currentprice.service';
// import { Currentprice } from './currentprice';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  // public symbols: string[];
  // public currPrice: Currentprice;

  constructor(
    private route: ActivatedRoute,
    private appService: AppService
    // private priceService: CurrentpriceService
  ) {}

  ngOnInit(): void {
    // this.appService.marketPairChanges.subscribe((symbols) => {
    //   if (symbols) {
    //     console.log(symbols);
    //     this.priceService.getCurrentprice(symbols).first().subscribe();
    //   }
    // });

    this.route.params.subscribe(params => {
      const pair = params['pair'];
      const symbols = pair ? pair.split('-') : ['ETH', 'BTC'];
      this.appService.updateMarketPair(symbols);
      // if(id) {
      //   this.symbols = id.split("-");
      // } else {
      //   this.symbols = ["ETH","BTC"]
      // }
      // this.getCurrentprice();

    });
  }

  // getCurrentprice(): void {
  //   this.currPrice = new Currentprice();
  //   this.priceService.getCurrentprice(this.symbols).then(cp => {
  //     this.currPrice = cp[0];
  //   });
  // }
}

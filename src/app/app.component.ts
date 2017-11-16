import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { CurrentpriceService } from './currentprice.service';
import { Currentprice } from './currentprice';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public symbols: string[];
  public currPrice: Currentprice;

  constructor(
    private route: ActivatedRoute,
    private priceService: CurrentpriceService
  ) {}

  ngOnInit(): void {
    var currID = this.route.params.subscribe(params => {
       var id = params['id'];
       if(id) {
         this.symbols = id.split("-");
       } else {
         this.symbols = ["ETH","BTC"]
       }
       this.getCurrentprice();
    });
  }

  getCurrentprice(): void {
    this.currPrice = new Currentprice();
    this.priceService.getCurrentprice(this.symbols).then(cp => {
      this.currPrice = cp[0];
    });
  }
}

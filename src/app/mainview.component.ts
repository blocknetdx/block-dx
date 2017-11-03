import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Location }                 from '@angular/common';

import { Currentprice } from './currentprice';
import { CurrentpriceService } from './currentprice.service';

@Component({
  selector: 'mainview',
  templateUrl: './mainview.component.html',
  styleUrls: ['./mainview.component.scss'],
  providers: [CurrentpriceService]
})
export class MainviewComponent {
  public symbols:string[];
  public currPrice: Currentprice;

  public bottomNavIndex: number = 0;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
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

  updateBottomNavIndex(idx) {
    setTimeout(() => {
      this.bottomNavIndex = idx;
    });
  }

  getCurrentprice(): void {
    this.currPrice = new Currentprice();
    this.priceService.getCurrentprice(this.symbols).then(cp => {
      this.currPrice = cp[0];
    })
  }
}

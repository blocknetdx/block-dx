import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Location }                 from '@angular/common';

import { Currentprice } from './currentprice';
import { CurrentpriceService } from './currentprice.service';
import { BreakpointService } from './breakpoint.service';

@Component({
  selector: 'mainview',
  templateUrl: './mainview.component.html',
  styleUrls: ['./mainview.component.scss'],
  providers: [CurrentpriceService]
})
export class MainviewComponent {
  public symbols:string[];
  public currPrice: Currentprice;

  public bottomNavIndex: number;
  private breakpoint: string;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private priceService: CurrentpriceService,
    private breakpointService: BreakpointService
  ) {}

  ngOnInit(): void {
    this.breakpointService.breakpointChanges
      .subscribe((bb) => {
        this.breakpoint = bb;
      });

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

  checkShowByIndex(idx: number): boolean {
    if (['lg', 'xl'].includes(this.breakpoint)) {
      return true;
    }
    return idx === this.bottomNavIndex;
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

import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';

import { Currentprice } from './currentprice';
import { CurrentpriceService } from './currentprice.service';

@Component({
  selector: 'mainview',
  templateUrl: './mainview.component.html',
  styleUrls: ['./mainview.component.scss']
})
export class MainviewComponent {
  @Input()
  public symbols:string[];

  @Input()
  public currPrice: Currentprice;

  constructor(
    private route: ActivatedRoute,
    private priceService: CurrentpriceService
  ) {}

  ngOnInit(): void {
    this.symbols = ["ETH","BTC"];
    this.currPrice = new Currentprice();
    // var currID = this.route.params.subscribe(params => {
    //    var id = params['id'];
    //    if(id) {
    //      this.symbols = id.split("-");
    //    } else {
    //      this.symbols = ["ETH","BTC"]
    //    }
    //    this.getCurrentprice();
    // });
  }

  // getCurrentprice(): void {
  //   this.currPrice = new Currentprice();
  //   this.priceService.getCurrentprice(this.symbols).then(cp => {
  //     this.currPrice = cp[0];
  //   });
  // }
}

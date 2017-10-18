import { Component, OnInit, NgZone } from '@angular/core';

import { Currentprice } from './currentprice';
import { CurrentpriceService } from './currentprice.service';

@Component({
  selector: 'currentprice',
  templateUrl: './currentprice.component.html',
  // styleUrls: ['./currentprice.component.scss']
  providers: [CurrentpriceService]
})
  export class CurrentpriceComponent {
  title = 'Current Price';
  currentprice: Currentprice;

  constructor(private currentpriceService: CurrentpriceService) { }

  getCurrentprice(): void {
    this.currentpriceService.getCurrentprice().then(currentprice => {
      this.currentprice = currentprice[0];
    })
  }

  ngOnInit(): void {
    this.getCurrentprice();
  }
}

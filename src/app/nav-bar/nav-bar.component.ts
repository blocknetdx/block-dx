import { Component, OnInit, Input, NgZone } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { BreakpointService } from '../breakpoint.service';
import { Currentprice } from '../currentprice';
import { CurrentpriceService } from '../currentprice.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {
  @Input() public symbols: string[];
  @Input() public currentPrice: Currentprice = new Currentprice();

  public navCollapsed: boolean;
  public breakpoint: string;

  constructor(
    private decimalPipe: DecimalPipe,
    private breakpointService: BreakpointService
  ) { }

  ngOnInit() {
    this.breakpointService.breakpointChanges.subscribe((bb) => {
      this.breakpoint = bb;
    });
  }

  formatNumber(num:string, symbol:string): string {
    const format = symbol !== "USD" ? "1.5-5" : "1.2-2";
    return this.decimalPipe.transform(num,format);
  }

  toggleNav() {
    this.navCollapsed = !this.navCollapsed;
  }

}

import { Component, OnInit, NgZone } from '@angular/core';

import { BaseComponent } from '../base.component';
import { AppService } from '../app.service';
import { Openorder } from '../openorder';
import { OpenordersService } from '../openorders.service';

@Component({
  selector: 'bn-filled-orders',
  templateUrl: './filled-orders.component.html',
  styleUrls: ['./filled-orders.component.scss']
})
export class FilledOrdersComponent extends BaseComponent implements OnInit {
  public symbols: string[] = [];
  public filledorders: Openorder[];

  constructor(
    private appService: AppService,
    private openorderService: OpenordersService,
    private zone: NgZone
  ) { super(); }

  ngOnInit() {
    this.appService.marketPairChanges
      .takeUntil(this.$destroy)
      .subscribe((symbols) => {
        this.symbols = symbols;
    });
    // this.openorderService.getOpenorders()
    //   .then((filledorders) => {
    //     this.filledorders = filledorders
    //       .filter(o => o.settled)
    //       .map((o) => {
    //         o['row_class'] = o.side;
    //         return o;
    //       });
    //   });
    this.openorderService.getOpenorders(this.symbols[0])
      .subscribe(openorders => {
        this.zone.run(() => {
          this.filledorders = openorders
            .filter(o => o.settled)
            .map((o) => {
              o['row_class'] = o.side;
              return o;
            });
          console.log('filledorders', this.filledorders);
        });
      });
  }
}

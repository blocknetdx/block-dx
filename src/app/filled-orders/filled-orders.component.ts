import { Component } from '@angular/core';

import { BaseComponent } from '../base.component';
import { AppService } from '../app.service';
import { Openorder } from '../openorder';
import { OpenordersService } from '../openorders.service';

@Component({
  selector: 'bn-filled-orders',
  templateUrl: './filled-orders.component.html',
  styleUrls: ['./filled-orders.component.scss']
})
export class FilledOrdersComponent extends BaseComponent {
  public symbols: string[];
  public filledorders: Openorder[];

  constructor(
    private appService: AppService,
    private openorderService: OpenordersService
  ) { super(); }

  ngOnInit() {
    this.appService.marketPairChanges
      .takeUntil(this.$destroy)
      .subscribe((symbols) => {
        this.symbols = symbols;
        if (symbols) {
          this.openorderService.getFilledorders(this.symbols)
            .then((filledorders) => {
              this.filledorders = filledorders.map((o) => {
                o['row_class'] = o.side;
                return o;
              });
            });
        }
    });
  }
}

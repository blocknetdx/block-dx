import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Injectable()
export class BreakpointService {

  public breakpointChanges: BehaviorSubject<string>;

  private breakpoints = {
    xs: '(max-width: 575px)',
    sm: '(min-width: 576px) and (max-width: 767px)',
    md: '(min-width: 768px) and (max-width: 991px)',
    lg: '(min-width: 992px) and (max-width: 1199px)',
    xl: '(min-width: 1200px)'
  };

  constructor(
    private breakpointObserver: BreakpointObserver
  ) {
    this.breakpointChanges = new BehaviorSubject(null);

    const queries = Object.keys(this.breakpoints).map((bb) => {
      return this.breakpoints[bb];
    });

    this.breakpointObserver.observe(queries)
      .subscribe(result => {
        const matched = Object.keys(this.breakpoints).find((bb) => {
          return this.breakpointObserver.isMatched(this.breakpoints[bb]);
        });
        this.breakpointChanges.next(matched);
      });
  }

}

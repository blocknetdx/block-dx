import { Directive, Input, TemplateRef, ViewContainerRef, OnDestroy } from '@angular/core';

import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/first';

import { BreakpointService } from './breakpoint.service';

@Directive({
  selector: '[isBp]'
})
export class IsBreakpointDirective implements OnDestroy {

  private destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainerRef: ViewContainerRef,
    private breakpointService: BreakpointService
  ) {}

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  @Input() set isBp(breakpoints: string[]) {
    this.breakpointService.breakpointChanges
      .takeUntil(this.destroy$)
      .subscribe((bp) => {
        if (breakpoints.includes(bp)) {
          if (this.viewContainerRef.length <= 0) {
            this.viewContainerRef.createEmbeddedView(this.templateRef);
          }
        } else {
          this.viewContainerRef.clear();
        }
      });
  }

}

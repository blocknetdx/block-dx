import { Directive, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[bottomNavButton]'
})
export class BottomNavButtonDirective {

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainerRef: ViewContainerRef,
  ) {
    console.log(this.templateRef);
  }

}

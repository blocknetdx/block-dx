import { Directive, ContentChild, TemplateRef } from '@angular/core';

@Directive({
  selector: 'bn-card-toolbar'
})
export class CardToolbarDirective {

  @ContentChild('toolbar', {read: TemplateRef, static: false})
  public template: TemplateRef<any>;

  constructor() { }

}

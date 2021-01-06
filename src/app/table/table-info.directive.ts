import { Directive, ContentChild, TemplateRef } from '@angular/core';

@Directive({
  selector: 'bn-table-info'
})
export class TableInfoDirective {

  @ContentChild('tableInfo', {read: TemplateRef, static: false})
  public template: TemplateRef<any>;

  constructor() { }

}

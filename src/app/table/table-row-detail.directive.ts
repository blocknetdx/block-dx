import { Directive, ContentChild, TemplateRef } from '@angular/core';

@Directive({
  selector: 'bn-table-row-detail'
})
export class TableRowDetailDirective {

  @ContentChild('rowDetail', {read: TemplateRef})
  public template: TemplateRef<any>;

  constructor() { }

}

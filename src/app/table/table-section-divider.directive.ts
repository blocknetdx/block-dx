import { Directive, ContentChild, TemplateRef } from '@angular/core';

@Directive({
  selector: 'bn-table-section-divider'
})
export class TableSectionDividerDirective {

  @ContentChild('sectionDivider', {read: TemplateRef})
  public template: TemplateRef<any>;

  constructor() { }

}

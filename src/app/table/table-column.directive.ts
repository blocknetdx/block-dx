import { Directive, TemplateRef, ContentChild, Input } from '@angular/core';

import { TableColumnHeaderDirective } from './table-column-header.directive';
import { TableColumnCellDirective } from './table-column-cell.directive';

@Directive({
  selector: 'app-table-column'
})
export class TableColumnDirective {
  @Input() classList: string;
  @Input() sortable: true;
  @Input() prop: string;
  @Input() maxWidth: string;

  active: boolean;
  desc = true;

  @ContentChild(TableColumnHeaderDirective, {read: TemplateRef, static: false})
  headerTemplate: TemplateRef<any>;

  @ContentChild(TableColumnCellDirective, {read: TemplateRef, static: false})
  cellTemplate: TemplateRef<any>;

}

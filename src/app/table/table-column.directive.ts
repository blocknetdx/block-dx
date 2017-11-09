import { Directive, TemplateRef, ContentChild, Input } from '@angular/core';

import { TableColumnHeaderDirective } from './table-column-header.directive';
import { TableColumnCellDirective } from './table-column-cell.directive';

@Directive({
  selector: 'app-table-column'
})
export class TableColumnDirective {
  @Input() classList: string;

  @ContentChild(TableColumnHeaderDirective, {read: TemplateRef})
  headerTemplate: TemplateRef<any>

  @ContentChild(TableColumnCellDirective, {read: TemplateRef})
  cellTemplate: TemplateRef<any>

  constructor() { }

}

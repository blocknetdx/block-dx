import {
  Component, ContentChild, ContentChildren,
  QueryList, Input
} from '@angular/core';

import { TableColumnDirective } from './table-column.directive';

@Component({
  selector: 'app-table',
  template: `
    <div class="bn-table">
      <div class="bn-table__header">
        <div [class]="col.classList" *ngFor="let col of _internalColumns">
          <ng-template [ngTemplateOutlet]="col.headerTemplate"></ng-template>
        </div>
      </div>
      <div class="bn-table__body">
        <div class="bn-table__row" *ngFor="let row of rows">
          <div class="bn-table__cell {{col.classList}}" *ngFor="let col of _internalColumns">
            <ng-template *ngTemplateOutlet="col.cellTemplate; context: {row: row}"></ng-template>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./table.component.scss']
})
export class TableComponent {
  _columnTemplates: QueryList<TableColumnDirective>;
  _internalColumns: any[];

  @ContentChildren(TableColumnDirective)
  set columnTemplates(val: QueryList<TableColumnDirective>) {
    this._columnTemplates = val;

    this._internalColumns = val.toArray().map((col) => {
      return {
        headerTemplate: col.headerTemplate,
        cellTemplate: col.cellTemplate,
        classList: col.classList
      }
    });
  }

  get columnTemplates(): QueryList<TableColumnDirective> {
    return this._columnTemplates;
  }

  @Input() rows: any[];

  constructor() { }

  ngOnInit() {
  }

}

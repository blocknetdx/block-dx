import {
  Component, ContentChild, ContentChildren,
  QueryList, Input, Output, EventEmitter
} from '@angular/core';

import { naturalSort } from '../util';
import { TableColumnDirective } from './table-column.directive';

@Component({
  selector: 'app-table',
  template: `
    <div class="bn-table">
      <div class="bn-table__header">
        <div (click)="sort(col)"
          [class]="col.classList"
          [class.sortable]="col.sortable"
          [class.active]="col.active"
          [class.sort-up]="col.active && !col.desc"
          [class.sort-down]="col.active && col.desc"
          *ngFor="let col of columns">
          <ng-template *ngTemplateOutlet="col.headerTemplate"></ng-template>
        </div>
      </div>
      <div class="bn-table__body">
        <div class="bn-table__section" *ngFor="let section of sections">
          <div class="bn-table__section-title" *ngIf="section.title != 'undefined'">
            <div class="col-12">{{section.title}}</div>
          </div>
          <div class="bn-table__row"
            [class.selectable]="selectable"
            (click)="rowSelected(row)"
            *ngFor="let row of section.rows">
            <div class="bn-table__cell {{col.classList}}" *ngFor="let col of columns">
              <ng-template *ngTemplateOutlet="col.cellTemplate; context: {row: row}"></ng-template>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./table.component.scss']
})
export class TableComponent {
  @Output('onRowSelect')
  public onRowSelect: EventEmitter<any> = new EventEmitter();

  @Input() public selectable: boolean;

  public columns: any[];
  private sections: any[];

  @ContentChildren(TableColumnDirective)
  set columnTemplates(val: QueryList<TableColumnDirective>) {
    this.columns = val.toArray();
  }

  private _rows: any[];
  public get rows(): any[] { return this._rows; }
  @Input() public set rows(val: any[]) {
    this._rows = val;
    if (val) {
      const _groups = val.reduce((acc, row) => {
        (acc[row.section] = acc[row.section] || []).push(row);
        return acc;
      }, {});
      this.sections = Object.keys(_groups).map((s) => {
        return {
          title: s,
          rows: _groups[s]
        };
      });
    }
  }

  constructor() { }

  ngOnInit() {
  }

  sort(column) {
    if (column.sortable) {
      if (!column.active) {
        this.columns.forEach((col) => {
          col.active = col === column;
        });
      } else {
        column.desc = !column.desc;
      }
      this.sections = this.sections.map((sec) => {
        let arr = [...sec.rows];
        naturalSort(arr, column.prop);
        if (column.desc) {
          arr.reverse();
        }
        sec.rows = arr;
        return sec;
      });
    }
  }

  rowSelected(row) {
    if (this.selectable) {
      this.onRowSelect.emit(row);
    }
  }

}

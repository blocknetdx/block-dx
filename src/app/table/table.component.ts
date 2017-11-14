import {
  Component, ContentChild, ContentChildren, ViewChildren,
  QueryList, Input, Output, EventEmitter, ElementRef
} from '@angular/core';

import { naturalSort } from '../util';
import { TableColumnDirective } from './table-column.directive';

@Component({
  selector: 'app-table',
  template: `
    <div class="bn-table"
      (keydown.ArrowUp)="focusNextRow($event)"
      (keydown.ArrowDown)="focusNextRow($event)">
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
          <div class="bn-table__row" #rowRef
            tabindex="-1"
            [class.selectable]="selectable"
            (keyup.enter)="rowSelected(row)"
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
  @ViewChildren('rowRef')
  private rowRefs: QueryList<ElementRef>

  @Output('onRowSelect')
  public onRowSelect: EventEmitter<any> = new EventEmitter();

  @Input() public selectable: boolean;

  public columns: any[];
  private sections: any[];
  private rowFocusIndex: number = 0;

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

  focusNextRow(e?: any) {
    if (e) {
      e.preventDefault();
      if (e.code === 'ArrowDown') {
        this.rowFocusIndex += 1;
        if (this.rowFocusIndex > this.rows.length-1) this.rowFocusIndex = 0;
      } else if (e.code === 'ArrowUp') {
        this.rowFocusIndex -= 1;
        if (this.rowFocusIndex < 0) this.rowFocusIndex = this.rows.length-1;
      }
    } else {
      this.rowFocusIndex = 0;
    }
    this.rowRefs.find((r, i) => i === this.rowFocusIndex).nativeElement.focus();
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

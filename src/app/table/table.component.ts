import {
  Component, ContentChild, ContentChildren, ViewChildren, ViewChild,
  QueryList, Input, Output, EventEmitter, ElementRef
} from '@angular/core';

import { naturalSort, debounce } from '../util';
import { TableColumnDirective } from './table-column.directive';
import { TableRowDetailDirective } from './table-row-detail.directive';

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
      <div #tableBody class="bn-table__body" (click)="rowSelected(null, $event)">
        <div class="bn-table__section" *ngFor="let section of sections">
          <div class="bn-table__section-title" *ngIf="section.title != 'undefined'">
            <div class="col-12">{{section.title}}</div>
          </div>
          <div class="bn-table__row {{row.row_class}}" #rowRef
            tabindex="-1"
            [class.selectable]="selectable"
            [class.selected]="selectedRow == row"
            [class.divider]="row.constructor.name === 'TableRowDivider'"
            (keyup.enter)="rowSelected(row, $event)"
            (click)="rowSelected(row, $event)"
            *ngFor="let row of section.rows">
            <ng-container *ngIf="row.constructor.name !== 'TableRowDivider'">
              <div class="bn-table__cell {{col.classList}}" *ngFor="let col of columns">
                <ng-template *ngTemplateOutlet="col.cellTemplate; context: {row: row}"></ng-template>
              </div>
            </ng-container>
            <ng-container *ngIf="rowDetail">
              <div *ngIf="selectedRow == row" class="bn-table__row-detail">
                <ng-template *ngTemplateOutlet="rowDetail.template; context: {row: row}"></ng-template>
              </div>
            </ng-container>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./table.component.scss']
})
export class TableComponent {
  @ViewChildren('rowRef')
  public rowRefs: QueryList<ElementRef>;

  @ViewChild('tableBody')
  public tableBody: ElementRef;

  @Output('onRowSelect')
  public onRowSelect: EventEmitter<any> = new EventEmitter();

  @Input() public selectable: boolean;

  public columns: any[];
  public sections: any[];
  public selectedRow: any;
  private rowFocusIndex: number = 0;
  private viewIsInit: boolean;
  private scrollQueued: boolean;

  @ContentChildren(TableColumnDirective)
  set columnTemplates(val: QueryList<TableColumnDirective>) {
    this.columns = val.toArray();
  }

  @ContentChild(TableRowDetailDirective)
  public rowDetail: TableRowDetailDirective;

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

      if (this.scrollQueued) {
        this.scrollQueued = false;
        setTimeout(() => {
          this.scrollToMiddle();
        });
      }
    }
  }

  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.viewIsInit = true;
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

  scrollToMiddle() {
    if (this.rows) {
      if (this.rows.length > 0) {
        const mid = Math.floor(this.rows.length/2);
        const el = this.rowRefs.toArray()[mid].nativeElement;
        const body = this.tableBody.nativeElement;
        el.scrollIntoView(true);

        const scrollBack = (body.scrollHeight - body.scrollTop <= body.clientHeight) ? 0 : body.clientHeight/2;
        body.scrollTop = body.scrollTop - scrollBack;
      } else {
        this.scrollQueued = true;
      }
    }
  }

  rowSelected(row, e?:any) {
    if (this.selectable) {
      e.stopPropagation();
      this.selectedRow = row;
      this.onRowSelect.emit(row);
    }
  }

}

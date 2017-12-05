import {
  Component, ContentChild, ContentChildren, ViewChildren, ViewChild,
  QueryList, Input, Output, EventEmitter, ElementRef
} from '@angular/core';

import { PerfectScrollbarComponent, PerfectScrollbarDirective } from 'ngx-perfect-scrollbar';

import { naturalSort, debounce } from '../util';
import { TableColumnDirective } from './table-column.directive';
import { TableRowDetailDirective } from './table-row-detail.directive';
import { TableInfoDirective } from './table-info.directive';

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
      <div #tableBody class="bn-table__body" (click)="deselect($event)">
        <perfect-scrollbar #scrollbar>
          <ng-container *ngIf="tableInfo">
            <div class="bn-table__info">
              <ng-template *ngTemplateOutlet="tableInfo.template"></ng-template>
            </div>
          </ng-container>
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
        </perfect-scrollbar>
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

  @ViewChild('scrollbar')
  public scrollbar: PerfectScrollbarDirective;

  @Output('onRowSelect')
  public onRowSelect: EventEmitter<any> = new EventEmitter();

  @Input() public selectable: boolean;
  @Input() public deselectOnBlur: boolean = true;
  @Input() public groupBy: string;

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

  @ContentChild(TableInfoDirective)
  public tableInfo: TableInfoDirective;

  private _rows: any[];
  public get rows(): any[] { return this._rows; }
  @Input() public set rows(val: any[]) {
    this._rows = val;
    if (val) {
      const _groups = val.reduce((acc, row) => {
        (acc[row[this.groupBy]] = acc[row[this.groupBy]] || []).push(row);
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
    if (this.scrollbar) {
      if (this.rows) {
        if (this.rows.length) {
          const el = this.scrollbar['elementRef'].nativeElement;
          const elRect = el.getBoundingClientRect();
          const content = el.querySelector('.ps-content');
          const contentRect = content.getBoundingClientRect();
          const mid = Math.round((contentRect.height*0.5)-(elRect.height*0.5));
          this.scrollbar['directiveRef'].scrollToY(mid);
        } else {
          this.scrollQueued = true;
        }
      }
    }
  }

  deselect(e) {
    if (this.deselectOnBlur) {
      this.rowSelected(null, e);
    }
  }

  rowSelected(row, e?:any) {
    if (this.selectable) {
      if (e) e.stopPropagation();
      this.selectedRow = row;
      this.onRowSelect.emit(row);
    }
  }

}

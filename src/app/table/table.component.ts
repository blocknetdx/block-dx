import {
  Component, ContentChild, ContentChildren, ViewChildren, ViewChild,
  QueryList, Input, Output, EventEmitter, ElementRef, ViewEncapsulation
} from '@angular/core';

import { PerfectScrollbarComponent, PerfectScrollbarDirective } from 'ngx-perfect-scrollbar';

import { naturalSort, debounce } from '../util';
import { TableColumnDirective } from './table-column.directive';
import { TableRowDetailDirective } from './table-row-detail.directive';
import { TableInfoDirective } from './table-info.directive';
import { TableSectionDividerDirective } from './table-section-divider.directive';

@Component({
  selector: 'app-table',
  encapsulation: ViewEncapsulation.None,
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
          <div class="bn-table__section" *ngFor="let section of sections; first as isFirst">
            <ng-container *ngIf="sectionDivider && !isFirst">
              <div class="bn-table__section-divider">
                <ng-template *ngTemplateOutlet="sectionDivider.template"></ng-template>
              </div>
            </ng-container>
            <ng-container *ngIf="tableInfo">
              <div class="bn-table__info">
                <ng-template *ngTemplateOutlet="tableInfo.template"></ng-template>
              </div>
            </ng-container>
            <div class="bn-table__section-title" *ngIf="section.title && section.title != 'undefined'">
              <div class="col-12">{{section.title}}</div>
            </div>
            <div class="bn-table__row {{row.row_class}}" #rowRef
              tabindex="-1"
              [class.selectable]="selectable"
              [class.selected]="selectedRow == row"
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
  @Input() public sections: {rows: any[], title?: string}[];

  public columns: any[];
  public selectedRow: any;
  private rowFocusIndex: number = 0;
  private viewIsInit: boolean;

  @ContentChildren(TableColumnDirective)
  set columnTemplates(val: QueryList<TableColumnDirective>) {
    this.columns = val.toArray();
  }

  @ContentChild(TableRowDetailDirective)
  public rowDetail: TableRowDetailDirective;

  @ContentChild(TableInfoDirective)
  public tableInfo: TableInfoDirective;

  @ContentChild(TableSectionDividerDirective)
  public sectionDivider: TableSectionDividerDirective;

  private _rows: any[];
  public get rows(): any[] { return this._rows; }
  @Input() public set rows(val: any[]) {
    this._rows = val;
    if (val) {
      this.sections = [{rows:val}];
    }
  }

  constructor() { }

  ngAfterViewInit() {
    this.viewIsInit = true;
  }

  focusNextRow(e?: any) {
    if (e) {
      e.preventDefault();
      const len = this.rowRefs.length;
      if (e.code === 'ArrowDown') {
        this.rowFocusIndex += 1;
        if (this.rowFocusIndex > len-1) this.rowFocusIndex = 0;
      } else if (e.code === 'ArrowUp') {
        this.rowFocusIndex -= 1;
        if (this.rowFocusIndex < 0) this.rowFocusIndex = len-1;
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
      const el = this.scrollbar['elementRef'].nativeElement;
      const elRect = el.getBoundingClientRect();
      const content = el.querySelector('.ps-content');
      const interval = setInterval(() => {
        const contentRect = content.getBoundingClientRect();
        if (contentRect.height > 10) {
          clearInterval(interval);
          const mid = Math.round((contentRect.height*0.5)-(elRect.height*0.5));
          this.scrollbar['directiveRef'].scrollToY(mid);
        }
      });
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

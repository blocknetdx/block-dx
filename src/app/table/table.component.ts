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
  templateUrl: './table.component.html',
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

  @Output('onRowContextMenu')
  public onRowContextMenu: EventEmitter<any> = new EventEmitter();

  @Input() public selectable: boolean;
  @Input() public hideHeader = false;
  @Input() public noPadding = false;
  @Input() public deselectOnBlur: boolean = true;
  @Input() public groupBy: string;
  @Input() public sections: {rows: any[], title?: string}[];

  public columns: any[];
  public selectedRow: any;
  private rowFocusIndex: number = 0;
  private viewIsInit: boolean;
  private firstScroll: boolean = true;

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
        const arr = [...sec.rows];
        arr.sort((a, b) => a[column.prop].localeCompare(b[column.prop]));
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

  scrollToBottom(force = false) {
    if (this.scrollbar) {
      const el = this.scrollbar['elementRef'].nativeElement;
      const elRect = el.getBoundingClientRect();
      const content = el.querySelector('.ps-content');
      const interval = setInterval(() => {
        const contentRect = content.getBoundingClientRect();
        if (contentRect.height > 10) {
          clearInterval(interval);
          const bottom = Math.round((contentRect.height) + (elRect.height));
          const position = this.scrollbar['directiveRef'].position();
          if(force || this.firstScroll || position.y === 'end' || !position.y) {
            this.firstScroll = false;
            this.scrollbar['directiveRef'].scrollToY(contentRect.height);
          }
        }
      });
    }
  }

  scrollToTop(force = false) {
    if(this.scrollbar) {
      const el = this.scrollbar['elementRef'].nativeElement;
      const content = el.querySelector('.ps-content');
      const interval = setInterval(() => {
        const contentRect = content.getBoundingClientRect();
        if (contentRect.height > 10) {
          clearInterval(interval);
          const position = this.scrollbar['directiveRef'].position();
          if(force || this.firstScroll || position.y === 'start' || !position.y) {
            this.firstScroll = false;
            this.scrollbar['directiveRef'].scrollToY(0);
          }
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

  rowContextMenu(row, e:any) {
    if (this.selectable) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      const { clientX, clientY } = e;
      this.onRowContextMenu.emit({row, clientX, clientY});
    }
  }

}

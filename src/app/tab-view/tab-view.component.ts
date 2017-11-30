import { Component, OnInit, ContentChildren, QueryList } from '@angular/core';

import { TabDirective } from './tab.directive';

@Component({
  selector: 'bn-tab-view',
  styleUrls: ['./tab-view.component.scss'],
  template: `
    <div class="tabs">
      <a class="tab" *ngFor="let tab of tabs; let i = index"
        (click)="activeIndex = i"
        [class.active]="activeIndex === i">
        {{tab.label}}
      </a>
      <span [style.left]="((1/tabs.length)*activeIndex*100) + '%'" class="bar"></span>
    </div>
    <div class="tab-view__body">
      <ng-container *ngFor="let tab of tabs; let i = index">
        <ng-container *ngIf="activeIndex === i">
          <ng-template *ngTemplateOutlet="tab.content"></ng-template>
        </ng-container>
      </ng-container>
    </div>
  `
})
export class TabViewComponent implements OnInit {
  @ContentChildren(TabDirective)
  set tabTemplates(val: QueryList<TabDirective>) {
    this.tabs = val.toArray();
  }

  public tabs: TabDirective[];

  private _activeIndex: number = 0;
  public get activeIndex(): number { return this._activeIndex; }
  public set activeIndex(val: number) {
    this._activeIndex = val;
  }

  constructor() { }

  ngOnInit() {

  }

}

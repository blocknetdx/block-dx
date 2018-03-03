import { Component, ContentChildren, QueryList, ViewChildren, ElementRef, ViewChild, AfterContentInit } from '@angular/core';

import { TabDirective } from './tab.directive';

@Component({
  selector: 'app-bn-tab-view',
  styleUrls: ['./tab-view.component.scss'],
  template: `
    <div #buttonContainer class="tabs">
      <a class="tab" #button *ngFor="let tab of tabs; let i = index"
        (click)="activeTab = tab"
        [class.active]="activeTab === tab">
        {{tab.label}}
      </a>
      <span [class.notransition]="!allowTransition" [ngStyle]="calculateBar()" class="bar"></span>
    </div>
    <div class="tab-view__body">
      <ng-container *ngFor="let tab of tabs; let i = index">
        <ng-container *ngIf="activeTab.label === tab.label">
          <!--<div>{{tab.label}}</div>-->
          <ng-template *ngTemplateOutlet="tab.content"></ng-template>
        </ng-container>
      </ng-container>
    </div>
  `
})
export class TabViewComponent implements AfterContentInit {
  @ViewChild('buttonContainer')
  public buttonContainer: ElementRef;

  @ViewChildren('button')
  public buttons: QueryList<ElementRef>;

  @ContentChildren(TabDirective)
  set tabTemplates(val: QueryList<TabDirective>) {
    this.tabs = val.toArray();
  }

  public tabs: TabDirective[];
  public contentInit: boolean;
  public allowTransition: boolean;

  private _activeTab: TabDirective;
  public get activeTab(): TabDirective { return this._activeTab; }
  public set activeTab(val: TabDirective) {
    this._activeTab = val;
  }

  public get activeIndex(): number {
    return this.tabs.indexOf(this.activeTab);
  }

  constructor() { }

  ngAfterContentInit() {
    this.activeTab = this.tabs[0];
    setTimeout(() => {
      this.contentInit = true;
    });
  }

  calculateBar(): any {
    if (!this.tabs || !this.buttons || !this.contentInit) return null;
    if (!this.allowTransition) {
      setTimeout(() => this.allowTransition = true);
    }

    const rect = this.buttons.toArray()[this.activeIndex].nativeElement.getBoundingClientRect();
    const parentRect = this.buttonContainer.nativeElement.getBoundingClientRect();

    return {
      'width': `${Math.ceil(rect.width)}px`,
      'left': `${Math.floor(rect.left - parentRect.left)}px`
    };
  }

}

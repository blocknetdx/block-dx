import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PairSelectorNewComponent } from './pair-selector-new.component';

describe('PairSelectorNewComponent', () => {
  let component: PairSelectorNewComponent;
  let fixture: ComponentFixture<PairSelectorNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PairSelectorNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PairSelectorNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

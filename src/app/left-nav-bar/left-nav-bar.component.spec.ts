import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LeftNavBarComponent } from './left-nav-bar.component';

describe('NavBarComponent', () => {
  let component: LeftNavBarComponent;
  let fixture: ComponentFixture<LeftNavBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LeftNavBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LeftNavBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

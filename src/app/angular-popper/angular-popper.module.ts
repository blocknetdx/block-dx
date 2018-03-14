import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PopperComponent } from './angular-popper.component';

export * from './angular-popper.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    PopperComponent
  ],
  exports: [
    PopperComponent
  ]
})
export class NgPopper {}

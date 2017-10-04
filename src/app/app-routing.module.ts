import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PricechartComponent } from './pricechart.component';

const routes: Routes = [
  // { path: '', redirectTo: '/BTC-USD', pathMatch: 'full' },
  // { path: 'BTC-USD',  component: PricechartComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}

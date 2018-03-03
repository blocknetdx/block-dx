import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MainviewComponent } from './mainview.component';


const routes: Routes = [
  { path: '', redirectTo: '/trading/ETH-BTC', pathMatch: 'full' },
  { path: 'trading', redirectTo: '/trading/ETH-BTC', pathMatch: 'full' },
  {
    path: 'trading/:pair',
    component: MainviewComponent
  }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}

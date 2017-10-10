import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MainviewComponent } from './mainview.component';


const routes: Routes = [
  { path: '', redirectTo: '/trading', pathMatch: 'full' },
  { path: 'trading',  component: MainviewComponent },
  { path: 'trading/:id', component: MainviewComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}

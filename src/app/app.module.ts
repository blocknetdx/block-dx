import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule }    from '@angular/http';

import { RouterModule }   from '@angular/router';

// Import HttpClientModule from @angular/common/http
import {HttpClientModule} from '@angular/common/http';


// Imports for loading & configuring the in-memory web api
import { InMemoryWebApiModule } from 'angular-in-memory-web-api';
import { InMemoryDataService }  from './in-memory-data.service';

import { AppComponent } from './app.component';
import { TradehistoryComponent } from './tradehistory.component';
import { PricechartComponent } from './pricechart.component';
import { OpenordersComponent } from './openorders.component';
import { OrderbookComponent } from './orderbook.component';
import { DepthchartComponent } from './depthchart.component';
import { DepthComponent } from './depth.component';
import { SwitcherComponent } from './switcher.component';
import { MainviewComponent } from './mainview.component';
import { CurrentpriceComponent } from './currentprice.component';

import { DecimalPipe } from '@angular/common';

import { AppRoutingModule }     from './app-routing.module';


@NgModule({
  declarations: [
    AppComponent,
    CurrentpriceComponent,
    DepthchartComponent,
    DepthComponent,
    MainviewComponent,
    OpenordersComponent,
    OrderbookComponent,
    PricechartComponent,
    SwitcherComponent,
    TradehistoryComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    HttpModule,
    InMemoryWebApiModule.forRoot(InMemoryDataService),
    AppRoutingModule
  ],
  providers: [DecimalPipe],
  bootstrap: [AppComponent]
})
export class AppModule { }

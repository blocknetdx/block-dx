import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule }    from '@angular/http';

// Imports for loading & configuring the in-memory web api
import { InMemoryWebApiModule } from 'angular-in-memory-web-api';
import { InMemoryDataService }  from './in-memory-data.service';

import { AppComponent } from './app.component';
import { TradehistoryComponent } from './tradehistory.component';
import { PriceChartComponent } from './price-chart.component';
import { OpenOrdersComponent } from './open-orders.component';
import { OrderBookComponent } from './order-book.component';
import { DepthChartComponent } from './depth-chart.component';

import { AppRoutingModule }     from './app-routing.module';

@NgModule({
  declarations: [
    AppComponent,
    DepthChartComponent,
    OpenOrdersComponent,
    OrderBookComponent,
    PriceChartComponent,
    TradehistoryComponent,
  ],
  imports: [
    BrowserModule,
    HttpModule,
    InMemoryWebApiModule.forRoot(InMemoryDataService),
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

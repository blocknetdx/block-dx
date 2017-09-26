import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { TradeHistoryComponent } from './trade-history.component';
import { PriceChartComponent } from './price-chart.component';
import { OpenOrdersComponent } from './open-orders.component';
import { OrderBookComponent } from './order-book.component';
import { DepthChartComponent } from './depth-chart.component';

@NgModule({
  declarations: [
    AppComponent,
    TradeHistoryComponent,
    PriceChartComponent,
    OpenOrdersComponent,
    OrderBookComponent,
    DepthChartComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

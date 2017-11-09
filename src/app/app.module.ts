import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule }    from '@angular/http';
import { RouterModule }   from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { LayoutModule } from '@angular/cdk/layout';
import { DecimalPipe } from '@angular/common';

// Imports for loading & configuring the in-memory web api
import { InMemoryWebApiModule } from 'angular-in-memory-web-api';
import { InMemoryDataService }  from './in-memory-data.service';

import { AppComponent } from './app.component';
import { BalancesComponent } from './balances.component';
import { TradehistoryComponent } from './tradehistory.component';
import { PricechartComponent } from './pricechart.component';
import { OpenordersComponent } from './openorders.component';
import { OrderformComponent } from './orderform.component';
import { OrderbookComponent } from './orderbook.component';
import { DepthchartComponent } from './depthchart.component';
import { DepthComponent } from './depth.component';
import { SwitcherComponent } from './switcher.component';
import { MainviewComponent } from './mainview.component';
import { WatchlistComponent } from './watchlist.component';
import { CurrentpriceComponent } from './currentprice.component';

import { AppRoutingModule }     from './app-routing.module';
import { BreakpointService } from './breakpoint.service';
import { CurrentpriceService } from './currentprice.service';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { BottomNavComponent } from './bottom-nav/bottom-nav.component';
import { NavButtonComponent } from './nav-button/nav-button.component';
import { IsBreakpointDirective } from './is-breakpoint.directive';
import { BlockCurrencyPipe } from './block-currency.pipe';
import { TableComponent } from './table/table.component';
import { TableColumnDirective } from './table/table-column.directive';
import { TableColumnHeaderDirective } from './table/table-column-header.directive';
import { TableColumnCellDirective } from './table/table-column-cell.directive';


@NgModule({
  declarations: [
    AppComponent,
    BalancesComponent,
    CurrentpriceComponent,
    DepthchartComponent,
    DepthComponent,
    MainviewComponent,
    OpenordersComponent,
    OrderbookComponent,
    OrderformComponent,
    PricechartComponent,
    SwitcherComponent,
    TradehistoryComponent,
    WatchlistComponent,
    NavBarComponent,
    BottomNavComponent,
    NavButtonComponent,
    IsBreakpointDirective,
    BlockCurrencyPipe,
    TableComponent,
    TableColumnDirective,
    TableColumnHeaderDirective,
    TableColumnCellDirective
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    HttpModule,
    LayoutModule,
    InMemoryWebApiModule.forRoot(InMemoryDataService),
    AppRoutingModule
  ],
  providers: [
    DecimalPipe,
    BreakpointService,
    CurrentpriceService,
    BlockCurrencyPipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

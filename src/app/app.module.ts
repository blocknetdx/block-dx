import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { LayoutModule } from '@angular/cdk/layout';
import { DecimalPipe } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';

// Imports for loading & configuring the in-memory web api
import { environment } from '../environments/environment';
import { InMemoryWebApiModule } from 'angular-in-memory-web-api';
import { InMemoryDataService } from './in-memory-data.service';

import { AppComponent } from './app.component';
import { AppService } from './app.service';
import { BalancesComponent } from './balances.component';
import { TradehistoryComponent } from './tradehistory.component';
import { PricechartComponent } from './pricechart.component';
import { OpenordersComponent } from './openorders.component';
import { OpenordersService } from './openorders.service';
import { OrderformComponent } from './orderform.component';
import { OrderbookComponent } from './orderbook.component';
import { DepthchartComponent } from './depthchart.component';
import { DepthComponent } from './depth.component';
import { MainviewComponent } from './mainview.component';
import { WatchlistComponent } from './watchlist.component';

import { AppRoutingModule } from './app-routing.module';
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
import { PairSelectorComponent } from './pair-selector/pair-selector.component';
import { ValidCoinDirective } from './pair-selector/valid-coin.directive';
import { CryptocurrencyService } from './cryptocurrency.service';
import { SelectComponent } from './select/select.component';
import { OrderbookService } from './orderbook.service';
import { WebSocketService } from './web-socket.service';
import { TimeAgoPipe } from './time-ago.pipe';
import { CardComponent } from './card/card.component';
import { CardTitleDirective } from './card/card-title.directive';
import { CardBodyDirective } from './card/card-body.directive';
import { TabViewComponent } from './tab-view/tab-view.component';
import { TabDirective } from './tab-view/tab.directive';
import { FilledOrdersComponent } from './filled-orders/filled-orders.component';
import { BottomNavButtonDirective } from './bottom-nav/bottom-nav-button.directive';
import { TableRowDetailDirective } from './table/table-row-detail.directive';
import { TableInfoDirective } from './table/table-info.directive';
import { TableSectionDividerDirective } from './table/table-section-divider.directive';
import { CardToolbarDirective } from './card/card-toolbar.directive';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

const dev = environment.useMockAPI ? [
  InMemoryWebApiModule.forRoot(InMemoryDataService)
] : [];

@NgModule({
  declarations: [
    AppComponent,
    BalancesComponent,
    DepthchartComponent,
    DepthComponent,
    MainviewComponent,
    OpenordersComponent,
    OrderbookComponent,
    OrderformComponent,
    PricechartComponent,
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
    TableColumnCellDirective,
    PairSelectorComponent,
    ValidCoinDirective,
    SelectComponent,
    TimeAgoPipe,
    CardComponent,
    CardTitleDirective,
    CardBodyDirective,
    TabViewComponent,
    TabDirective,
    FilledOrdersComponent,
    BottomNavButtonDirective,
    TableRowDetailDirective,
    TableInfoDirective,
    TableSectionDividerDirective,
    CardToolbarDirective
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    HttpModule,
    BrowserAnimationsModule,
    FormsModule,
    LayoutModule,
    PerfectScrollbarModule,
    AppRoutingModule,
    ...dev
  ],
  providers: [
    DecimalPipe,
    AppService,
    BreakpointService,
    CurrentpriceService,
    BlockCurrencyPipe,
    OpenordersService,
    OrderbookService,
    WebSocketService,
    CryptocurrencyService,
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

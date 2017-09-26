import { Component, NgZone } from '@angular/core';

import * as jQuery from 'jquery';

declare var TradingView;
declare var Datafeeds;

@Component({
  selector: 'price-chart',
  templateUrl: './price-chart.component.html',
  // styleUrls: ['./price-chart.component.scss']
})
export class PriceChartComponent {
  title = 'Price Chart';

  constructor(
    private zone: NgZone
  ) { }

  ngAfterViewInit() {
    this.zone.runOutsideAngular(() => {
      TradingView.onready(function() {
        var widget = new TradingView.widget({
          debug: false,
          fullscreen: false,
          symbol: 'AAPL',
          interval: 'D',
          container_id: "tv_chart_container",
          //	BEWARE: no trailing slash is expected in feed URL
          datafeed: new Datafeeds.UDFCompatibleDatafeed("https://demo_feed.tradingview.com"),
          library_path: "assets/charting_library/",
          locale: "en",
          //	Regression Trend-related functionality is not implemented yet, so it's hidden for a while
          drawings_access: { type: 'black', tools: [{ name: "Regression Trend" }, { name: "" }] },
          enabled_features: ["chart_property_page_trading"],
          disabled_features: ["use_localstorage_for_settings", "left_toolbar", "header_saveload", "chart_property_page_scales",
            "header_settings", "header_indicators", "header_compare", "header_undo_redo", "chart_property_page_style"],
          charts_storage_url: 'http://saveload.tradingview.com',
          charts_storage_api_version: "1.1",
          client_id: 'tradingview.com',
          user_id: 'public_user_id',
          favorites: {
            intervals: ["1D", "3D", "3W", "W", "M"],
            chartTypes: ["Area", "Line"]
          },
          overrides: {
            "paneProperties.background": "#222222",
            "paneProperties.vertGridProperties.color": "#454545",
            "paneProperties.horzGridProperties.color": "#454545",
            "symbolWatermarkProperties.transparency": 90,
            "scalesProperties.textColor": "#AAA"
          },
          width: '50%',
          height: '500'

        });

        widget.onChartReady(function() {

        });
      });
    });
  }
}

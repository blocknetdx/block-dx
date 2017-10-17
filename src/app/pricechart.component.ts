import { Component, NgZone } from '@angular/core';

import * as jQuery from 'jquery';

declare var TradingView;
declare var Datafeeds;

@Component({
  selector: 'pricechart',
  templateUrl: './pricechart.component.html',
  // styleUrls: ['./pricechart.component.scss']
})
export class PricechartComponent {
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
          interval: '60',
          timeframe: '1D',
          container_id: "tv_chart_container",
          //	BEWARE: no trailing slash is expected in feed URL
          datafeed: new Datafeeds.UDFCompatibleDatafeed("https://demo_feed.tradingview.com"),
          library_path: "assets/charting_library/",
          locale: "en",
          //	Regression Trend-related functionality is not implemented yet, so it's hidden for a while
          drawings_access: { type: 'black', tools: [{ name: "Regression Trend" }, { name: "" }] },
          enabled_features: ["chart_property_page_trading" ], // "move_logo_to_main_pane"
          disabled_features: ["use_localstorage_for_settings", "left_toolbar", "header_saveload", "chart_property_page_scales",
            "header_settings", "header_compare", "header_undo_redo", "chart_property_page_style", "header_screenshot",
            "header_symbol_search", "header_interval_dialog_button", "volume_force_overlay"], // "header_indicators",
          charts_storage_url: 'http://saveload.tradingview.com',
          charts_storage_api_version: "1.1",
          client_id: 'tradingview.com',
          user_id: 'public_user_id',
          toolbar_bg: '#092644',

          favorites: {
            // intervals: ["1D", "3D", "3W", "W"],
            // chartTypes: ["Area", "Line"]
          },
          overrides: {
            "paneProperties.background": "#203855",
            "paneProperties.vertGridProperties.color": "#203855",
            "paneProperties.horzGridProperties.color": "#203855",
            "symbolWatermarkProperties.transparency": 40,
            "scalesProperties.textColor": "#AAA",
            "mainSeriesProperties.candleStyle.upColor": "#4BF5C6",
            "mainSeriesProperties.candleStyle.downColor": "#FF7362",
            "mainSeriesProperties.candleStyle.drawWick": true,
            "mainSeriesProperties.candleStyle.drawBorder": true,
            "mainSeriesProperties.candleStyle.borderColor": "#454545",
            "mainSeriesProperties.candleStyle.borderUpColor": "#4BF5C6",
            "mainSeriesProperties.candleStyle.borderDownColor": "#FF7362",
            "mainSeriesProperties.candleStyle.wickUpColor": 'rgba( 115, 115, 117, 1)',
            "mainSeriesProperties.candleStyle.wickDownColor": 'rgba( 115, 115, 117, 1)',
            "mainSeriesProperties.candleStyle.barColorsOnPrevClose": false,
            "volumePaneSize": "medium"
          },
          // Indicator overrides
          studies_overrides: {
            // Volume
            "volume.volume.color.0": "#4BF5C6",
            "volume.volume.color.1": "#FF7362",
            "volume.volume.transparency": 80,
            "volume.show ma": false,
          },
          width: '100%',
          height: '100%',
          time_frames: [
              { text: "1y", resolution: "W",  title: "1yr" },
              { text: "6m", resolution: "W" },
              { text: "1m", resolution: "D" },
              { text: "1000y", resolution: "W", description: "All", title: "All" },
          ]
        });

        widget.onChartReady(function() {

        });
      });
    });
  }
}

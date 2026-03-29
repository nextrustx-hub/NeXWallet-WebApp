"use client";

import React, { useEffect, useRef } from "react";

export function TradingViewTicker() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Remove any existing script
    const existing = containerRef.current.querySelector("script");
    if (existing) existing.remove();

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.async = true;
    script.type = "text/javascript";
    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: "BITSTAMP:BTCUSD", title: "BTC/USD" },
        { proName: "BINANCE:ETHUSDT", title: "ETH/USDT" },
        { proName: "BITSTAMP:LTCUSD", title: "LTC/USDT" },
        { proName: "KRAKEN:XMRUSD", title: "XMR/USD" },
        { proName: "FX:EURBRL", title: "EUR/BRL" },
      ],
      showSymbolLogo: true,
      isTransparent: true,
      displayMode: "adaptive",
      colorTheme: "dark",
      locale: "br",
    });

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        const s = containerRef.current.querySelector("script");
        if (s) s.remove();
      }
    };
  }, []);

  return (
    <div className="border-b">
      <div className="tradingview-widget-container" ref={containerRef}>
        <div className="tradingview-widget-container__widget" />
      </div>
    </div>
  );
}

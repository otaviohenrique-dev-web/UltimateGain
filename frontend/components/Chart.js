import React, { useEffect, useRef } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import { backendHttpBase } from '../utils/config';

const calculateZigZag = (data, thresholdPct = 0.5) => {
  if (!data || data.length === 0) return [];
  let pivots = [];
  let lastPivot = { ...data[0], type: 'none' };
  let trend = 0; 
  for (let i = 1; i < data.length; i++) {
    const candle = data[i];
    const changeHigh = ((candle.high - lastPivot.low) / lastPivot.low) * 100;
    const changeLow = ((lastPivot.high - candle.low) / lastPivot.high) * 100;
    if (trend !== 1 && changeHigh >= thresholdPct) {
      pivots.push({ time: lastPivot.time, value: lastPivot.low });
      lastPivot = candle; trend = 1;
    } else if (trend !== -1 && changeLow >= thresholdPct) {
      pivots.push({ time: lastPivot.time, value: lastPivot.high });
      lastPivot = candle; trend = -1;
    } else {
      if (trend === 1 && candle.high > lastPivot.high) lastPivot = candle;
      if (trend === -1 && candle.low < lastPivot.low) lastPivot = candle;
    }
  }
  pivots.push({ time: lastPivot.time, value: trend === 1 ? lastPivot.high : lastPivot.low });
  return pivots.filter((v, i, a) => a.findIndex(t => t.time === v.time) === i).sort((a, b) => a.time - b.time);
};

function prepareChartMarkers(markers, candleByTime) {
  if (!markers?.length) return [];
  return markers.map((m) => {
    if (m.shape !== "circle") return m;
    const c = candleByTime.get(m.time);
    const price = m.price != null ? Number(m.price) : (c?.close != null ? Number(c.close) : null);
    if (price == null || Number.isNaN(price)) return m;
    return { ...m, position: "atPriceMiddle", price, size: Math.max(3, Number(m.size) || 3) };
  });
}

function buildEntryHorizontalLineData(markers, liveCandle, inPosition, entryPriceState, candleMap) {
  if (!markers?.length) return [];
  const sorted = [...markers].sort((a, b) => a.time - b.time);
  const circles = sorted.filter((m) => m.shape === "circle");
  if (circles.length === 0) return [];
  const segments = [];
  for (const ent of circles) {
    let px = ent.price != null ? Number(ent.price) : null;
    if (px == null || Number.isNaN(px)) {
      const c = candleMap.get(ent.time);
      if (c?.close != null) px = Number(c.close);
    }
    if (px == null || Number.isNaN(px)) continue;
    const exit = sorted.find((m) => m.shape === "square" && m.time > ent.time);
    if (exit) {
      segments.push({ t0: ent.time, t1: exit.time, price: px });
    } else {
      let endT = liveCandle?.time != null ? Number(liveCandle.time) : ent.time;
      if (inPosition && entryPriceState > 0) px = Number(entryPriceState);
      if (endT <= ent.time) endT = ent.time + 900;
      segments.push({ t0: ent.time, t1: endT, price: px });
    }
  }
  const out = [];
  segments.forEach((s, i) => {
    if (i > 0) out.push({ time: segments[i - 1].t1 });
    out.push({ time: s.t0, value: s.price });
    out.push({ time: s.t1, value: s.price });
  });
  return out;
}

export default function TradingChart({ liveCandle, markersData, inPosition, entryPrice, currentPosition }) {
  const chartContainerRef = useRef(null);
  const tooltipRef = useRef(null);
  const chartInstance = useRef(null);
  const seriesInstance = useRef(null);
  const zigzagSeriesRef = useRef(null);
  const exactTradeLineRef = useRef(null);
  const entryHorizontalSeriesRef = useRef(null);
  const isDataLoaded = useRef(false);
  const markersRef = useRef([]);
  const chartDataMap = useRef(new Map());
  const currentHoverState = useRef("none");
  const markersSigRef = useRef("");

  useEffect(() => { if (markersData) markersRef.current = markersData; }, [markersData]);

  useEffect(() => {
    if (!chartContainerRef.current || chartInstance.current) return;
    const initialWidth = chartContainerRef.current.clientWidth || 800;

    const chart = createChart(chartContainerRef.current, {
      layout: { background: { type: ColorType.Solid, color: '#0f172a' }, textColor: '#94a3b8' },
      grid: { vertLines: { color: 'rgba(30, 41, 59, 0.4)' }, horzLines: { color: 'rgba(30, 41, 59, 0.4)' } },
      width: initialWidth, height: 450, crosshair: { mode: 0 },
      timeScale: { timeVisible: true, borderColor: '#334155' },
      rightPriceScale: { borderColor: '#334155' },
    });

    const newSeries = chart.addCandlestickSeries({ upColor: '#1e293b', downColor: '#1e293b', borderUpColor: '#334155', borderDownColor: '#334155', wickUpColor: '#334155', wickDownColor: '#334155' });
    const zigzagSeries = chart.addLineSeries({ color: '#38bdf8', lineWidth: 1, lineStyle: 2, crosshairMarkerVisible: false, lastValueVisible: false, priceLineVisible: false });
    const exactTradeLine = chart.addLineSeries({ color: '#a855f7', lineWidth: 2, lineStyle: 3, crosshairMarkerVisible: true, lastValueVisible: false, priceLineVisible: false });
    const entryHorizontal = chart.addLineSeries({ color: "#fbbf24", lineWidth: 2, lineStyle: 2, lastValueVisible: false, priceLineVisible: false, crosshairMarkerVisible: false });

    chartInstance.current = chart; seriesInstance.current = newSeries; zigzagSeriesRef.current = zigzagSeries; exactTradeLineRef.current = exactTradeLine; entryHorizontalSeriesRef.current = entryHorizontal;

    const carregarHistorico = async () => {
      try {
        const res = await fetch(`${backendHttpBase()}/api/historico`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            const unique = [...data].sort((a, b) => a.time - b.time).filter((v, i, a) => a.findIndex(t => (t.time === v.time)) === i);
            unique.forEach(candle => chartDataMap.current.set(candle.time, candle));
            const dimmedData = unique.map(candle => {
              const marker = markersRef.current.find(m => m.time === candle.time);
              if (marker) return { ...candle, color: marker.color, wickColor: marker.color, borderColor: marker.color };
              return candle;
            });
            newSeries.setData(dimmedData);
            zigzagSeries.setData(calculateZigZag(dimmedData, 0.8));
            chart.timeScale().fitContent();
            isDataLoaded.current = true;
          }
        }
      } catch (err) { console.error("Erro API:", err); }
    };
    carregarHistorico();

    let reqId = null;
    chart.subscribeCrosshairMove((param) => {
      if (reqId) cancelAnimationFrame(reqId);
      reqId = requestAnimationFrame(() => {
        const tooltip = tooltipRef.current;
        if (!param.time || param.point.x < 0 || param.point.y < 0 || !tooltip) {
          tooltip.style.display = 'none';
          if (currentHoverState.current !== "none") { exactTradeLine.setData([]); currentHoverState.current = "none"; }
          return;
        }
        const hoveredMarker = markersRef.current.find(m => m.time === param.time);
        const candleData = chartDataMap.current.get(param.time) || param.seriesData.get(newSeries);
        if (hoveredMarker && candleData) {
          tooltip.style.display = 'block';
          tooltip.style.left = param.point.x + 15 + 'px';
          tooltip.style.top = param.point.y + 15 + 'px';
          const isEntry = hoveredMarker.shape === 'circle';
          tooltip.innerHTML = `
            <div class="font-bold text-sm mb-1 ${hoveredMarker.color === '#22c55e' ? 'text-green-400' : 'text-red-400'}">
              ${isEntry ? 'ESTADO IA: ENTRADA' : 'ESTADO IA: SAÍDA'}
            </div>
            <div class="text-xs text-slate-300">Preço: US$ ${(hoveredMarker.price != null ? Number(hoveredMarker.price) : candleData.close).toFixed(2)}</div>
          `;
        } else {
          tooltip.style.display = 'none';
          if (currentHoverState.current !== "none") { exactTradeLine.setData([]); currentHoverState.current = "none"; }
        }
      });
    });

    const resizeObserver = new ResizeObserver(entries => {
      if (entries.length === 0 || !chartInstance.current) return;
      const { width, height } = entries[0].contentRect;
      chartInstance.current.applyOptions({ width, height });
    });
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      if (reqId) cancelAnimationFrame(reqId);
      resizeObserver.disconnect();
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (isDataLoaded.current && seriesInstance.current && liveCandle?.time) {
      chartDataMap.current.set(liveCandle.time, liveCandle); 
      let cColor = '#1e293b'; 
      const hasAction = markersRef.current.find(m => m.time === liveCandle.time);
      if (hasAction) cColor = hasAction.color; 
      try { seriesInstance.current.update({ ...liveCandle, color: cColor, wickColor: cColor, borderColor: cColor }); } catch (e) {}
    }
  }, [liveCandle]);

  useEffect(() => {
    if (!isDataLoaded.current || !seriesInstance.current || markersData == null) return;
    const sorted = [...markersData].sort((a, b) => a.time - b.time);
    const sig = JSON.stringify(sorted);
    if (sig === markersSigRef.current) return;
    markersSigRef.current = sig;
    try {
      if (typeof seriesInstance.current.setMarkers === "function") seriesInstance.current.setMarkers(prepareChartMarkers(sorted, chartDataMap.current));
    } catch (e) {}
  }, [markersData]);

  useEffect(() => {
    if (!isDataLoaded.current || !entryHorizontalSeriesRef.current || markersData == null) return;
    const lineData = buildEntryHorizontalLineData(markersData, liveCandle, inPosition, entryPrice, chartDataMap.current);
    try { entryHorizontalSeriesRef.current.setData(lineData); } catch (e) {}
  }, [markersData, liveCandle, inPosition, entryPrice, currentPosition]);

  return (
    <div className="w-full relative rounded overflow-hidden" style={{ minHeight: '450px' }}>
      <div ref={tooltipRef} className="absolute z-50 bg-slate-900/90 backdrop-blur border border-purple-500/50 p-3 rounded shadow-lg pointer-events-none transition-opacity duration-100" style={{ display: 'none' }}></div>
      <div ref={chartContainerRef} className="w-full h-[450px]"></div>
    </div>
  );
}
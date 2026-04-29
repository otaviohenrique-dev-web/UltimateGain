"use client";

import React, { useEffect, useRef } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import { backendHttpBase } from '../utils/config';

/**
 * Calculo de ZigZag adaptado do legado
 */
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
  return pivots;
};

const TradingChart = ({ liveCandle, markersData, inPosition, entryPrice, currentPosition }) => {
  const chartContainerRef = useRef(null);
  const chartInstance = useRef(null);
  const seriesInstance = useRef(null);
  const zigzagSeriesRef = useRef(null);
  const entryHorizontalSeriesRef = useRef(null);
  const chartDataMap = useRef(new Map());
  const isDataLoaded = useRef(false);
  const markersSigRef = useRef("");

  // Inicialização do Gráfico (Padrão Legado + Estilo V3)
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#94a3b8',
        fontFamily: 'Inter, sans-serif',
      },
      grid: {
        vertLines: { color: 'rgba(30, 41, 59, 0.5)' },
        horzLines: { color: 'rgba(30, 41, 59, 0.5)' },
      },
      crosshair: { mode: 0 },
      timeScale: { 
        borderColor: 'rgba(51, 65, 85, 0.5)',
        timeVisible: true,
        secondsVisible: false
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#10b981', downColor: '#ef4444',
      borderUpColor: '#10b981', borderDownColor: '#ef4444',
      wickUpColor: '#10b981', wickDownColor: '#ef4444',
    });

    const zigzagLine = chart.addLineSeries({ color: 'rgba(255, 255, 255, 0.15)', lineWidth: 1, lineStyle: 2 });
    const entryLine = chart.addLineSeries({ color: '#f59e0b', lineWidth: 1, lineStyle: 3 });

    seriesInstance.current = candlestickSeries;
    zigzagSeriesRef.current = zigzagLine;
    entryHorizontalSeriesRef.current = entryLine;
    chartInstance.current = chart;

    const carregarHistorico = async () => {
      try {
        const res = await fetch(`${backendHttpBase()}/api/historico`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            // Limpa duplicados e ordena (como no seu page.js legado)
            const unique = [...data].sort((a, b) => a.time - b.time);
            
            unique.forEach(c => chartDataMap.current.set(c.time, c));
            seriesInstance.current.setData(unique);
            
            zigzagSeriesRef.current.setData(calculateZigZag(unique));
            chart.timeScale().fitContent();
            
            isDataLoaded.current = true;
            console.log("✅ Histórico sincronizado.");
          }
        }
      } catch (err) { console.error("Erro no fetch do histórico:", err); }
    };

    carregarHistorico();

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ 
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight
        });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // Injeção de Tempo Real (A Solução do Problema de Log/Update)
  useEffect(() => {
    if (isDataLoaded.current && seriesInstance.current && liveCandle?.time) {
      // Pega o último timestamp conhecido
      const times = Array.from(chartDataMap.current.keys());
      const lastTime = Math.max(...times);

      // Trava de Segurança: Só atualiza se for o tempo atual ou futuro
      if (liveCandle.time >= lastTime) {
        chartDataMap.current.set(liveCandle.time, liveCandle);
        
        // Mantém a cor neutra ou a cor de sinal (Buy/Sell)
        let cColor = liveCandle.close >= liveCandle.open ? '#10b981' : '#ef4444';

        try {
          seriesInstance.current.update({
            ...liveCandle,
            color: cColor,
            wickColor: cColor,
            borderColor: cColor
          });
        } catch (e) {
          // Silencia erros de update de timestamp antigo
        }
      }
    }
  }, [liveCandle]);

  // Marcadores e Linha de Entrada (Otimizados)
  useEffect(() => {
    if (!isDataLoaded.current || !seriesInstance.current || !markersData) return;
    
    const sig = JSON.stringify(markersData);
    if (sig === markersSigRef.current) return;
    markersSigRef.current = sig;

    const formattedMarkers = markersData.map(m => ({
      time: m.time,
      position: m.side === 'buy' ? 'belowBar' : 'aboveBar',
      color: m.side === 'buy' ? '#10b981' : '#ef4444',
      shape: m.side === 'buy' ? 'circle' : 'square',
      text: m.side === 'buy' ? 'BUY' : 'SELL'
    }));

    seriesInstance.current.setMarkers(formattedMarkers);
  }, [markersData]);

  return (
    <div className="w-full h-full relative overflow-hidden">
       <div ref={chartContainerRef} className="absolute inset-0"></div>
    </div>
  );
};

export default TradingChart;
/**
 * Mock Data para Testes do Dashboard Premium V2
 * Use como fallback quando WebSocket não estiver disponível
 */

export const MOCK_DATA_SAMPLE = {
  // Identifiers
  asset: 'BTC',
  uptime: '02:45:32',
  
  // Balance & P&L
  balance: 10000,
  display_balance: 10542.75,
  floating_pnl: 542.75,
  total_pnl: 1250.30,
  initial_balance: 10000,
  
  // Position & Status
  position: 1, // 1 = LONG, -1 = SHORT, 0 = HOLD
  status: 'ATIVO', // ou 'PROTEÇÃO 345' (segundos)
  
  // Trading Stats
  trades_today: 12,
  
  // Adaptation/IA
  adaptation: {
    generation: 5,
    win_rate: 67.5,
    accuracy: 82.3,
    current_win_rate: 70,
  },
  
  // News
  news: [
    'Bitcoin surges 5% após decisão do Federal Reserve',
    'Ethereum ATH em 2024',
    'Market volatility decreases in Q2',
  ],
  
  // Chart Data (Exemplo simples)
  chart_data: [
    { time: 1609459200, open: 29000, high: 29500, low: 28800, close: 29300 },
    { time: 1609545600, open: 29300, high: 30000, low: 29200, close: 29800 },
    { time: 1609632000, open: 29800, high: 30500, low: 29600, close: 30200 },
  ],
};

export const MOCK_DATA_NEGATIVE = {
  asset: 'ETH',
  uptime: '01:15:20',
  balance: 5000,
  display_balance: 4750.50,
  floating_pnl: -249.50,
  total_pnl: -500.20,
  initial_balance: 5000,
  position: -1, // SHORT
  status: 'ATIVO',
  trades_today: 8,
  adaptation: {
    generation: 3,
    win_rate: 42.5,
    accuracy: 65.0,
    current_win_rate: 40,
  },
  news: [
    'Mercado em queda após notícia de regulação',
  ],
};

export const MOCK_DATA_LOCKED = {
  asset: 'BTC',
  uptime: '00:45:15',
  balance: 15000,
  display_balance: 15000,
  floating_pnl: 0,
  total_pnl: 500,
  initial_balance: 15000,
  position: 0, // HOLD
  status: 'PROTEÇÃO 234', // 234 segundos restantes
  trades_today: 5,
  adaptation: {
    generation: 7,
    win_rate: 75,
    accuracy: 88,
    current_win_rate: 75,
  },
  news: [],
};

/**
 * Usar assim no componente:
 * 
 * import { MOCK_DATA_SAMPLE } from '../utils/mockData';
 * 
 * // Em desenvolvimento
 * const testData = MOCK_DATA_SAMPLE;
 * 
 * // Ou com WebSocket como fallback
 * const { data } = useWebSocket();
 * const displayData = data || MOCK_DATA_SAMPLE;
 */

// ============ GERADOR DE DADOS REALISTAS ============

/**
 * Gera dados mock aleatórios realistas
 * Útil para testes de UI
 */
export function generateMockData() {
  const isPositive = Math.random() > 0.5;
  const pnl = isPositive 
    ? Math.random() * 2000 
    : -Math.random() * 1000;

  return {
    asset: ['BTC', 'ETH', 'SOL', 'XRP'][Math.floor(Math.random() * 4)],
    uptime: formatUptime(Math.floor(Math.random() * 10000)),
    balance: 10000 + (pnl * 0.1),
    display_balance: 10000 + (pnl * 0.1),
    floating_pnl: pnl,
    total_pnl: pnl * 2,
    initial_balance: 10000,
    position: [-1, 0, 1][Math.floor(Math.random() * 3)],
    status: Math.random() > 0.8 ? `PROTEÇÃO ${Math.floor(Math.random() * 900)}` : 'ATIVO',
    trades_today: Math.floor(Math.random() * 20),
    adaptation: {
      generation: Math.floor(Math.random() * 10) + 1,
      win_rate: Math.random() * 100,
      accuracy: Math.random() * 100,
      current_win_rate: Math.random() * 100,
    },
    news: [
      'Notícia de mercado aleatória 1',
      'Notícia de mercado aleatória 2',
      'Notícia de mercado aleatória 3',
    ].slice(0, Math.floor(Math.random() * 3) + 1),
  };
}

/**
 * Formata uptime de segundos para HH:MM:SS
 */
function formatUptime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// ============ SIMULAR UPDATES EM TEMPO REAL ============

/**
 * Simula atualizações de dados em tempo real
 * Use apenas em desenvolvimento
 */
export function useSimulatedData(initialData = MOCK_DATA_SAMPLE) {
  const [data, setData] = React.useState(initialData);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => ({
        ...prev,
        floating_pnl: prev.floating_pnl + (Math.random() - 0.5) * 50,
        display_balance: prev.display_balance + (Math.random() - 0.5) * 50,
        trades_today: Math.random() > 0.9 ? prev.trades_today + 1 : prev.trades_today,
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return data;
}

export default {
  MOCK_DATA_SAMPLE,
  MOCK_DATA_NEGATIVE,
  MOCK_DATA_LOCKED,
  generateMockData,
};

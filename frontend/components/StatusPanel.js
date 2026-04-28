export default function StatusPanel({ data }) {
  if (!data) return null;

  const { balance, position, status, uptime, adaptation, asset } = data;
  const posText = position === 1 ? 'LONG 🟢' : position === -1 ? 'SHORT 🔴' : 'HOLD ⚪';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="text-gray-400 text-sm">Status do Sistema ({asset})</h3>
        <p className="text-xl font-bold text-white">{status}</p>
        <p className="text-xs text-gray-500 mt-1">Uptime: {uptime}</p>
      </div>
      
      <div className="bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="text-gray-400 text-sm">Saldo Disponível</h3>
        <p className="text-2xl font-bold text-green-400">
          US$ {balance?.toFixed(2)}
        </p>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="text-gray-400 text-sm">Posição Atual</h3>
        <p className="text-2xl font-bold text-white">{posText}</p>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="text-gray-400 text-sm">Performance IA</h3>
        <p className="text-xl font-bold text-blue-400">
          WR: {adaptation?.win_rate?.toFixed(1)}%
        </p>
        <p className="text-xs text-gray-400">
          {adaptation?.wins}W / {adaptation?.losses}L
        </p>
      </div>
    </div>
  );
}
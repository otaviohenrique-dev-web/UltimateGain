export default function Controls({ status, apiUrl }) {
  const handleCommand = async (endpoint) => {
    try {
      const baseUrl = apiUrl || 'http://localhost:10000';
      await fetch(`${baseUrl}/api/control/${endpoint}`, { method: 'POST' });
    } catch (e) {
      console.error(`Erro ao enviar comando ${endpoint}:`, e);
    }
  };

  const isPaused = status === 'PAUSADO';

  return (
    <div className="flex gap-4 mb-6">
      <button 
        onClick={() => handleCommand(isPaused ? 'resume' : 'pause')}
        className={`px-6 py-2 rounded font-bold transition-colors ${
          isPaused 
            ? 'bg-green-600 hover:bg-green-500 text-white' 
            : 'bg-red-600 hover:bg-red-500 text-white'
        }`}
      >
        {isPaused ? '▶ RETOMAR OPERAÇÕES' : '⏸ PAUSAR BOT'}
      </button>
    </div>
  );
}
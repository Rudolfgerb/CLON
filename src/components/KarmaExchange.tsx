import React, { useState } from 'react';

interface KarmaExchangeProps {
  isDark: boolean;
  userId: string;
  onClose: () => void;
}

const KarmaExchange: React.FC<KarmaExchangeProps> = ({ isDark, userId, onClose }) => {
  const [amount, setAmount] = useState('');
  const [direction, setDirection] = useState<'karma_to_money' | 'money_to_karma'>('karma_to_money');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const exchangeRate = 1000; // 1000 Karma = 1 Euro</parameter>

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/karma/exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          type: direction,
          amount: Number(amount),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unbekannter Fehler');
      setMessage('Umtausch erfolgreich');
      setAmount('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unbekannter Fehler';
      setMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const convertedAmount = () => {
    const amt = Number(amount) || 0;
    return direction === 'karma_to_money' ? (amt / exchangeRate).toFixed(2) : (amt * exchangeRate).toString();
  };

  return (
    <div className="flex-1 overflow-y-auto pb-32">
      <div className="px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Karma umtauschen</h1>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'} transition-colors`}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Betrag</label>
            <input
              type="number"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`w-full p-3 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setDirection('karma_to_money')}
              className={`flex-1 py-2 rounded-xl border ${direction === 'karma_to_money' ? 'bg-green-500 text-white border-green-500' : isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            >
              Karma → €
            </button>
            <button
              type="button"
              onClick={() => setDirection('money_to_karma')}
              className={`flex-1 py-2 rounded-xl border ${direction === 'money_to_karma' ? 'bg-purple-500 text-white border-purple-500' : isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            >
              € → Karma
            </button>
          </div>

          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {direction === 'karma_to_money'
              ? `${amount || 0} Karma = ${convertedAmount()} €`
              : `${amount || 0} € = ${convertedAmount()} Karma`}
          </div>

          {message && (
            <div className={`p-3 rounded-xl text-sm ${message === 'Umtausch erfolgreich' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-semibold hover:scale-[1.02] transition-transform disabled:opacity-50"
          >
            {loading ? 'Wird gesendet...' : 'Umtauschen'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default KarmaExchange;

import React, { useEffect, useState } from 'react';
import { CheckCircle, Crown, Star, ArrowRight } from 'lucide-react';

interface SuccessPageProps {
  isDark: boolean;
  onContinue: () => void;
}

const SuccessPage: React.FC<SuccessPageProps> = ({ isDark, onContinue }) => {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          onContinue();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onContinue]);

  // Check URL params to determine what was purchased
  const urlParams = new URLSearchParams(window.location.search);
  const success = urlParams.get('success');
  const sessionId = urlParams.get('session_id');

  if (!success) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-3xl p-8 border shadow-2xl text-center max-w-md w-full`}>
        <div className="mb-6">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
            Zahlung erfolgreich!
          </h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Ihre Bestellung wurde erfolgreich verarbeitet.
          </p>
        </div>

        <div className={`${isDark ? 'bg-slate-700/50' : 'bg-gray-50'} rounded-2xl p-6 mb-6`}>
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Crown className="w-6 h-6 text-yellow-500" />
            <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Premium aktiviert
            </span>
          </div>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Sie zahlen jetzt nur noch 5% Gebühren bei Cash Jobs!
          </p>
        </div>

        <button
          onClick={onContinue}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center space-x-2 hover:scale-105 transition-all"
        >
          <span>Weiter zur App ({countdown}s)</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} mt-4`}>
          Session ID: {sessionId?.slice(-8)}
        </p>
      </div>
    </div>
  );
};

export default SuccessPage;
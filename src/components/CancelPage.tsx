import React from 'react';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

interface CancelPageProps {
  isDark: boolean;
  onBack: () => void;
  onRetry: () => void;
}

const CancelPage: React.FC<CancelPageProps> = ({ isDark, onBack, onRetry }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-6">
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md border border-white/20 shadow-2xl text-center">
        {/* Cancel Icon */}
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-500/30">
            <XCircle className="w-12 h-12 text-white" />
          </div>
          
          {/* Animated rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 border-4 border-red-500/30 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Cancel Content */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Zahlung abgebrochen
          </h1>
          <p className="text-xl text-red-300 mb-4">
            Kein Problem!
          </p>
          <p className="text-white/80 leading-relaxed">
            Ihre Zahlung wurde abgebrochen. Sie können jederzeit zurückkehren und den Vorgang wiederholen.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={onRetry}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-2xl font-semibold hover:scale-[1.02] transition-all duration-300 shadow-lg shadow-blue-500/30 flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Erneut versuchen</span>
          </button>
          
          <button
            onClick={onBack}
            className="w-full bg-white/10 border border-white/20 text-white py-4 rounded-2xl font-semibold hover:bg-white/20 transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Zurück zur App</span>
          </button>
        </div>

        {/* Additional Info */}
        <p className="text-white/60 text-sm mt-6">
          Keine Sorge - es wurden keine Gebühren erhoben.
        </p>
      </div>
    </div>
  );
};

export default CancelPage;
import React from 'react';
import { Clock, CheckCircle, XCircle, AlertTriangle, User, Calendar, Euro, Star } from 'lucide-react';

interface Application {
  id: string;
  job_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  created_at: string;
  responded_at?: string;
  job: {
    title: string;
    description: string;
    payment_type: 'cash' | 'karma';
    cash_amount?: number;
    karma_amount?: number;
    profiles?: {
      full_name: string;
    };
  };
}

interface ApplicationStatusCardProps {
  isDark: boolean;
  application: Application;
  onClick?: () => void;
}

const ApplicationStatusCard: React.FC<ApplicationStatusCardProps> = ({ isDark, application, onClick }) => {
  const getStatusIcon = () => {
    switch (application.status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'withdrawn':
        return <AlertTriangle className="w-5 h-5 text-gray-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (application.status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-600';
      case 'accepted':
        return 'bg-green-500/20 text-green-600';
      case 'rejected':
        return 'bg-red-500/20 text-red-600';
      case 'withdrawn':
        return 'bg-gray-500/20 text-gray-600';
      default:
        return 'bg-gray-500/20 text-gray-600';
    }
  };

  const getStatusText = () => {
    switch (application.status) {
      case 'pending':
        return 'Wartend';
      case 'accepted':
        return 'Angenommen';
      case 'rejected':
        return 'Abgelehnt';
      case 'withdrawn':
        return 'Zurückgezogen';
      default:
        return 'Unbekannt';
    }
  };

  const formatPayment = () => {
    if (application.job.payment_type === 'cash') {
      return `€${application.job.cash_amount?.toFixed(2) || '0.00'}`;
    }
    return `${application.job.karma_amount || 0} Karma`;
  };

  return (
    <div
      onClick={onClick}
      className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border cursor-pointer hover:scale-[1.02] transition-all duration-300`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            application.job.payment_type === 'cash' 
              ? 'bg-gradient-to-br from-green-500 to-green-600' 
              : 'bg-gradient-to-br from-purple-500 to-purple-600'
          }`}>
            {application.job.payment_type === 'cash' ? <Euro className="w-5 h-5 text-white" /> : <Star className="w-5 h-5 text-white" />}
          </div>
          <div>
            <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {application.job.title}
            </h3>
            <div className="flex items-center space-x-2 text-sm">
              <User className="w-4 h-4" />
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                von {application.job.profiles?.full_name || 'Unbekannt'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end space-y-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
          {getStatusIcon()}
        </div>
      </div>

      <div className="space-y-3">
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
          {application.job.description.length > 100 
            ? application.job.description.substring(0, 100) + '...' 
            : application.job.description
          }
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center text-green-500">
              {application.job.payment_type === 'cash' ? <Euro className="w-4 h-4 mr-1" /> : <Star className="w-4 h-4 mr-1" />}
              {formatPayment()}
            </div>
            <div className={`flex items-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <Calendar className="w-4 h-4 mr-1" />
              {new Date(application.created_at).toLocaleDateString('de-DE')}
            </div>
          </div>
        </div>

        {application.status === 'accepted' && (
          <div className="mt-3 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className={`text-sm ${isDark ? 'text-green-200' : 'text-green-700'}`}>
                Glückwunsch! Sie wurden für diesen Job ausgewählt.
              </span>
            </div>
          </div>
        )}

        {application.responded_at && (
          <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            Antwort erhalten: {new Date(application.responded_at).toLocaleString('de-DE')}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationStatusCard;
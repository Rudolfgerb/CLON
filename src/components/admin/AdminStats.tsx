import React from 'react';
import {
  Users, Briefcase, GraduationCap, Euro, TrendingUp,
  Crown, DollarSign
} from 'lucide-react';

interface AdminStatsData {
  total_users?: number;
  new_users_30d?: number;
  active_jobs?: number;
  new_jobs_30d?: number;
  premium_users?: number;
  commission_30d?: number;
  total_wallet_balance?: number;
  new_applications_30d?: number;
}

interface AdminStatsProps {
  isDark: boolean;
  stats: AdminStatsData | null;
  loading: boolean;
}

const AdminStats: React.FC<AdminStatsProps> = ({ isDark, stats, loading }) => {
  const statCards = [
    {
      title: 'Gesamte Benutzer',
      value: stats?.total_users || '0',
      change: stats?.new_users_30d || 0,
      changeText: 'Neue in 30 Tagen',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-500'
    },
    {
      title: 'Aktive Jobs',
      value: stats?.active_jobs || '0',
      change: stats?.new_jobs_30d || 0,
      changeText: 'Neue in 30 Tagen',
      icon: Briefcase,
      color: 'from-green-500 to-green-600',
      textColor: 'text-green-500'
    },
    {
      title: 'Premium Nutzer',
      value: stats?.premium_users || '0',
      change: '+12%',
      changeText: 'vs letzter Monat',
      icon: Crown,
      color: 'from-yellow-500 to-yellow-600',
      textColor: 'text-yellow-500'
    },
    {
      title: 'Provision (30T)',
      value: `€${(stats?.commission_30d || 0).toFixed(0)}`,
      change: '+24%',
      changeText: 'vs letzter Monat',
      icon: DollarSign,
      color: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-500'
    },
    {
      title: 'Wallet Guthaben',
      value: `€${(stats?.total_wallet_balance || 0).toFixed(0)}`,
      change: stats?.new_applications_30d || 0,
      changeText: 'Bewerbungen (30T)',
      icon: Euro,
      color: 'from-indigo-500 to-indigo-600',
      textColor: 'text-indigo-500'
    },
    {
      title: 'Kurse verfügbar',
      value: '24',
      change: '+3',
      changeText: 'Neue in 30 Tagen',
      icon: GraduationCap,
      color: 'from-pink-500 to-pink-600',
      textColor: 'text-pink-500'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Lade Statistiken...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border hover:scale-105 transition-transform duration-300`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className={`w-5 h-5 ${stat.textColor}`} />
            </div>
            
            <div>
              <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-1`}>
                {stat.value}
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                {stat.title}
              </p>
              <div className="flex items-center space-x-1">
                <span className={`text-xs font-medium ${stat.textColor}`}>
                  +{stat.change}
                </span>
                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  {stat.changeText}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6">
        {/* Revenue Chart */}
        <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Umsatzentwicklung
            </h3>
            <select className={`px-3 py-1 rounded-lg border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'}`}>
              <option>Letzte 7 Tage</option>
              <option>Letzte 30 Tage</option>
              <option>Dieses Jahr</option>
            </select>
          </div>
          <div className={`h-64 ${isDark ? 'bg-slate-700/50' : 'bg-gray-50'} rounded-xl flex items-center justify-center`}>
            <div className="text-center">
              <BarChart3 className={`w-12 h-12 ${isDark ? 'text-gray-400' : 'text-gray-400'} mx-auto mb-2`} />
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Umsatzdiagramm</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border`}>
        <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`}>
          Letzte Aktivitäten
        </h3>
        <div className="space-y-4">
          {[
            { 
              icon: Briefcase, 
              text: 'Neuer Job "React App" erstellt', 
              user: 'Max Mustermann', 
              time: 'vor 2 Min', 
              color: 'text-green-500' 
            },
            { 
              icon: Users, 
              text: 'Benutzer registriert', 
              user: 'Anna Schmidt', 
              time: 'vor 5 Min', 
              color: 'text-blue-500' 
            },
            { 
              icon: Euro, 
              text: 'Zahlung erhalten', 
              user: 'Job #1234', 
              time: 'vor 12 Min', 
              color: 'text-yellow-500' 
            },
            { 
              icon: Crown, 
              text: 'Premium upgrade', 
              user: 'Julia Fischer', 
              time: 'vor 18 Min', 
              color: 'text-purple-500' 
            }
          ].map((activity, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className={`w-10 h-10 rounded-full ${isDark ? 'bg-slate-700' : 'bg-gray-100'} flex items-center justify-center`}>
                <activity.icon className={`w-5 h-5 ${activity.color}`} />
              </div>
              <div className="flex-1">
                <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {activity.text}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {activity.user} • {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminStats;
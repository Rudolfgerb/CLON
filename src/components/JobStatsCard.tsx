import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Users, Clock, CheckCircle } from 'lucide-react';

interface JobStatsCardProps {
  isDark: boolean;
  title: string;
  value: string | number;
  change?: number;
  changeText?: string;
  icon: React.ElementType;
  color: string;
  bgGradient: string;
}

const JobStatsCard: React.FC<JobStatsCardProps> = ({
  isDark,
  title,
  value,
  change,
  changeText,
  icon: Icon,
  color,
  bgGradient
}) => {
  return (
    <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border hover:scale-105 transition-all duration-300`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${bgGradient} rounded-xl flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center space-x-1 ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span className="text-xs font-medium">{change >= 0 ? '+' : ''}{change}%</span>
          </div>
        )}
      </div>
      
      <div>
        <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-1`}>
          {value}
        </h3>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
          {title}
        </p>
        {changeText && (
          <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            {changeText}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobStatsCard;
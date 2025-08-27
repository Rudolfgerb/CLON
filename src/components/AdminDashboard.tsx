import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Users, Briefcase, GraduationCap, Euro, 
  TrendingUp, Activity, Crown, AlertCircle, RefreshCw,
  Settings, LogOut, Search, Bell, Menu, X
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import AdminStats from './admin/AdminStats';
import AdminJobs from './admin/AdminJobs';
import AdminUsers from './admin/AdminUsers';
import AdminCourses from './admin/AdminCourses';
import AdminPayments from './admin/AdminPayments';
import AdminSettings from './admin/AdminSettings';

interface AdminDashboardProps {
  user: any;
  userProfile: any;
  isDark: boolean;
  onToggleTheme: () => void;
  onExitAdmin: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  user, 
  userProfile, 
  isDark, 
  onToggleTheme, 
  onExitAdmin 
}) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminStats();
  }, []);

  const loadAdminStats = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_stats')
        .select('*')
        .single();

      if (error) throw error;
      setStats(data);
    } catch (error) {
      console.error('Error loading admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { id: 'dashboard', icon: BarChart3, label: 'Dashboard', color: 'text-blue-500' },
    { id: 'jobs', icon: Briefcase, label: 'Jobs', color: 'text-green-500' },
    { id: 'users', icon: Users, label: 'Benutzer', color: 'text-purple-500' },
    { id: 'courses', icon: GraduationCap, label: 'Kurse', color: 'text-indigo-500' },
    { id: 'payments', icon: Euro, label: 'Zahlungen', color: 'text-yellow-500' },
    { id: 'settings', icon: Settings, label: 'Einstellungen', color: 'text-gray-500' }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'jobs':
        return <AdminJobs isDark={isDark} />;
      case 'users':
        return <AdminUsers isDark={isDark} />;
      case 'courses':
        return <AdminCourses isDark={isDark} />;
      case 'payments':
        return <AdminPayments isDark={isDark} />;
      case 'settings':
        return <AdminSettings isDark={isDark} />;
      default:
        return <AdminStats isDark={isDark} stats={stats} loading={loading} />;
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-gray-50'}`}>
      {/* Mobile Menu Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full z-50 transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border-r w-64`}>
        
        {/* Sidebar Header */}
        <div className={`p-6 ${isDark ? 'border-slate-700' : 'border-gray-200'} border-b`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Admin Panel
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Mutuus Verwaltung
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setActiveSection(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                    activeSection === item.id
                      ? isDark 
                        ? 'bg-slate-700 text-white' 
                        : 'bg-blue-50 text-blue-600'
                      : isDark
                      ? 'text-gray-300 hover:bg-slate-700 hover:text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${
                    activeSection === item.id ? '' : item.color
                  }`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Admin User Info */}
        <div className={`absolute bottom-0 left-0 right-0 p-4 ${isDark ? 'border-slate-700' : 'border-gray-200'} border-t`}>
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
              <Crown className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {userProfile?.full_name || 'Admin'}
              </p>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Administrator
              </p>
            </div>
          </div>
          <button
            onClick={onExitAdmin}
            className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Admin verlassen</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 flex-1">
        {/* Top Bar */}
        <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border-b`}>
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`lg:hidden p-2 rounded-lg ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
              >
                <Menu className={`w-5 h-5 ${isDark ? 'text-white' : 'text-gray-900'}`} />
              </button>
              
              <div>
                <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {menuItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Verwaltung und Übersicht
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder="Suchen..."
                  className={`pl-10 pr-4 py-2 rounded-lg border ${
                    isDark 
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' 
                      : 'bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              {/* Notifications */}
              <button className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'} relative`}>
                <Bell className={`w-5 h-5 ${isDark ? 'text-white' : 'text-gray-900'}`} />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </button>

              {/* Refresh */}
              <button 
                onClick={loadAdminStats}
                className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
              >
                <RefreshCw className={`w-5 h-5 ${isDark ? 'text-white' : 'text-gray-900'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
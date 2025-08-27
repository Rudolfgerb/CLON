import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Search, Crown, Shield,
  CheckCircle, XCircle, Star
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AdminUsersProps {
  isDark: boolean;
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  karma: number;
  level: number;
  premium: boolean;
  role: string;
  created_at: string;
  last_login: string | null;
  is_active: boolean;
}

const AdminUsers: React.FC<AdminUsersProps> = ({ isDark }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const loadUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
      loadUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !isActive })
        .eq('id', userId);

      if (error) throw error;
      loadUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };
  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
      loadUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !isActive })
        .eq('id', userId);

      if (error) throw error;
      loadUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': 
      case 'super_admin': 
        return <Shield className="w-4 h-4 text-red-500" />;
      case 'premium': 
        return <Crown className="w-4 h-4 text-yellow-500" />;
      default: 
        return <Users className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Benutzer werden geladen...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-1`}>
              Benutzer Verwaltung
            </h2>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {filteredUsers.length} von {users.length} Benutzern
            </p>
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                placeholder="Benutzer suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 pr-4 py-2 rounded-lg border ${
                  isDark 
                    ? 'bg-slate-700 border-slate-600 text-white' 
                    : 'bg-gray-50 border-gray-200 text-gray-900'
                }`}
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'}`}
            >
              <option value="all">Alle Rollen</option>
              <option value="user">Benutzer</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { 
            label: 'Gesamt Benutzer', 
            value: users.length, 
            icon: Users, 
            color: 'text-blue-500',
            bg: 'from-blue-500 to-blue-600' 
          },
          { 
            label: 'Premium Nutzer', 
            value: users.filter(u => u.premium).length, 
            icon: Crown, 
            color: 'text-yellow-500',
            bg: 'from-yellow-500 to-yellow-600'
          },
          { 
            label: 'Administratoren', 
            value: users.filter(u => u.role === 'admin' || u.role === 'super_admin').length, 
            icon: Shield, 
            color: 'text-red-500',
            bg: 'from-red-500 to-red-600'
          },
          { 
            label: 'Aktive heute', 
            value: users.filter(u => u.last_login && new Date(u.last_login).toDateString() === new Date().toDateString()).length, 
            icon: CheckCircle, 
            color: 'text-green-500',
            bg: 'from-green-500 to-green-600'
          }
        ].map((stat, index) => (
          <div key={index} className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-xl p-4 border`}>
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 bg-gradient-to-br ${stat.bg} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stat.value}
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {stat.label}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl border overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${isDark ? 'bg-slate-700' : 'bg-gray-50'}`}>
              <tr>
                <th className={`px-6 py-4 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Benutzer
                </th>
                <th className={`px-6 py-4 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Karma & Level
                </th>
                <th className={`px-6 py-4 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Status
                </th>
                <th className={`px-6 py-4 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Registriert
                </th>
                <th className={`px-6 py-4 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className={`${isDark ? 'bg-slate-800' : 'bg-white'}`}>
              {filteredUsers.map((user) => (
                <tr key={user.id} className={`border-t ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        user.premium 
                          ? 'bg-gradient-to-br from-yellow-500 to-orange-500' 
                          : 'bg-gradient-to-br from-blue-500 to-purple-500'
                      }`}>
                        <Users className="w-5 h-5 text-white" />
                        {user.premium && <Crown className="w-3 h-3 text-white absolute translate-x-3 -translate-y-3" />}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {user.full_name}
                          </h4>
                          {getRoleIcon(user.role)}
                        </div>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-purple-500" />
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {user.karma}
                        </span>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-700'}`}>
                        Level {user.level}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {user.is_active ? 'Aktiv' : 'Inaktiv'}
                        </span>
                      </div>
                      {user.premium && (
                        <span className="inline-flex items-center space-x-1 bg-yellow-500/20 text-yellow-600 px-2 py-1 rounded-full text-xs font-medium">
                          <Crown className="w-3 h-3" />
                          <span>Premium</span>
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {new Date(user.created_at).toLocaleDateString('de-DE')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <select
                        value={user.role}
                        onChange={(e) => updateUserRole(user.id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'}`}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                      
                      <button 
                        onClick={() => toggleUserStatus(user.id, user.is_active)}
                        className={`p-1 rounded ${
                          user.is_active 
                            ? 'text-red-500 hover:bg-red-500/10' 
                            : 'text-green-500 hover:bg-green-500/10'
                        }`}
                        title={user.is_active ? 'Deaktivieren' : 'Aktivieren'}
                      >
                        {user.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="py-12 text-center">
            <Users className={`w-12 h-12 ${isDark ? 'text-gray-400' : 'text-gray-400'} mx-auto mb-4`} />
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Keine Benutzer gefunden
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
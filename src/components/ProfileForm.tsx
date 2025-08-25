import React from 'react';
import {
  User,
  Mail,
  Link as LinkIcon,
  AtSign,
  FileText,
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react';
import AvatarUpload from './AvatarUpload';

export interface ProfileData {
  full_name: string;
  email: string;
  bio: string;
  twitter: string;
  instagram: string;
  website: string;
  avatar_url: string;
}

interface ProfileFormProps {
  isDark: boolean;
  profileData: ProfileData;
  setProfileData: React.Dispatch<React.SetStateAction<ProfileData>>;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  error: string;
  success: string;
  userId: string;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  isDark,
  profileData,
  setProfileData,
  loading,
  onSubmit,
  error,
  success,
  userId
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border`}>
        <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Persönliche Daten
        </h2>

        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Vollständiger Name
            </label>
            <div className="relative">
              <User className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                value={profileData.full_name}
                onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-colors ${
                  isDark
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400'
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                placeholder="Ihr vollständiger Name"
                required
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              E-Mail Adresse
            </label>
            <div className="relative">
              <Mail className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-colors ${
                  isDark
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400'
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                placeholder="ihre@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Bio
            </label>
            <div className="relative">
              <FileText className={`absolute left-4 top-4 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <textarea
                value={profileData.bio}
                onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-colors h-32 ${
                  isDark
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400'
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                placeholder="Erzählen Sie etwas über sich"
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Website
            </label>
            <div className="relative">
              <LinkIcon className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="url"
                value={profileData.website}
                onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-colors ${
                  isDark
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400'
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Twitter
              </label>
              <div className="relative">
                <AtSign className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  value={profileData.twitter}
                  onChange={(e) => setProfileData(prev => ({ ...prev, twitter: e.target.value }))}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-colors ${
                    isDark
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400'
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                  placeholder="@benutzername"
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Instagram
              </label>
              <div className="relative">
                <AtSign className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  value={profileData.instagram}
                  onChange={(e) => setProfileData(prev => ({ ...prev, instagram: e.target.value }))}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-colors ${
                    isDark
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400'
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                  placeholder="@benutzername"
                />
              </div>
            </div>
          </div>

          <AvatarUpload
            userId={userId}
            isDark={isDark}
            avatarUrl={profileData.avatar_url}
            onUpload={(url) => setProfileData(prev => ({ ...prev, avatar_url: url }))}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 flex items-center space-x-3">
          <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
          <p className="text-green-200 text-sm">{success}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl font-semibold hover:scale-[1.02] transition-transform duration-300 shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Wird gespeichert...</span>
          </>
        ) : (
          <>
            <Check className="w-5 h-5" />
            <span>Profil speichern</span>
          </>
        )}
      </button>
    </form>
  );
};

export default ProfileForm;

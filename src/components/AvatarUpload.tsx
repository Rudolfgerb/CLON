import React, { useState } from 'react';
import { Image, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AvatarUploadProps {
  userId: string;
  isDark: boolean;
  avatarUrl: string;
  onUpload: (url: string) => void;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ userId, isDark, avatarUrl, onUpload }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      if (data?.publicUrl) {
        onUpload(data.publicUrl);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
        Profilbild
      </label>
      <div className="flex items-center space-x-4">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Avatar"
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center border ${
              isDark ? 'border-slate-600 bg-slate-700' : 'border-gray-200 bg-gray-50'
            }`}
          >
            <Image className={`w-8 h-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>
        )}
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {uploading && <Loader2 className="w-4 h-4 animate-spin mt-2" />}
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default AvatarUpload;

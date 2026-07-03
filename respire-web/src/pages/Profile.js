import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile } from '../services/users';

export default function Profile() {
  const { user: authUser } = useAuth();
  const [, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ bio: '', avatar_url: '' });

  useEffect(() => {
    if (!authUser) return;
    setLoading(true);
    getProfile(authUser.id)
      .then(data => {
        setProfile(data);
        setForm({ bio: data.bio || '', avatar_url: data.avatar_url || '' });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [authUser]);

  const handleSave = async () => {
    if (!authUser) return;
    setSaving(true);
    setMessage('');
    try {
      const updated = await updateProfile(authUser.id, form);
      setProfile(updated);
      setMessage('Profil mis à jour ✓');
    } catch (err) {
      setMessage('Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded-xl w-48"></div>
          <div className="h-32 bg-gray-200 rounded-2xl"></div>
          <div className="h-12 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 font-display">Mon Profil</h1>
        <p className="text-gray-500 mt-2">Gérez vos informations personnelles</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-respire-500 to-respire-600 p-8 text-white">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-2xl font-bold font-display">
              {authUser?.first_name?.[0]}{authUser?.last_name?.[0]}
            </div>
            <div>
              <h2 className="text-2xl font-bold font-display">{authUser?.first_name} {authUser?.last_name}</h2>
              <p className="text-respire-100">{authUser?.email}</p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
            <textarea
              value={form.bio}
              onChange={e => setForm({ ...form, bio: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-respire-500 focus:ring-4 focus:ring-respire-500/10 transition-all resize-none"
              placeholder="Parlez-nous de vous..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">URL Avatar</label>
            <input
              type="url"
              value={form.avatar_url}
              onChange={e => setForm({ ...form, avatar_url: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-respire-500 focus:ring-4 focus:ring-respire-500/10 transition-all"
              placeholder="https://exemple.com/avatar.jpg"
            />
          </div>

          {message && (
            <div className={`p-4 rounded-xl text-sm font-medium ${
              message.includes('✓') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 bg-gradient-to-r from-respire-500 to-respire-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-respire-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </div>
    </div>
  );
}

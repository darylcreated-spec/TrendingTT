import React, { useState } from 'react';
import { X, User, CheckCircle, LogIn, LogOut } from 'lucide-react';
import type { UserProfile } from '../types';
import { Storage } from '../services/storage';
import { FirebaseSocialService, isFirebaseConfigured } from '../services/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUserUpdated: (user: UserProfile) => void;
  onShowToast?: (msg: string) => void;
}

const TT_LOCATIONS = [
  'Port of Spain',
  'San Fernando',
  'Chaguanas',
  'Arima',
  'Point Fortin',
  'Couva',
  'Scarborough, Tobago',
  'Tunapuna',
  'Diego Martin',
  'Sangre Grande',
  'Cedros / Icacos',
  'Trinidad Diaspora (Abroad)',
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserUpdated,
  onShowToast,
}) => {
  const [displayName, setDisplayName] = useState(currentUser.displayName || '');
  const [handle, setHandle] = useState(currentUser.handle || '');
  const [location, setLocation] = useState(currentUser.location || 'Port of Spain');
  const [role, setRole] = useState(currentUser.role || 'citizen');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const updated: UserProfile = {
      ...currentUser,
      displayName: displayName.trim() || 'Trinbago Citizen',
      handle: handle.trim().replace(/^@/, '') || 'trini_voice',
      location,
      role: role as UserProfile['role'],
      bio: bio.trim(),
    };
    Storage.saveUserProfile(updated);
    onUserUpdated(updated);
    setIsSaving(false);
    if (onShowToast) onShowToast('Profile updated successfully!');
    onClose();
  };

  const handleGoogleLogin = async () => {
    if (!isFirebaseConfigured) {
      if (onShowToast) {
        onShowToast('Free Firebase keys not yet configured. Running in Local Citizen Mode.');
      }
      return;
    }
    const user = await FirebaseSocialService.loginWithGoogle();
    if (user) {
      Storage.saveUserProfile(user);
      onUserUpdated(user);
      if (onShowToast) onShowToast(`Welcome, ${user.displayName}!`);
      onClose();
    }
  };

  const handleLogout = async () => {
    if (isFirebaseConfigured) {
      await FirebaseSocialService.logout();
    }
    const guestUser: UserProfile = {
      uid: 'guest-' + Math.random().toString(36).substring(2, 9),
      displayName: 'Trinbago Citizen',
      handle: 'trini_guest',
      location: 'Port of Spain',
      role: 'citizen',
      joinedAt: new Date().toISOString()
    };
    Storage.saveUserProfile(guestUser);
    onUserUpdated(guestUser);
    if (onShowToast) onShowToast('Signed out to Guest Mode.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Masthead */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-black text-sm">
              TT
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base leading-tight">
                Trinbago Social Identity
              </h3>
              <p className="text-[11px] text-slate-400">
                {isFirebaseConfigured ? 'Connected to Free Realtime Cloud Sync' : 'Local Profile & Free Mode'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cloud Sign-In Banner */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800/80">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-red-400 font-bold">
                {currentUser.photoURL ? (
                  <img src={currentUser.photoURL} alt={currentUser.displayName} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate">{currentUser.displayName}</p>
                <p className="text-xs text-slate-400 truncate">@{currentUser.handle || 'citizen'} • {currentUser.location}</p>
              </div>
            </div>

            {isFirebaseConfigured ? (
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold border border-slate-700 flex items-center gap-1.5 shrink-0"
              >
                <LogIn className="w-3.5 h-3.5 text-red-400" />
                <span>Google</span>
              </button>
            ) : (
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/80">
                Free Mode Active
              </span>
            )}
          </div>
        </div>

        {/* Edit Profile Form */}
        <form onSubmit={handleSaveProfile} className="p-4 sm:p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Kern, Asha, TriniWatcher"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Handle
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">@</span>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="handle"
                  className="w-full pl-6 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Community / Parish
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-2 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-red-500"
              >
                {TT_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Citizen Role & Badge
            </label>
            <select
              value={role}
              onChange={(e) => setRole((e.target.value as 'citizen' | 'journalist' | 'official') || 'citizen')}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-red-500"
            >
              <option value="citizen">Trinbago Citizen (Community Reader & Voter)</option>
              <option value="journalist">Citizen Reporter (Live Traffic / News Dispatch)</option>
              <option value="official">Public Official / Monitor</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Short Bio
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. Daily commuter along Churchill Roosevelt Highway. TT culture enthusiast."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 resize-none focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-2 bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-red-400 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg active:scale-95 transition-all shadow-md shadow-red-950/50 flex items-center justify-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Save Social Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

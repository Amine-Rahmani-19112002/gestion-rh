import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../api/axios';
import { 
  User, 
  Lock, 
  Settings as SettingsIcon, 
  Shield, 
  Globe, 
  Bell, 
  Moon, 
  Sun, 
  CheckCircle2, 
  AlertCircle, 
  Laptop, 
  Smartphone, 
  ShieldCheck,
  Eye,
  EyeOff
} from 'lucide-react';

const Settings = () => {
  const { profile } = useOutletContext();
  
  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [passwordStatus, setPasswordStatus] = useState({ loading: false, error: null, success: null });

  // Preferences State
  const [language, setLanguage] = useState(localStorage.getItem('app_language') || 'fr');
  const [theme, setTheme] = useState(localStorage.getItem('app_theme') || 'light');
  const [notifications, setNotifications] = useState(localStorage.getItem('app_notifications') !== 'false');

  // Handle Preferences Changes
  useEffect(() => {
    localStorage.setItem('app_language', language);
    localStorage.setItem('app_theme', theme);
    localStorage.setItem('app_notifications', notifications);
  }, [language, theme, notifications]);

  // Handle Password Change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordStatus({ loading: true, error: null, success: null });

    if (newPassword.length < 8) {
      setPasswordStatus({ loading: false, error: 'Le nouveau mot de passe doit comporter au moins 8 caractères.', success: null });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ loading: false, error: 'Les nouveaux mots de passe ne correspondent pas.', success: null });
      return;
    }

    try {
      await api.put('/auth/change-password', { 
        currentPassword, 
        newPassword 
      });
      setPasswordStatus({ loading: false, error: null, success: 'Mot de passe mis à jour avec succès.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setPasswordStatus(prev => ({ ...prev, success: null }));
      }, 3000);
    } catch (error) {
      setPasswordStatus({ 
        loading: false, 
        error: error.response?.data?.message || 'Erreur lors de la modification du mot de passe.', 
        success: null 
      });
    }
  };

  // Helper for Initials
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  // Helper for Password Strength
  const getPasswordStrength = (pass) => {
    if (pass.length === 0) return { score: 0, label: '', color: 'bg-slate-200' };
    if (pass.length < 6) return { score: 1, label: 'Faible', color: 'bg-red-500' };
    if (pass.length < 8) return { score: 2, label: 'Moyen', color: 'bg-yellow-500' };
    if (pass.match(/[A-Z]/) && pass.match(/[0-9]/) && pass.match(/[^A-Za-z0-9]/)) return { score: 4, label: 'Très Fort', color: 'bg-green-600' };
    return { score: 3, label: 'Fort', color: 'bg-green-500' };
  };

  const strength = getPasswordStrength(newPassword);

  if (!profile) return null;

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Paramètres</h1>
        <p className="text-sm text-slate-500 mt-1">Gérez vos préférences et paramètres de sécurité.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Profile Information */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <User className="w-5 h-5 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">Informations du Profil</h2>
            </div>
            <div className="p-6 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mb-4 shadow-sm">
                {getInitials(profile.name)}
              </div>
              <h3 className="text-lg font-bold text-slate-900">{profile.name}</h3>
              <p className="text-sm text-slate-500 mb-4">{profile.email}</p>
              
              <div className="flex gap-2 mb-6">
                <span className={`rounded-full text-[11px] font-bold px-3 py-1 ${
                  profile.role === 'admin' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-blue-100 text-blue-700 border border-blue-200'
                }`}>
                  {profile.role === 'admin' ? 'Administrateur' : 'Employé'}
                </span>
                <span className={`rounded-full text-[11px] font-bold px-3 py-1 ${
                  profile.status === 'actif' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-red-100 text-red-700 border border-red-200'
                }`}>
                  {profile.status === 'actif' ? 'Actif' : 'Inactif'}
                </span>
              </div>
              
              <div className="w-full text-left text-xs text-slate-500 border-t border-slate-100 pt-4">
                <p>Création du compte : {new Date().toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
          </div>

          {/* Account Security Info */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <Shield className="w-5 h-5 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">Sécurité du Compte</h2>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-start gap-3">
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <Laptop className="w-4 h-4 text-slate-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Dernière connexion</p>
                  <p className="text-[11px] text-slate-500">Aujourd'hui à 09:41 (Cet appareil)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <Smartphone className="w-4 h-4 text-slate-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Sessions actives</p>
                  <p className="text-[11px] text-slate-500">1 session (Mac OS, Chrome)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Authentification à deux facteurs</p>
                  <p className="text-[11px] text-emerald-600 font-medium">Activée et sécurisée</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Change Password */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <Lock className="w-5 h-5 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">Changer le Mot de Passe</h2>
            </div>
            <div className="p-6">
              
              {passwordStatus.error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {passwordStatus.error}
                </div>
              )}
              {passwordStatus.success && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  {passwordStatus.success}
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Mot de passe actuel</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none w-full pr-10"
                      placeholder="••••••••"
                    />
                    <button type="button" className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Nouveau mot de passe</label>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                      className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none w-full"
                      placeholder="Min. 8 caractères"
                    />
                    
                    {/* Password Strength Indicator */}
                    {newPassword.length > 0 && (
                      <div className="mt-2">
                        <div className="flex gap-1 h-1 mb-1">
                          {[1, 2, 3, 4].map((level) => (
                            <div key={level} className={`flex-1 rounded-full ${strength.score >= level ? strength.color : 'bg-slate-100'}`}></div>
                          ))}
                        </div>
                        <p className={`text-[10px] font-medium text-right ${strength.score > 2 ? 'text-green-600' : 'text-slate-500'}`}>{strength.label}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Confirmer le mot de passe</label>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                      className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none w-full"
                      placeholder="Confirmer"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button 
                    type="submit" 
                    disabled={passwordStatus.loading || !currentPassword || !newPassword || !confirmPassword}
                    className="px-5 py-2.5 font-bold text-xs rounded-xl shadow-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {passwordStatus.loading ? 'Mise à jour...' : 'Mettre à jour'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <SettingsIcon className="w-5 h-5 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">Préférences de l'Application</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Language Preference */}
              <div>
                <label className="flex items-center gap-2 text-[11px] font-bold text-slate-700 mb-3 uppercase tracking-wider">
                  <Globe className="w-4 h-4" /> Langue
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setLanguage('fr')}
                    className={`px-4 py-2.5 text-xs font-bold rounded-xl border ${language === 'fr' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                  >
                    Français
                  </button>
                  <button 
                    onClick={() => setLanguage('en')}
                    className={`px-4 py-2.5 text-xs font-bold rounded-xl border ${language === 'en' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                  >
                    English
                  </button>
                </div>
              </div>

              {/* Theme Preference */}
              <div>
                <label className="flex items-center gap-2 text-[11px] font-bold text-slate-700 mb-3 uppercase tracking-wider">
                  {theme === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />} Thème
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setTheme('light')}
                    className={`px-4 py-2.5 text-xs font-bold rounded-xl border flex items-center justify-center gap-2 ${theme === 'light' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                  >
                    <Sun className="w-4 h-4" /> Clair
                  </button>
                  <button 
                    onClick={() => setTheme('dark')}
                    className={`px-4 py-2.5 text-xs font-bold rounded-xl border flex items-center justify-center gap-2 ${theme === 'dark' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                  >
                    <Moon className="w-4 h-4" /> Sombre
                  </button>
                </div>
              </div>

              {/* Notification Preferences */}
              <div className="md:col-span-2 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="flex items-center gap-2 text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
                      <Bell className="w-4 h-4" /> Notifications
                    </label>
                    <p className="text-[11px] text-slate-500">Recevoir des alertes pour les mises à jour importantes.</p>
                  </div>
                  <button 
                    onClick={() => setNotifications(!notifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${notifications ? 'bg-blue-600' : 'bg-slate-200'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Settings;

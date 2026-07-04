import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import { Settings as SettingsIcon, Bell, Shield, Languages, Save } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [language, setLanguage] = useState('en');
  const [notifySms, setNotifySms] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(false);
  const [notifyPush, setNotifyPush] = useState(true);
  const [shareAdvisor, setShareAdvisor] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    addToast('Preferences saved successfully!', 'success');
    setSaving(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 text-foreground text-left">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight">System Settings</h1>
        <p className="text-sm text-muted-foreground font-semibold">
          Configure diagnostic notifications, sharing permissions, and preferred language.
        </p>
      </div>

      <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Notifications Channels */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-base border-b border-border pb-2 flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" /> Notification Dispatch Channels
            </h3>
            
            <div className="space-y-3 pl-7">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="sms"
                  checked={notifySms}
                  onChange={(e) => setNotifySms(e.target.checked)}
                  className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                />
                <label htmlFor="sms" className="ml-2.5 text-sm font-semibold">
                  SMS Alerts <span className="text-xs text-muted-foreground font-normal">(Crucial crop warnings bypass)</span>
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="push"
                  checked={notifyPush}
                  onChange={(e) => setNotifyPush(e.target.checked)}
                  className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                />
                <label htmlFor="push" className="ml-2.5 text-sm font-semibold">
                  Push Notifications <span className="text-xs text-muted-foreground font-normal">(Sensor online updates)</span>
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="email"
                  checked={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.checked)}
                  className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                />
                <label htmlFor="email" className="ml-2.5 text-sm font-semibold">
                  Email Summaries <span className="text-xs text-muted-foreground font-normal">(Monthly reports)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Privacy & Sharing */}
          <div className="space-y-4 pt-4">
            <h3 className="font-extrabold text-base border-b border-border pb-2 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" /> Sharing & Governance
            </h3>
            
            <div className="flex items-start pl-7">
              <input
                type="checkbox"
                id="advisor"
                checked={shareAdvisor}
                onChange={(e) => setShareAdvisor(e.target.checked)}
                className="mt-1 w-4 h-4 text-primary border-border rounded focus:ring-primary"
              />
              <label htmlFor="advisor" className="ml-2.5 text-sm font-semibold leading-relaxed">
                Allow Agriculture Extension Officers to inspect farm diagnostics 
                <p className="text-xs text-muted-foreground font-normal mt-0.5">
                  Speeds up verification times for government subsidy schemes.
                </p>
              </label>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-6 border-t border-border flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-opacity-95 shadow-md flex items-center justify-center gap-2 transition-all min-w-[130px]"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Settings
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

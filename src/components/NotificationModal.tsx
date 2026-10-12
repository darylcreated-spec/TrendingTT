import React, { useState } from 'react';
import { 
  Bell, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  Volume2, 
  CloudRain, 
  Car, 
  Flame, 
  Radio
} from 'lucide-react';
import type { NotificationSettings } from '../types';
import { Storage } from '../services/storage';
import { NotificationService, type AlertType } from '../services/notificationService';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

interface NotificationModalContentProps {
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

const NotificationModalContent: React.FC<NotificationModalContentProps> = ({
  onClose,
  onShowToast,
}) => {
  const [settings, setSettings] = useState<NotificationSettings>(() => Storage.getNotificationSettings());
  const [permission, setPermission] = useState<NotificationPermission>(() => NotificationService.getPermission());
  const [isRequesting, setIsRequesting] = useState(false);
  const [testAlertType, setTestAlertType] = useState<AlertType>('breaking');
  const [isSendingTest, setIsSendingTest] = useState(false);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    try {
      const result = await NotificationService.requestPermission();
      setPermission(result);
      if (result === 'granted') {
        const updated = Storage.saveNotificationSettings({ enabled: true });
        setSettings(updated);
        onShowToast('Web notifications successfully enabled for Trending TT');
      } else if (result === 'denied') {
        onShowToast('Notifications blocked in browser settings');
      }
    } finally {
      setIsRequesting(false);
    }
  };

  const handleTogglePreference = (key: keyof Omit<NotificationSettings, 'enabled' | 'permission'>) => {
    const updated = Storage.saveNotificationSettings({
      [key]: !settings[key]
    });
    setSettings(updated);
  };

  const handleSendTestNotification = async () => {
    setIsSendingTest(true);
    try {
      const res = await NotificationService.sendTestAlert(testAlertType);
      if (res.success) {
        onShowToast(res.message);
      } else {
        onShowToast(res.message);
      }
      setPermission(NotificationService.getPermission());
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notification-modal-title"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-red-950/80 border border-red-800/60 text-red-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 id="notification-modal-title" className="text-base font-bold text-white">
                Live Alert & Push Notifications
              </h2>
              <p className="text-xs text-slate-400">
                PWA Web Push for Breaking News, Weather & Traffic
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-sm">
          {/* Permission Status Banner */}
          <div className="p-3.5 rounded-xl border bg-slate-950/60 flex items-start gap-3">
            {permission === 'granted' ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold text-emerald-400 text-xs uppercase tracking-wider">
                    Push Notifications Active
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">
                    Your browser is registered to receive real-time bulletins and emergency updates.
                  </div>
                </div>
              </>
            ) : permission === 'denied' ? (
              <>
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold text-red-400 text-xs uppercase tracking-wider">
                    Notifications Blocked
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">
                    Notifications are disabled in your browser site permissions. Click the lock/tune icon near your browser address bar to allow.
                  </div>
                </div>
              </>
            ) : (
              <>
                <Radio className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                <div className="flex-1">
                  <div className="font-semibold text-amber-400 text-xs uppercase tracking-wider">
                    Permission Needed
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">
                    Allow notifications to receive breaking news, TTMS flood warnings, and highway gridlock alerts.
                  </div>
                  <button
                    onClick={handleRequestPermission}
                    disabled={isRequesting}
                    className="mt-2.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 disabled:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{isRequesting ? 'Requesting...' : 'Enable Native Web Push'}</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Alert Channels Preferences */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Alert Channels & Subscriptions
            </div>
            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-red-950/50 text-red-400 border border-red-900/40">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200">Breaking News Bulletins</div>
                    <div className="text-[11px] text-slate-400">High-priority alerts from TTT, CNC3, TV6 & Newsday</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.breakingNews}
                  onChange={() => handleTogglePreference('breakingNews')}
                  className="w-4 h-4 rounded text-red-600 focus:ring-red-500 bg-slate-900 border-slate-700 accent-red-600"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-blue-950/50 text-blue-400 border border-blue-900/40">
                    <CloudRain className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200">TTMS Weather & Riverine Flood Alerts</div>
                    <div className="text-[11px] text-slate-400">Official meteorological bulletins and river basin alerts</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.weatherAlerts}
                  onChange={() => handleTogglePreference('weatherAlerts')}
                  className="w-4 h-4 rounded text-red-600 focus:ring-red-500 bg-slate-900 border-slate-700 accent-red-600"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-amber-950/50 text-amber-400 border border-amber-900/40">
                    <Car className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200">Highway Gridlock & Incident Radar</div>
                    <div className="text-[11px] text-slate-400">Severe slowdowns on UBH, CRH, PBR, and South Trunk Road</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.trafficAlerts}
                  onChange={() => handleTogglePreference('trafficAlerts')}
                  className="w-4 h-4 rounded text-red-600 focus:ring-red-500 bg-slate-900 border-slate-700 accent-red-600"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-purple-950/50 text-purple-400 border border-purple-900/40">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200">Trinbago Poll of the Day</div>
                    <div className="text-[11px] text-slate-400">Morning notification when a new national debate opens</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.dailyPolls}
                  onChange={() => handleTogglePreference('dailyPolls')}
                  className="w-4 h-4 rounded text-red-600 focus:ring-red-500 bg-slate-900 border-slate-700 accent-red-600"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-red-950/40 to-slate-950/70 border border-red-900/60 hover:border-red-700 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-red-950 text-red-400 border border-red-700/60 shadow-sm shadow-red-900/40">
                    <Flame className="w-4 h-4 animate-pulse fill-current" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-red-300 flex items-center gap-1.5">
                      <span>Level 4 &quot;Full Macko Mode&quot; Incidents</span>
                      <span className="px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider bg-red-600 text-white rounded">Hot</span>
                    </div>
                    <div className="text-[11px] text-slate-400">Browser push for high-severity incidents reaching 85%+ viral Macko score</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.fullMackoMode}
                  onChange={() => handleTogglePreference('fullMackoMode')}
                  className="w-4 h-4 rounded text-red-600 focus:ring-red-500 bg-slate-900 border-slate-700 accent-red-600"
                />
              </label>
            </div>
          </div>

          {/* Push Simulation & Testing Section */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Trigger Native Test Push
              </span>
              <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                Direct Browser Test
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Dispatch a real notification to your device now to verify sound, vibration, and background tray delivery.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setTestAlertType('breaking')}
                className={`p-2 rounded-lg border text-left transition-colors ${
                  testAlertType === 'breaking' 
                    ? 'border-red-500 bg-red-950/40 text-red-200' 
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-bold">Breaking Alert</div>
                <div className="text-[10px] opacity-80">Weather Warning</div>
              </button>
              <button
                type="button"
                onClick={() => setTestAlertType('traffic')}
                className={`p-2 rounded-lg border text-left transition-colors ${
                  testAlertType === 'traffic' 
                    ? 'border-amber-500 bg-amber-950/40 text-amber-200' 
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-bold">Traffic Radar</div>
                <div className="text-[10px] opacity-80">UBH Standstill</div>
              </button>
              <button
                type="button"
                onClick={() => setTestAlertType('weather')}
                className={`p-2 rounded-lg border text-left transition-colors ${
                  testAlertType === 'weather' 
                    ? 'border-blue-500 bg-blue-950/40 text-blue-200' 
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-bold">River Basin</div>
                <div className="text-[10px] opacity-80">Caroni Gauge</div>
              </button>
              <button
                type="button"
                onClick={() => setTestAlertType('poll')}
                className={`p-2 rounded-lg border text-left transition-colors ${
                  testAlertType === 'poll' 
                    ? 'border-purple-500 bg-purple-950/40 text-purple-200' 
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-bold">Trinbago Poll</div>
                <div className="text-[10px] opacity-80">Doubles Rivalry</div>
              </button>
              <button
                type="button"
                onClick={() => setTestAlertType('full_macko')}
                className={`p-2 rounded-lg border text-left transition-colors col-span-2 sm:col-span-1 ${
                  testAlertType === 'full_macko' 
                    ? 'border-red-500 bg-red-950/60 text-red-200 shadow-sm' 
                    : 'border-red-900/60 bg-red-950/20 text-red-300 hover:bg-red-950/40'
                }`}
              >
                <div className="font-bold flex items-center gap-1">
                  <span>Full Macko</span>
                  <span className="text-[10px]">🔥🚨</span>
                </div>
                <div className="text-[10px] opacity-85">Level 4 Peak Alert</div>
              </button>
            </div>

            <button
              onClick={handleSendTestNotification}
              disabled={isSendingTest}
              className="w-full py-2.5 bg-red-600 hover:bg-red-500 disabled:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSendingTest ? 'Dispatching Notification...' : 'Fire Live Notification to Device'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            Powered by PWA Service Worker push protocol
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  if (!isOpen) return null;
  return <NotificationModalContent onClose={onClose} onShowToast={onShowToast} />;
};

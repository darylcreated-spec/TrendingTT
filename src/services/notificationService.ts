import { Storage } from './storage';

export type AlertType = 'breaking' | 'traffic' | 'weather' | 'poll';

export interface AlertPayload {
  title: string;
  body: string;
  tag: string;
  url?: string;
}

export const ALERT_TEMPLATES: Record<AlertType, AlertPayload> = {
  breaking: {
    title: 'TRENDING.TT Breaking Alert',
    body: 'TTMS issues Yellow Level Adverse Weather Advisory for Northern & Central Trinidad.',
    tag: 'breaking-alert',
    url: '/'
  },
  traffic: {
    title: 'TRAFFIC RADAR: Uriah Butler Highway',
    body: 'Gridlock delay of 38+ mins near Caroni Bridge due to left-lane equipment work.',
    tag: 'traffic-alert',
    url: '/#radar'
  },
  weather: {
    title: 'WEATHER ALERT: TTMS Riverine Notice',
    body: 'Caroni River El Carmen station at 68% capacity and rising. Exercise heightened caution.',
    tag: 'weather-alert',
    url: '/#radar'
  },
  poll: {
    title: 'TRINBAGO POLL: Debe vs Curepe Doubles',
    body: 'Over 3,800 votes cast in the national doubles rivalry. Have your say today!',
    tag: 'poll-alert',
    url: '/#polls'
  }
};

export const NotificationService = {
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  },

  getPermission(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  },

  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      return 'denied';
    }

    try {
      const perm = await Notification.requestPermission();
      Storage.saveNotificationSettings({
        enabled: perm === 'granted',
        permission: perm
      });
      return perm;
    } catch {
      return 'denied';
    }
  },

  async showNotification(title: string, options: NotificationOptions = {}): Promise<boolean> {
    if (!this.isSupported() || Notification.permission !== 'granted') {
      return false;
    }

    const defaultOptions: NotificationOptions = {
      icon: '/icon-192.png',
      badge: '/favicon.svg',
      ...options,
    };

    // Attempt via Service Worker registration first for full mobile PWA background support
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration && 'showNotification' in registration) {
          await registration.showNotification(title, defaultOptions);
          return true;
        }
      } catch {
        // Fallback to desktop Notification API
      }
    }

    try {
      new Notification(title, defaultOptions);
      return true;
    } catch {
      return false;
    }
  },

  async sendTestAlert(type: AlertType = 'breaking'): Promise<{ success: boolean; message: string }> {
    if (!this.isSupported()) {
      return { 
        success: false, 
        message: 'Web notifications are not supported in this browser.' 
      };
    }

    let permission = Notification.permission;
    if (permission !== 'granted') {
      permission = await this.requestPermission();
    }

    if (permission !== 'granted') {
      return {
        success: false,
        message: 'Notification permission was not granted by your browser.'
      };
    }

    const template = ALERT_TEMPLATES[type];
    const delivered = await this.showNotification(template.title, {
      body: template.body,
      tag: `${template.tag}-${Date.now()}`,
      data: { url: template.url || '/' },
    });

    if (delivered) {
      return {
        success: true,
        message: `Native alert dispatched: "${template.title}"`
      };
    } else {
      return {
        success: false,
        message: 'Notification dispatch failed.'
      };
    }
  }
};


interface OneSignalUser {
  externalId?: string | null;
  login(externalId: string): Promise<void>;
  logout(): Promise<void>;
}

interface OneSignalNotifications {
  isPushSupported(): Promise<boolean>;
  permission: boolean;
  requestPermission(): Promise<boolean>;
  setEnabled(enable: boolean): Promise<boolean>;
}

interface OneSignal {
  User: OneSignalUser;
  Notifications: OneSignalNotifications;
  login(externalId: string): Promise<void>;
  logout(): Promise<void>;
  init(options: { 
    appId: string;
    serviceWorkerPath?: string;
    serviceWorkerUpdaterPath?: string;
    notifyButton?: {
      enable: boolean;
    };
    allowLocalhostAsSecureOrigin?: boolean;
  }): Promise<void>;
  
  // Legacy API methods (for backward compatibility)
  getNotificationPermission(): Promise<string>;
  showNativePrompt(): Promise<string>;
  setExternalUserId(id: string): Promise<void>;
  removeExternalUserId(): Promise<void>;
  setSubscription(enable: boolean): Promise<void>;
  isPushNotificationsEnabled(): Promise<boolean>;
  registerForPushNotifications(): Promise<void>;
}

interface Window {
  OneSignal?: OneSignal;
  OneSignalDeferred?: Array<(oneSignal: OneSignal) => void>;
  _env?: {
    ONESIGNAL_APP_ID?: string;
    [key: string]: string | undefined;
  };
}


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
  init(options: { 
    appId: string;
    serviceWorkerPath?: string;
    serviceWorkerUpdaterPath?: string;
  }): Promise<void>;
}

interface Window {
  OneSignal?: OneSignal;
  OneSignalDeferred?: Array<(oneSignal: OneSignal) => void>;
}

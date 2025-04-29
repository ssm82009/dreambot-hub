
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
  init(options: { appId: string }): Promise<void>;
}

interface Window {
  OneSignal?: OneSignal;
  OneSignalDeferred?: Array<(oneSignal: OneSignal) => void>;
}

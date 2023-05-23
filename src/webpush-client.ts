function encodeServerKey(serverKey: string) {
  var padding = "=".repeat((4 - (serverKey.length % 4)) % 4);
  var base64 = (serverKey + padding).replace(/\-/g, "+").replace(/_/g, "/");

  var rawData = window.atob(base64);
  var outputArray = new Uint8Array(rawData.length);

  for (var i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const WebPushUtils = {
  checkPermission() {
    return Notification.requestPermission();
  },

  registerServiceWorker(serviceWorkerPath: string) {
    return navigator.serviceWorker.register(serviceWorkerPath);
  },

  getSubscription(serviceWorkerRegistration: ServiceWorkerRegistration) {
    return serviceWorkerRegistration.pushManager.getSubscription();
  },
};

class RemoteStorage {
  constructor(public url: string) {
    this.url = url;
  }

  async register(
    pushSubscription: PushSubscription,
    options = {},
    headers = {}
  ) {
    await fetch(this.url, {
      method: "POST",
      mode: "cors",
      credentials: "include",
      cache: "default",
      headers: new Headers({
        Accept: "application/json",
        "Content-Type": "application/json",
        ...headers,
      }),
      body: JSON.stringify({
        subscription: pushSubscription,
        options,
      }),
    });
    return pushSubscription;
  }

  async updateOptions(
    pushSubscription: PushSubscription,
    options = {},
    headers = {}
  ) {
    await fetch(this.url, {
      method: "PUT",
      mode: "cors",
      credentials: "include",
      cache: "default",
      headers: new Headers({
        Accept: "application/json",
        "Content-Type": "application/json",
        ...headers,
      }),
      body: JSON.stringify({
        subscription: pushSubscription,
        options,
      }),
    });
    return pushSubscription;
  }

  async unregister(subscription: PushSubscription, headers = {}) {
    await fetch(this.url, {
      method: "DELETE",
      mode: "cors",
      credentials: "include",
      cache: "default",
      headers: new Headers({
        Accept: "application/json",
        "Content-Type": "application/json",
        ...headers,
      }),
      body: JSON.stringify({
        subscription,
      }),
    });
    return true;
  }

  async ping(pushSubscription: PushSubscription, options = {}) {
    await fetch(this.url, {
      method: "PING",
      mode: "cors",
      credentials: "include",
      cache: "default",
      headers: new Headers({
        Accept: "application/json",
        "Content-Type": "application/json",
      }),
      body: JSON.stringify({
        subscription: pushSubscription,
        options: options,
      }),
    });
    return true;
  }
}

class PushNotificationsNotSupported extends Error {}
class CreateClientError extends Error {}

export class WebPushClient {
  private supported: boolean;
  private permissionStatus: NotificationPermission;
  private registration: ServiceWorkerRegistration;
  private applicationServerKey: Uint8Array;
  private subscription: PushSubscription | null;
  private storage: RemoteStorage | null;

  constructor({
    isSupported,
    permissionStatus,
    serviceWorkerRegistration,
    subscription,
    applicationServerKey,
    subscribeUrl,
  }: {
    isSupported: boolean;
    permissionStatus: NotificationPermission;
    serviceWorkerRegistration: ServiceWorkerRegistration;
    applicationServerKey: Uint8Array;
    subscription: PushSubscription | null;
    subscribeUrl: string;
  }) {
    this.supported = isSupported;
    this.permissionStatus = permissionStatus;
    this.registration = serviceWorkerRegistration;
    this.applicationServerKey = applicationServerKey;
    this.subscription = subscription;
    this.storage =
      "undefined" !== typeof subscribeUrl
        ? new RemoteStorage(subscribeUrl)
        : null;
  }

  /**
   * Return whether or not the browser supports push notifications.
   */
  isSupported() {
    return this.supported;
  }

  /**
   * Throw an error if unsupported.
   */
  ensureSupported() {
    if (!this.isSupported()) {
      throw Error("This browser does not support push notifications.");
    }
  }

  /**
   * Throw an error on missing URL.
   */
  ensureUrlIsProvided() {
    if (!this.storage) {
      throw Error("Webpush client error: subscribeUrl has not been provided.");
    }
    return true;
  }

  isUrlProvided() {
    return !!this.storage;
  }

  getPermissionState() {
    this.ensureSupported();
    return this.permissionStatus;
  }

  /**
   * Return the current PushSubscription object.
   */
  getSubscription() {
    return this.subscription;
  }

  /**
   * Subscribe to notifications.
   */
  async subscribe(options = {}, register = this.isUrlProvided(), headers = {}) {
    this.ensureSupported();
    const pushSubscription = await this.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: this.applicationServerKey,
    });
    this.subscription = pushSubscription;
    return true === register && this.ensureUrlIsProvided() && this.storage
      ? this.storage.register(pushSubscription, options, headers)
      : new Promise((resolve) => resolve(PushSubscription));
  }

  /**
   * Unsubscribe to notifications.
   */
  async unsubscribe(unregister = this.isUrlProvided(), headers = {}) {
    this.ensureSupported();
    const pushSubscription = await WebPushUtils.getSubscription(
      this.registration
    );
    if (!pushSubscription) {
      return;
    }
    await pushSubscription.unsubscribe();
    this.subscription = null;
    return true === unregister && this.ensureUrlIsProvided() && this.storage
      ? this.storage.unregister(pushSubscription, headers)
      : new Promise((resolve) => resolve(true));
  }

  /**
   * Update options on remote server.
   */
  updateOptions(options = {}, headers = {}) {
    this.ensureSupported();
    this.ensureUrlIsProvided();
    if (!this.storage || !this.subscription) {
      return;
    }
    return this.storage.updateOptions(this.subscription, options, headers);
  }

  /**
   * Ping remote server
   */
  ping(options = {}) {
    this.ensureSupported();
    this.ensureUrlIsProvided();
    if (!this.storage || !this.subscription) {
      return;
    }
    return this.storage.ping(this.subscription, options);
  }
}

export const WebPushClientFactory = {
  isSupported() {
    return (
      "PushManager" in window &&
      "fetch" in window &&
      "permissions" in navigator &&
      "serviceWorker" in navigator
    );
  },

  /**
   * Create a client
   * @throws PushNotificationsNotSupported
   */
  async create({
    serviceWorkerPath,
    subscribeUrl,
    serverKey,
  }: {
    serviceWorkerPath: string;
    subscribeUrl: string;
    serverKey: string;
  }) {
    if (!this.isSupported()) {
      throw new PushNotificationsNotSupported();
    }
    try {
      const permissionStatus = await WebPushUtils.checkPermission();
      const serviceWorkerRegistration =
        await WebPushUtils.registerServiceWorker(serviceWorkerPath);
      const subscription = await WebPushUtils.getSubscription(
        serviceWorkerRegistration
      );
      return new WebPushClient({
        isSupported: true,
        applicationServerKey: encodeServerKey(serverKey),
        permissionStatus,
        serviceWorkerRegistration,
        subscription,
        subscribeUrl,
      });
    } catch (e) {
      console.warn("Webpush client cannot be started: " + e);
      throw new CreateClientError(e instanceof Error ? e.message : "");
    }
  },
};

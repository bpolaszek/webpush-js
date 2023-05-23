export declare class WebPushClient {
    private supported;
    private permissionStatus;
    private registration;
    private applicationServerKey;
    private subscription;
    private storage;
    constructor({ isSupported, permissionStatus, serviceWorkerRegistration, subscription, applicationServerKey, subscribeUrl, }: {
        isSupported: boolean;
        permissionStatus: NotificationPermission;
        serviceWorkerRegistration: ServiceWorkerRegistration;
        applicationServerKey: Uint8Array;
        subscription: PushSubscription | null;
        subscribeUrl: string;
    });
    /**
     * Return whether or not the browser supports push notifications.
     */
    isSupported(): boolean;
    /**
     * Throw an error if unsupported.
     */
    ensureSupported(): void;
    /**
     * Throw an error on missing URL.
     */
    ensureUrlIsProvided(): boolean;
    isUrlProvided(): boolean;
    getPermissionState(): NotificationPermission;
    /**
     * Return the current PushSubscription object.
     */
    getSubscription(): PushSubscription | null;
    /**
     * Subscribe to notifications.
     */
    subscribe(options?: {}, register?: boolean, headers?: {}): Promise<unknown>;
    /**
     * Unsubscribe to notifications.
     *
     * @param unregister
     * @returns {Promise<T | never>}
     */
    unsubscribe(unregister?: boolean): Promise<void>;
    /**
     * Update options on remote server.
     *
     * @param options
     */
    updateOptions(options?: {}): Promise<PushSubscription> | undefined;
    /**
     * Ping remote server
     */
    ping(options?: {}): Promise<boolean> | undefined;
}
export declare const WebPushClientFactory: {
    isSupported(): boolean;
    /**
     * Create a client
     * @throws PushNotificationsNotSupported
     */
    create({ serviceWorkerPath, subscribeUrl, serverKey, }: {
        serviceWorkerPath: string;
        subscribeUrl: string;
        serverKey: string;
    }): Promise<WebPushClient>;
};

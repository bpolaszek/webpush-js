function encodeServerKey(serverKey) {
    var padding = '='.repeat((4 - serverKey.length % 4) % 4);
    var base64 = (serverKey + padding).replace(/\-/g, '+').replace(/_/g, '/');

    var rawData = window.atob(base64);
    var outputArray = new Uint8Array(rawData.length);

    for (var i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

function required(param = '') {
    throw new Error('Missing parameter ' + param);
}

const WebPushUtils = {

    /**
     * @returns Promise<string>
     */
    checkPermission() {
        return Notification.requestPermission();
    },

    /**
     * Return the Service Worker instance.
     *
     * @param serviceWorkerPath
     * @returns {Promise<ServiceWorkerRegistration | never>}
     */
    registerServiceWorker(serviceWorkerPath) {
        return navigator.serviceWorker.register(serviceWorkerPath).then(function (registration) {
            return registration;
        });
    },

    /**
     * Return the current subscription.
     *
     * @param ServiceWorkerRegistration
     * @returns {Promise<PushSubscription | null>}
     */
    getSubscription(ServiceWorkerRegistration) {
        return ServiceWorkerRegistration.pushManager.getSubscription();
    },
};

class RemoteStorage {

    constructor(url = required()) {
        this.url = url;
    }

    register(PushSubscription = required(), options = {}) {
        return fetch(this.url, {
            method: 'POST',
            mode: 'cors',
            credentials: 'include',
            cache: 'default',
            headers: new Headers({
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({
                subscription: PushSubscription,
                options: options,
            })
        }).then(() => {
            return PushSubscription
        });
    }

    updateOptions(PushSubscription = required(), options = {}) {
        return fetch(this.url, {
            method: 'PUT',
            mode: 'cors',
            credentials: 'include',
            cache: 'default',
            headers: new Headers({
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({
                subscription: PushSubscription,
                options: options,
            })
        }).then(() => {
            return PushSubscription
        });
    }

    unregister(PushSubscription = required()) {
        return fetch(this.url, {
            method: 'DELETE',
            mode: 'cors',
            credentials: 'include',
            cache: 'default',
            headers: new Headers({
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({
                subscription: PushSubscription,
            })
        }).then(() => {
            return true
        });
    }

    ping(PushSubscription = required(), options = {}) {
        return fetch(this.url, {
            method: 'PING',
            mode: 'cors',
            credentials: 'include',
            cache: 'default',
            headers: new Headers({
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({
                subscription: PushSubscription,
                options: options,
            })
        }).then(() => {
            return true
        });
    }
}

class WebPushClient {

    constructor({
                    isSupported = required(),
                    PermissionStatus,
                    ServiceWorkerRegistration,
                    Subscription,
                    applicationServerKey,
                    subscribeUrl
                }) {
        this.supported = isSupported;
        if (false === isSupported) {
            return;
        }
        this.permissionStatus = PermissionStatus || required('permissionStatus');
        this.registration = ServiceWorkerRegistration || required('registration');
        this.applicationServerKey = applicationServerKey || required('applicationServerKey');
        this.subscription = Subscription;

        if ('undefined' !== typeof subscribeUrl) {
            this.storage = new RemoteStorage(subscribeUrl);
        }
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
            throw Error('This browser does not support push notifications.');
        }
    }

    /**
     * Throw an error on missing URL.
     * @returns {boolean}
     */
    ensureUrlIsProvided() {
        if (!this.storage) {
            throw Error('Webpush client error: subscribeUrl has not been provided.');
        }
        return true;
    }

    /**
     * @returns {boolean}
     */
    isUrlProvided() {
        return !!this.storage;
    }

    /**
     * Return the browser's permission state for notifications.
     * Possible values: prompt / granted / denied
     */
    getPermissionState() {
        this.ensureSupported();
        return this.permissionStatus;
    }

    /**
     * Return the current PushSubscription object.
     * @returns {PushSubscription}
     */
    getSubscription() {
        return this.subscription;
    }

    /**
     * Subscribe to notifications.
     *
     * @returns {Promise<PushSubscription | never>}
     */
    subscribe(options = {}, register = this.isUrlProvided()) {
        this.ensureSupported();
        return this.registration.pushManager.subscribe({userVisibleOnly: true, applicationServerKey: this.applicationServerKey})
            .then(PushSubscription => {
                this.subscription = PushSubscription;
                return true === register && this.ensureUrlIsProvided() ? this.storage.register(PushSubscription, options) : new Promise(resolve => resolve(PushSubscription));
            });
    }

    /**
     * Unsubscribe to notifications.
     *
     * @param unregister
     * @returns {Promise<T | never>}
     */
    unsubscribe(unregister = this.isUrlProvided()) {
        this.ensureSupported();
        return WebPushUtils.getSubscription(this.registration)
            .then(PushSubscription => {
                PushSubscription.unsubscribe()
                    .then(() => {
                        this.subscription = null;
                        return true === unregister && this.ensureUrlIsProvided() ? this.storage.unregister(PushSubscription) : new Promise(resolve => resolve(true));
                    });
            });
    }

    /**
     * Update options on remote server.
     *
     * @param options
     * @returns {*}
     */
    updateOptions(options = {}) {
        this.ensureSupported();
        this.ensureUrlIsProvided();
        return this.storage.updateOptions(this.subscription, options);
    }

    /**
     * Ping remote server.
     *
     * @returns {*}
     */
    ping(options = {}) {
        this.ensureSupported();
        this.ensureUrlIsProvided();
        return this.storage.ping(this.subscription, options);
    }

}

window.WebPushClientFactory = {

    /**
     * @returns {boolean}
     */
    isSupported() {
        return 'PushManager' in window
            && 'fetch' in window
            && 'permissions' in navigator
            && 'serviceWorker' in navigator;
    },

    /**
     * Create a client
     *
     * @param serviceWorkerPath
     * @param subscribeUrl
     * @param serverKey
     * @returns {Promise<WebPushClient>}
     */
    create({
               serviceWorkerPath,
               subscribeUrl,
               serverKey,
           }) {

        if (!this.isSupported()) {
            return new Promise(resolve => {
                resolve(new WebPushClient({isSupported: false}));
            });
        }

        // Check for notifications permissions
        return WebPushUtils.checkPermission()
            .then(PermissionStatus => {

                // Register Service Worker
                return WebPushUtils.registerServiceWorker(serviceWorkerPath)
                    .then(ServiceWorkerRegistration => {

                        // Retrieve Subscription
                        return WebPushUtils.getSubscription(ServiceWorkerRegistration)
                            .then(Subscription => {

                                // Create client
                                return new WebPushClient({
                                    isSupported: true,
                                    applicationServerKey: encodeServerKey(serverKey),
                                    PermissionStatus,
                                    ServiceWorkerRegistration,
                                    Subscription,
                                    subscribeUrl
                                });

                            });

                    })

                    // In case of error
                    .catch(reason => {
                        console.warn('Webpush client cannot be started: ' + reason);
                        return new WebPushClient({isSupported: false});
                    });
            });
    }
};

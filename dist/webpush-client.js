"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
function encodeServerKey(serverKey) {
    var padding = "=".repeat((4 - (serverKey.length % 4)) % 4);
    var base64 = (serverKey + padding).replace(/\-/g, "+").replace(/_/g, "/");
    var rawData = window.atob(base64);
    var outputArray = new Uint8Array(rawData.length);
    for (var i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
function required(param) {
    if (param === void 0) { param = ""; }
    throw new Error("Missing parameter " + param);
}
var WebPushUtils = {
    checkPermission: function () {
        return Notification.requestPermission();
    },
    registerServiceWorker: function (serviceWorkerPath) {
        return navigator.serviceWorker
            .register(serviceWorkerPath)
            .then(function (registration) {
            return registration;
        });
    },
    getSubscription: function (serviceWorkerRegistration) {
        return serviceWorkerRegistration.pushManager.getSubscription();
    },
};
var RemoteStorage = /** @class */ (function () {
    function RemoteStorage(url) {
        this.url = url;
        this.url = url;
    }
    RemoteStorage.prototype.register = function (PushSubscription, options, headers) {
        if (options === void 0) { options = {}; }
        if (headers === void 0) { headers = {}; }
        return fetch(this.url, {
            method: "POST",
            mode: "cors",
            credentials: "include",
            cache: "default",
            headers: new Headers(__assign({ Accept: "application/json", "Content-Type": "application/json" }, headers)),
            body: JSON.stringify({
                subscription: PushSubscription,
                options: options,
            }),
        }).then(function () {
            return PushSubscription;
        });
    };
    RemoteStorage.prototype.updateOptions = function (PushSubscription, options) {
        if (options === void 0) { options = {}; }
        return fetch(this.url, {
            method: "PUT",
            mode: "cors",
            credentials: "include",
            cache: "default",
            headers: new Headers({
                Accept: "application/json",
                "Content-Type": "application/json",
            }),
            body: JSON.stringify({
                subscription: PushSubscription,
                options: options,
            }),
        }).then(function () {
            return PushSubscription;
        });
    };
    RemoteStorage.prototype.unregister = function (ubscription) {
        return fetch(this.url, {
            method: "DELETE",
            mode: "cors",
            credentials: "include",
            cache: "default",
            headers: new Headers({
                Accept: "application/json",
                "Content-Type": "application/json",
            }),
            body: JSON.stringify({
                subscription: ubscription,
            }),
        }).then(function () {
            return true;
        });
    };
    RemoteStorage.prototype.ping = function (PushSubscription, options) {
        if (options === void 0) { options = {}; }
        return fetch(this.url, {
            method: "PING",
            mode: "cors",
            credentials: "include",
            cache: "default",
            headers: new Headers({
                Accept: "application/json",
                "Content-Type": "application/json",
            }),
            body: JSON.stringify({
                subscription: PushSubscription,
                options: options,
            }),
        }).then(function () {
            return true;
        });
    };
    return RemoteStorage;
}());
var PushNotificationsNotSupported = /** @class */ (function (_super) {
    __extends(PushNotificationsNotSupported, _super);
    function PushNotificationsNotSupported() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return PushNotificationsNotSupported;
}(Error));
var CreateClientError = /** @class */ (function (_super) {
    __extends(CreateClientError, _super);
    function CreateClientError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return CreateClientError;
}(Error));
var WebPushClient = /** @class */ (function () {
    function WebPushClient(_a) {
        var isSupported = _a.isSupported, permissionStatus = _a.permissionStatus, serviceWorkerRegistration = _a.serviceWorkerRegistration, subscription = _a.subscription, applicationServerKey = _a.applicationServerKey, subscribeUrl = _a.subscribeUrl;
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
    WebPushClient.prototype.isSupported = function () {
        return this.supported;
    };
    /**
     * Throw an error if unsupported.
     */
    WebPushClient.prototype.ensureSupported = function () {
        if (!this.isSupported()) {
            throw Error("This browser does not support push notifications.");
        }
    };
    /**
     * Throw an error on missing URL.
     */
    WebPushClient.prototype.ensureUrlIsProvided = function () {
        if (!this.storage) {
            throw Error("Webpush client error: subscribeUrl has not been provided.");
        }
        return true;
    };
    WebPushClient.prototype.isUrlProvided = function () {
        return !!this.storage;
    };
    WebPushClient.prototype.getPermissionState = function () {
        this.ensureSupported();
        return this.permissionStatus;
    };
    /**
     * Return the current PushSubscription object.
     */
    WebPushClient.prototype.getSubscription = function () {
        return this.subscription;
    };
    /**
     * Subscribe to notifications.
     */
    WebPushClient.prototype.subscribe = function (options, register, headers) {
        var _this = this;
        if (options === void 0) { options = {}; }
        if (register === void 0) { register = this.isUrlProvided(); }
        if (headers === void 0) { headers = {}; }
        this.ensureSupported();
        return this.registration.pushManager
            .subscribe({
            userVisibleOnly: true,
            applicationServerKey: this.applicationServerKey,
        })
            .then(function (pushSubscription) {
            _this.subscription = pushSubscription;
            return true === register && _this.ensureUrlIsProvided() && _this.storage
                ? _this.storage.register(pushSubscription, options, headers)
                : new Promise(function (resolve) { return resolve(PushSubscription); });
        });
    };
    /**
     * Unsubscribe to notifications.
     *
     * @param unregister
     * @returns {Promise<T | never>}
     */
    WebPushClient.prototype.unsubscribe = function (unregister) {
        var _this = this;
        if (unregister === void 0) { unregister = this.isUrlProvided(); }
        this.ensureSupported();
        return WebPushUtils.getSubscription(this.registration).then(function (PushSubscription) {
            if (!PushSubscription) {
                return;
            }
            PushSubscription.unsubscribe().then(function () {
                _this.subscription = null;
                return true === unregister &&
                    _this.ensureUrlIsProvided() &&
                    _this.storage
                    ? _this.storage.unregister(PushSubscription)
                    : new Promise(function (resolve) { return resolve(true); });
            });
        });
    };
    /**
     * Update options on remote server.
     *
     * @param options
     */
    WebPushClient.prototype.updateOptions = function (options) {
        if (options === void 0) { options = {}; }
        this.ensureSupported();
        this.ensureUrlIsProvided();
        if (!this.storage || !this.subscription) {
            return;
        }
        return this.storage.updateOptions(this.subscription, options);
    };
    /**
     * Ping remote server
     */
    WebPushClient.prototype.ping = function (options) {
        if (options === void 0) { options = {}; }
        this.ensureSupported();
        this.ensureUrlIsProvided();
        if (!this.storage || !this.subscription) {
            return;
        }
        return this.storage.ping(this.subscription, options);
    };
    return WebPushClient;
}());
var WebPushClientFactory = {
    isSupported: function () {
        return ("PushManager" in window &&
            "fetch" in window &&
            "permissions" in navigator &&
            "serviceWorker" in navigator);
    },
    /**
     * Create a client
     * @throws PushNotificationsNotSupported
     */
    create: function (_a) {
        var serviceWorkerPath = _a.serviceWorkerPath, subscribeUrl = _a.subscribeUrl, serverKey = _a.serverKey;
        if (!this.isSupported()) {
            throw new PushNotificationsNotSupported();
        }
        return WebPushUtils.checkPermission().then(function (permissionStatus) {
            return (WebPushUtils.registerServiceWorker(serviceWorkerPath)
                .then(function (serviceWorkerRegistration) {
                return WebPushUtils.getSubscription(serviceWorkerRegistration).then(function (subscription) {
                    return new WebPushClient({
                        isSupported: true,
                        applicationServerKey: encodeServerKey(serverKey),
                        permissionStatus: permissionStatus,
                        serviceWorkerRegistration: serviceWorkerRegistration,
                        subscription: subscription,
                        subscribeUrl: subscribeUrl,
                    });
                });
            })
                // In case of error
                .catch(function (reason) {
                console.warn("Webpush client cannot be started: " + reason);
                throw new CreateClientError(reason.message);
            }));
        });
    },
};
exports.default = WebPushClientFactory;

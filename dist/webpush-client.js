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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebPushClientFactory = exports.WebPushClient = void 0;
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
var WebPushUtils = {
    checkPermission: function () {
        return Notification.requestPermission();
    },
    registerServiceWorker: function (serviceWorkerPath) {
        return navigator.serviceWorker.register(serviceWorkerPath);
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
    RemoteStorage.prototype.register = function (pushSubscription, options, headers) {
        if (options === void 0) { options = {}; }
        if (headers === void 0) { headers = {}; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch(this.url, {
                            method: "POST",
                            mode: "cors",
                            credentials: "include",
                            cache: "default",
                            headers: new Headers(__assign({ Accept: "application/json", "Content-Type": "application/json" }, headers)),
                            body: JSON.stringify({
                                subscription: pushSubscription,
                                options: options,
                            }),
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, pushSubscription];
                }
            });
        });
    };
    RemoteStorage.prototype.updateOptions = function (pushSubscription, options, headers) {
        if (options === void 0) { options = {}; }
        if (headers === void 0) { headers = {}; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch(this.url, {
                            method: "PUT",
                            mode: "cors",
                            credentials: "include",
                            cache: "default",
                            headers: new Headers(__assign({ Accept: "application/json", "Content-Type": "application/json" }, headers)),
                            body: JSON.stringify({
                                subscription: pushSubscription,
                                options: options,
                            }),
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, pushSubscription];
                }
            });
        });
    };
    RemoteStorage.prototype.unregister = function (subscription, headers) {
        if (headers === void 0) { headers = {}; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch(this.url, {
                            method: "DELETE",
                            mode: "cors",
                            credentials: "include",
                            cache: "default",
                            headers: new Headers(__assign({ Accept: "application/json", "Content-Type": "application/json" }, headers)),
                            body: JSON.stringify({
                                subscription: subscription,
                            }),
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    RemoteStorage.prototype.ping = function (pushSubscription, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch(this.url, {
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
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
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
        if (options === void 0) { options = {}; }
        if (register === void 0) { register = this.isUrlProvided(); }
        if (headers === void 0) { headers = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var pushSubscription;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.ensureSupported();
                        return [4 /*yield*/, this.registration.pushManager.subscribe({
                                userVisibleOnly: true,
                                applicationServerKey: this.applicationServerKey,
                            })];
                    case 1:
                        pushSubscription = _a.sent();
                        this.subscription = pushSubscription;
                        return [2 /*return*/, true === register && this.ensureUrlIsProvided() && this.storage
                                ? this.storage.register(pushSubscription, options, headers)
                                : new Promise(function (resolve) { return resolve(PushSubscription); })];
                }
            });
        });
    };
    /**
     * Unsubscribe to notifications.
     */
    WebPushClient.prototype.unsubscribe = function (unregister, headers) {
        if (unregister === void 0) { unregister = this.isUrlProvided(); }
        if (headers === void 0) { headers = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var pushSubscription;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.ensureSupported();
                        return [4 /*yield*/, WebPushUtils.getSubscription(this.registration)];
                    case 1:
                        pushSubscription = _a.sent();
                        if (!pushSubscription) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, pushSubscription.unsubscribe()];
                    case 2:
                        _a.sent();
                        this.subscription = null;
                        return [2 /*return*/, true === unregister && this.ensureUrlIsProvided() && this.storage
                                ? this.storage.unregister(pushSubscription, headers)
                                : new Promise(function (resolve) { return resolve(true); })];
                }
            });
        });
    };
    /**
     * Update options on remote server.
     */
    WebPushClient.prototype.updateOptions = function (options, headers) {
        if (options === void 0) { options = {}; }
        if (headers === void 0) { headers = {}; }
        this.ensureSupported();
        this.ensureUrlIsProvided();
        if (!this.storage || !this.subscription) {
            return;
        }
        return this.storage.updateOptions(this.subscription, options, headers);
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
exports.WebPushClient = WebPushClient;
exports.WebPushClientFactory = {
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
        return __awaiter(this, void 0, void 0, function () {
            var permissionStatus, serviceWorkerRegistration, subscription, e_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.isSupported()) {
                            throw new PushNotificationsNotSupported();
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, WebPushUtils.checkPermission()];
                    case 2:
                        permissionStatus = _b.sent();
                        return [4 /*yield*/, WebPushUtils.registerServiceWorker(serviceWorkerPath)];
                    case 3:
                        serviceWorkerRegistration = _b.sent();
                        return [4 /*yield*/, WebPushUtils.getSubscription(serviceWorkerRegistration)];
                    case 4:
                        subscription = _b.sent();
                        return [2 /*return*/, new WebPushClient({
                                isSupported: true,
                                applicationServerKey: encodeServerKey(serverKey),
                                permissionStatus: permissionStatus,
                                serviceWorkerRegistration: serviceWorkerRegistration,
                                subscription: subscription,
                                subscribeUrl: subscribeUrl,
                            })];
                    case 5:
                        e_1 = _b.sent();
                        console.warn("Webpush client cannot be started: " + e_1);
                        throw new CreateClientError(e_1 instanceof Error ? e_1.message : "");
                    case 6: return [2 /*return*/];
                }
            });
        });
    },
};

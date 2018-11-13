# WebPush Client

Handles subscription / unsubscription of Webpush notifications in sync with a remote server.

## Installation

The library ships with both a client and a service worker.

### In a browser

* Copy `dist/webpush-client.min.js` and `dist/webpush-sw.js` in your project.

### In a JS project

* Run `yarn add webpush-client` or `npm install --save webpush-client`


## Configuration

### In a browser


```html
<script src="/js/webpush-client.js"></script>
<script>

    var WebPushClient;
    if (WebPushClientFactory.isSupported()) {
        WebPushClientFactory.create({
            serviceWorkerPath: '/js/webpush-sw.js', // Public path to the service worker
            serverKey: 'my_server_key', // https://developers.google.com/web/fundamentals/push-notifications/web-push-protocol#application_server_keys
            subscribeUrl: '/webpush', // Optionnal - your application URL to store webpush subscriptions
        })
            .then(Client => {
                WebPushClient = Client;
            })
        ;
    }
</script>
```

### In a JS project

```javascript
import Webpush from 'webpush-client'

Webpush.create({
    serviceWorkerPath: '/js/webpush-sw.js', // Public path to the service worker
    serverKey: 'my_server_key', // https://developers.google.com/web/fundamentals/push-notifications/web-push-protocol#application_server_keys
    subscribeUrl: '/webpush', // Optionnal - your application URL to store webpush subscriptions
})
    .then(WebPushClient => {
        // do stuff with WebPushClient
    })
;
```

## Usage

* `WebPushClient.isSupported()`
> Return whether or not the browser AND the server both support Push notifications.

* `WebPushClient.getPermissionState()` 
> Return if Push notifications are allowed for your domain. _Possible values: `prompt`, `granted`, `denied`_

* `WebPushClient.getSubscription()`
> Will return null if not subscribed or a `PushSubscription` object.

* `WebPushClient.subscribe([options])`
> Subscribe browser to Push Notifications. The browser will ask for permission if needed.
Return a Promise which resolves to the `PushSubscription` object (or will be rejected in case of access denied)

* `WebPushClient.unsubscribe([options])`
> Subscribe browser to Push Notifications. The browser will ask for permission if needed.
Return a Promise which resolves to the `PushSubscription` object (or will be rejected in case of access denied) 

#### subscribeUrl

When the `subscribeUrl` option is provided, `WebPushClient.subscribe([options])` will POST a JSON containing both the `PushSubscription` and the `options` objects:

```json
{
  "subscription": {
    "endpoint": "http://endpoint",
    "keys": {
      "p256dh": "public key",
      "auth": "private key"
    }
  },
  "options": {}
}
```

The request will include current credentials allowing you to associate the current user logged in to the `PushSubscription` object and an optionnal, arbitrary `options` object of your own.

`WebPushClient.unsubscribe([options])` will issue a DELETE request on `subscribeUrl` with the same body.

It's now up to you to handle these infos properly on the server side. Have a look at [the RemoteStorage class](https://github.com/bpolaszek/webpush-js/blob/master/src/webpush-client.js#L50) to check out how these requests are generated.

If your application runs on Symfony, you can have a look at [bentools/webpush-bundle](https://github.com/bpolaszek/webpush-bundle) for which this JS was originally designed for. 


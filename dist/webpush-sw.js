self.addEventListener("push", (event) => {
  try {
    const Notification = event.data.json();
    if (
      Notification.options.data &&
      typeof Notification.options.data === "string"
    ) {
      Notification.options.data = JSON.parse(Notification.options.data);
    }
    event.waitUntil(
      self.registration.showNotification(
        Notification.title || "",
        Notification.options || {}
      )
    );
  } catch (e) {
    try {
      const Notification = event.data.text();
      event.waitUntil(
        self.registration.showNotification("Notification", {
          body: Notification,
        })
      );
    } catch (e) {
      event.waitUntil(self.registration.showNotification(""));
    }
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  // Since data.link doesn't work with iOS, use tag to send the URL.
  const url = event.notification.tag || event.notification.data.link || "";

  if (url.length > 0) {
    event.waitUntil(
      clients
        .matchAll({
          type: "window",
        })
        .then((windowClients) => {
          for (const client of windowClients) {
            if (client.url === url && "focus" in client) {
              return client.focus();
            }
          }

          if (clients.openWindow) {
            return clients.openWindow(url);
          }
        })
    );
  }
});

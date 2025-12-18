importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAN9seJzxaH0RNMmyhDIXAwZaa6xMxdphs",
  authDomain: "jpiai-2f83e.firebaseapp.com",
  projectId: "jpiai-2f83e",
  storageBucket: "jpiai-2f83e.firebasestorage.app",
  messagingSenderId: "126496230056",
  appId: "1:126496230056:web:510e47c8529d516dcfd09d",
  measurementId: "G-6320E0SK2P"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Received background message ", payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/logo.jpg",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

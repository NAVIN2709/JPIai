import { getToken } from "firebase/messaging";
import { messaging } from "../../firebase/config";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/config";

export async function requestPermissionAndSaveToken(uid) {
  try {
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.log("Permission denied");
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_VAPID_KEY,
      serviceWorkerRegistration: await navigator.serviceWorker.register("/firebase-messaging-sw.js")
    });

    if (!token) return null;

    console.log("FCM Token:", token);

    await updateDoc(doc(db, "users", uid), {
      fcmToken: token,
    });

    return token;
  } catch (err) {
    console.error("FCM Error", err);
    return null;
  }
}

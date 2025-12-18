const functions = require("firebase-functions/v2");
const admin = require("firebase-admin");

admin.initializeApp();

exports.sendGenerationNotification = functions.firestore
  .document("generations/{genId}")
  .onWrite(async (change, context) => {
    const after = change.after.data();
    const before = change.before.data();

    // Only send notification when status goes from anything → "done"
    if (!before || before.status === "done") return;
    if (after.status !== "done") return;

    const userId = after.userId;
    const imageUrl = after.imageUrl;

    // Fetch user data
    const userRef = admin.firestore().collection("users").doc(userId);
    const user = await userRef.get();

    if (!user.exists) {
      console.log("User not found for notification");
      return;
    }

    const fcmToken = user.data().fcmToken;
    if (!fcmToken) {
      console.log("User has no FCM token");
      return;
    }

    const message = {
      token: fcmToken,
      notification: {
        title: "Your Generation is Ready 🎉",
        body: "Tap to view your generated result.",
      },
      data: {
        imageUrl,
        genId: context.params.genId
      }
    };

    try {
      await admin.messaging().send(message);
      console.log("Notification sent to:", userId);
    } catch (err) {
      console.error("Error sending notification:", err);
    }
  });

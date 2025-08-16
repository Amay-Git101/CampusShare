import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

// Initialize the Firebase Admin SDK
admin.initializeApp();

/**
 * Cloud Function to send a notification when a new trip request is created.
 * This uses the v2 API, which is strongly typed and simpler.
 */
export const onNewRequest = onDocumentCreated("requests/{requestId}", async (event) => {
  // The event.data is the new document snapshot
  const snap = event.data;
  if (!snap) {
    logger.log("No data associated with the event, exiting function.");
    return;
  }
  const requestData = snap.data();
  const hostUid = requestData.hostUid;
  const senderName = requestData.senderName;

  // Get the host's user document to find their FCM token
  const userDocRef = admin.firestore().collection("users").doc(hostUid);
  const userDoc = await userDocRef.get();

  if (!userDoc.exists) {
    logger.log(`User document for host UID ${hostUid} not found.`);
    return;
  }

  const userData = userDoc.data();
  const fcmToken = userData?.fcmToken;

  if (!fcmToken) {
    logger.log(`No FCM token for user ${hostUid}, cannot send notification.`);
    return;
  }

  // Construct the notification message payload with the correct types
  const message: admin.messaging.Message = {
    token: fcmToken,
    notification: {
      title: "You have a new trip request! 🚗",
      body: `${senderName} wants to join your trip.`,
    },
    webpush: {
      fcmOptions: { // Note: It's 'fcmOptions' not 'fcm_options'
        link: "https://your-app-url.com/requests",
      },
    },
  };

  try {
    logger.log(`Sending notification to token: ${fcmToken}`);
    await admin.messaging().send(message);
    logger.log("Successfully sent notification.");
  } catch (error) {
    logger.error("Error sending notification:", error);
  }
});
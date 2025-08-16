// src/lib/firebase-messaging-utils.ts

import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { app, db } from "./firebase"; // Use your existing firebase app instance
import { doc, setDoc } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";

const VAPID_KEY = "BEsHmfXBW-UNFC5eYCCtSs4gVmgjc2qsfj5AvQLCNlHCx5nwTvFkmq4UG-oFqPJv-C2MSvMG-aEHNWGBoUQ6vr0"; // We will get this from the Firebase Console

export const requestNotificationPermission = async (uid: string) => {
  console.log("Requesting notification permission...");

  try {
    const messaging = getMessaging(app);
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      console.log("Notification permission granted.");
      
      const currentToken = await getToken(messaging, {
        vapidKey: VAPID_KEY,
      });

      if (currentToken) {
        console.log("FCM Token:", currentToken);
        // Save the token to the user's document in Firestore
        const userDocRef = doc(db, "users", uid);
        await setDoc(userDocRef, { fcmToken: currentToken }, { merge: true });
        
        // Listen for foreground messages
        onMessage(messaging, (payload) => {
            console.log("Foreground message received. ", payload);
            toast({
                title: payload.notification?.title || "New Notification",
                description: payload.notification?.body || "",
            });
        });

      } else {
        console.log("No registration token available. Request permission to generate one.");
      }
    } else {
      console.log("Unable to get permission to notify.");
    }
  } catch (err) {
    console.error("An error occurred while retrieving token. ", err);
  }
};
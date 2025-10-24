// (profile)/utils/pushNotification.tsx
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from 'react-native';
import { updateUser } from "@/services/userService";

// ensure you set this in app.json/app.config (EAS project)
const EAS_PROJECT_ID = "60c83ab0-87d2-482c-aeb7-4e7f845edfae";

async function getOrAskPushPermissions() {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") throw new Error("Push permission not granted");
  }
}

export async function registerForPushAndSave(userDocId: string) {
  if (!Device.isDevice) throw new Error("Use a physical device for push");
  // Android channel
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  await getOrAskPushPermissions();

  const token = (await Notifications.getExpoPushTokenAsync({
    projectId: EAS_PROJECT_ID,
  })).data;

  await updateUser(userDocId, { pushEnabled: true });

  return token; // IMPORTANT: return token for immediate push
}

// client-side push sender to Expo API
export async function sendExpoPush(token: string, title: string, body: string, data?: any) {
  const payload = [{ to: token, sound: "default", title, body, data }];
  const res = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Expo push failed: ${res.status} ${text}`);
  }
}
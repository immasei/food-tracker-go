// app/index.tsx
import { Redirect } from "expo-router";

import * as Notifications from "expo-notifications";

// iOS: show while foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function Index() {
  return <Redirect href="/(main)/tracker" />;
}
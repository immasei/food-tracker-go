// app/_layout.tsx
// This is the root layout file default for the whole app.
// The tab switch layout file is app/(main)/_layout.tsx

import React from "react";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useColorScheme } from "react-native";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../contexts/AuthContext";
import * as Notifications from "expo-notifications";
import 'react-native-get-random-values';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  const colorScheme = useColorScheme();  // Detect light/dark mode

  return (
    <AuthProvider> {/* Provide auth context globally */}
      <SafeAreaProvider> {/* Safe area context for avoiding notches and edges */}
        {/* Status bar color auto switch (light/dark mode) */}
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />

        {/* Use Stack navigation globally */}
        <Stack
          screenOptions={{
            headerShown: true,
            headerTitleAlign: "center", // Header title align to center
            headerStyle: { },
            headerTitleStyle: { fontSize: 18, fontWeight: "bold" },
            headerShadowVisible: true, // Enable the bottom shadow line
          }}
        >
          {/* Index page */}
          <Stack.Screen
            name="index"
            options={{
              title: "Food Tracker Go",
              headerShown: false,
            }}
          />

          {/* Login & Signup page */}
          <Stack.Screen
            name="(auth)"
            options={{
              title: "",
              headerShown: false,
            }}
          />

          {/* Main page (Tab navigation defined in app/(main)/_layout.tsx) */}
          <Stack.Screen
            name="(main)"
            options={{
              title: "Food Tracker Go",
              headerShown: false, // Hide the top title bar of the Stack
            }}
          />

          {/* Settings page */}
          <Stack.Screen
            name="(settings)/settings"
            options={{
              title: "Settings",
              headerShown: true,
            }}
          />

          {/* Old profile page */}
          <Stack.Screen
            name="(profile)/profile"
            options={{
              title: "User Profile",
              headerShown: true,
            }}
          />

          {/* New profile page */}
          <Stack.Screen
            name="(profile2)/UserProfile"
            options={{
              title: "User Profile",
              headerShown: true,
            }}
          />
        </Stack>
      </SafeAreaProvider>
    </AuthProvider>
  );
}
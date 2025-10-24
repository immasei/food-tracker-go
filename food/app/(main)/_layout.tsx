// app/(main)/_layout.tsx
// This is the layout file only for the 4 tab switch.
// 4 tabs: Food, Camera, Recipe, Profile
// The app's' default layout file is app/_layout.tsx

import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AuthOnly from "../../contexts/AuthOnly";

export default function MainLayout() {
  return (
    <AuthOnly>
      {/* AuthOnly: Require the pages to login */}
      <Tabs
        screenOptions={{
          headerShown: true,
          headerTitleAlign: "center",
          //headerStyle: { height: 50},
          headerTitleStyle: { fontSize: 18, fontWeight: "bold" },
          tabBarActiveTintColor: "#07f",
          tabBarInactiveTintColor: "#777",
          tabBarStyle: { height: 70 },
          tabBarLabelStyle: { fontSize: 12, fontWeight: "medium", marginBottom: 0 },
          tabBarIconStyle: { marginTop: 0 },
          tabBarHideOnKeyboard: true,
        }}
      >

        {/* Tab 1: Food Tracker page */}
        <Tabs.Screen
          name="tracker"
          options={{
            title: "Tracker",
            headerTitle: "Food Tracker",
            tabBarIcon: () => <Ionicons size={24} name="pizza-outline" />,
          }}
        />

        {/* Tab 2: Scanner page */}
        <Tabs.Screen
          name="scanner"
          options={{
            title: "Scanner",
            headerTitle: "Add food by Scanner",
            tabBarIcon: () => <Ionicons size={24} name="scan-outline" />,
          }}
        />

        {/* Tab 3: AI Recipe Generator */}
        <Tabs.Screen
          name="recipe"
          options={{
            title: "Recipe",
            headerTitle: "AI Recipe Generator",
            tabBarIcon: () => <Ionicons size={24} name="sparkles-outline" />,
          }}
        />

        {/* Tab 4: nearby food discovery */}
        <Tabs.Screen
          name="nearby"
          options={{
            title: "Nearby",
            headerTitle: "Discover Nearby Food",
            tabBarIcon: () => <Ionicons size={24} name="location-outline" />,
          }}
        />

        {/* Tab 5: User Profile */}
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            headerTitle: "User Profile",
            tabBarIcon: () => <Ionicons size={24} name="person-outline" />,
          }}
        />
      </Tabs>

      {/* <Tabs>
        <Tabs.Screen
          name="tracker"
          options={{
            title: "Tracker",
            tabBarIcon: () => <Ionicons size={24} name="pizza-outline" />,
          }}
        />
        <Tabs.Screen
          name="scanner"
          options={{
            title: "Scanner",
            tabBarIcon: () => <Ionicons size={24} name="scan-outline" />,
          }}
        />
        <Tabs.Screen
          name="recipe"
          options={{
            title: "Recipe",
            tabBarIcon: () => <Ionicons size={24} name="sparkles-outline" />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: () => <Ionicons size={24} name="person-outline" />,
          }}
        />
      </Tabs> */}
    </AuthOnly>
  );
};

import { StyleSheet, Text, SafeAreaView, View } from "react-native";
import React from "react";
import { Slot, Tabs } from "expo-router";
import {
  SafeAreaProvider,
  // SafeAreaView,
} from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

type Props = {};

const RootLayout = (props: Props) => {
  return (
    <SafeAreaProvider>
      <Tabs>
        <Tabs.Screen
          name="(tracker)"
          options={{
            title: "Tracker",
            tabBarIcon: () => <Ionicons size={24} name="pizza-outline" />,
          }}
        />
        <Tabs.Screen
          name="(scanner)"
          options={{
            title: "Scanner",
            tabBarIcon: () => <Ionicons size={24} name="scan-outline" />,
          }}
        />
        <Tabs.Screen
          name="(recipe)"
          options={{
            title: "Recipe",
            tabBarIcon: () => <Ionicons size={24} name="sparkles-outline" />,
          }}
        />
        <Tabs.Screen
          name="(users)"
          options={{
            title: "Profile",
            tabBarIcon: () => <Ionicons size={24} name="person-outline" />,
          }}
        />
      </Tabs>
    </SafeAreaProvider>
  );
};

export default RootLayout;
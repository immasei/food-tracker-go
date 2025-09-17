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
          name="index"
          options={{
            title: "Images",
            tabBarIcon: () => <Ionicons size={24} name="image" />,
          }}
        />
        <Tabs.Screen
          name="camera"
          options={{
            title: "Camera",
            tabBarIcon: () => <Ionicons size={24} name="camera" />,
          }}
        />
        <Tabs.Screen
          name="externalwebview"
          options={{
            title: "Web",
            tabBarIcon: () => <Ionicons size={24} name="browsers" />,
          }}
        />
        <Tabs.Screen
          name="(tracker)"
          options={{
            title: "Food",
            tabBarIcon: () => <Ionicons size={24} name="fast-food-outline" />,
          }}
        />
        <Tabs.Screen
          name="(users)"
          options={{
            title: "Profile",
            tabBarIcon: () => <Ionicons size={24} name="person" />,
          }}
        />
      </Tabs>
    </SafeAreaProvider>
  );
};

export default RootLayout;
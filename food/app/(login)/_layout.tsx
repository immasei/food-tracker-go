import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Slot, Tabs } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

type Props = {};

const LogInLayout = (props: Props) => {
  return (
    <SafeAreaProvider>
        <Slot />
    </SafeAreaProvider>
  );
};

export default LogInLayout;
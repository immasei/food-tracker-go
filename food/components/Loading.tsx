
import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";

type LoadingProps = {
  text?: string;
  size?: "small" | "large";
};

export default function Loading({ text = "Loading…", size = "large" }: LoadingProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    marginTop: 8,
    fontSize: 16,
    color: "#555",
  },
});

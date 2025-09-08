import React, { useState } from "react";
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import CaptionedImage from "../components/CaptionedImage";

type Props = {};

// const source: {} = require("../assets/cat.jpg");
const source: {} = {
  uri: "https://images.unsplash.com/photo-1561948955-570b270e7c36?q=80&w=901&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
};
const credit = "Photo by 'hang niu' on Unsplash";

const Home = (props: Props) => {
  // loaded variable checks if the media is loaded.
  const [loaded, setLoaded] = useState(false);
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {loaded ? (
          <CaptionedImage source={source} credit={credit} />
        ) : (
          <Text style={styles.placeholder}>
            Tap “Load Media to show Media"
          </Text>
        )}
      </View>

      <View style={styles.footer}>
        <Pressable
          style={[styles.btn, styles.primary]}
          onPress={() => setLoaded(true)}
          accessibilityRole="button"
        >
          <Text style={styles.btnText}>Load Media</Text>
        </Pressable>

        <Pressable
          style={[styles.btn, styles.secondary]}
          onPress={() => setLoaded(false)}
          accessibilityRole="button"
        >
          <Text style={styles.btnText}>Unload Media</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  placeholder: { color: "#777", fontSize: 16, textAlign: "center" },
  footer: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e5e7eb",
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  primary: { backgroundColor: "#2563eb", marginRight: 12 },
  secondary: { backgroundColor: "#6b7280" },
  btnText: { color: "#fff", fontWeight: "600" },
});
// Component to pop-up a message with app icon, title, text at the top of the screen.

import React, { useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View, Image } from "react-native";

export const useMessage = () => {
  const [title, setTitle] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  const showMessage = (title: string, text: string, timeMs: number = 3000) => {
    setTitle(title);
    setMsg(text);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start(() => {
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: -20, duration: 200, useNativeDriver: true }),
        ]).start(() => setMsg(null));
      }, timeMs);
    });
  };

  const Message = () =>
    msg ? (
      <Animated.View
        style={[
          styles.message,
          { opacity, transform: [{ translateY }] },
        ]}
      >
        <Image source={require("../../assets/icon.png")} style={styles.icon} />
        <View style={styles.messageTextContainer}>
          <Text style={styles.messageTitle}>{title}</Text>
          <Text style={styles.messageText}>{msg}</Text>
        </View>
      </Animated.View>
    ) : null;

  return { showMessage, Message };
};

const styles = StyleSheet.create({
  message: {
    position: "absolute",
    top: 8, 
    left: 12,
    right: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#d7d7d7", 
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    marginRight: 10,
  },
  messageTextContainer: {
    flex: 1,
  },
  messageTitle: { 
    color: "#000", 
    fontSize: 16,
    textAlign: "left", 
    fontWeight: "700", 
  },
  messageText: { 
    color: "#777", 
    fontSize: 16,
    textAlign: "left", 
    fontWeight: "500", 
  },
});

import React, { useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text } from "react-native";

type ToastVariant = "success" | "warning" | "danger" | "info";

export const useToast = () => {
  const [msg, setMsg] = useState<string | null>(null);
  const [variant, setVariant] = useState<ToastVariant>("info");
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  const show = (text: string, v: ToastVariant = "info") => {
    setMsg(text);
    setVariant(v);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start(() => {
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: -20, duration: 200, useNativeDriver: true }),
        ]).start(() => setMsg(null));
      }, 1800);
    });
  };

  const Toast = () =>
    msg ? (
      <Animated.View
        style={[
          styles.toast,
          { opacity, transform: [{ translateY }] },
          variant === "success" && styles.toastSuccess,
          variant === "warning" && styles.toastWarning,
          variant === "danger" && styles.toastDanger,
          variant === "info" && styles.toastInfo,
        ]}
      >
        <Text style={styles.toastText}>{msg}</Text>
      </Animated.View>
    ) : null;

  return { show, Toast };
};

const styles = StyleSheet.create({
  // Top toast
  toast: {
    position: "absolute",
    top: 5, 
    left: 16,
    right: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1
  },
  toastText: { color: "#000", textAlign: "center", fontWeight: "500" },
  toastSuccess: { backgroundColor: "#D1E7DE", borderColor: "#A3CFBB" }, // green
  toastWarning: { backgroundColor: "#FFF3CD", borderColor: "#FFE69C"  }, // yellow
  toastDanger: { backgroundColor: "#F9D7DA", borderColor: "#F1AEB5" },  // red
  toastInfo: { backgroundColor: "#CFF4FC", borderColor: "#9EEAF9" },    // blue
});

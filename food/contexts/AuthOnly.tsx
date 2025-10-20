import React, { useContext, useEffect } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useRouter, useRootNavigationState, Redirect } from "expo-router";
import { Text, View, ActivityIndicator } from "react-native";

type Props = { children: React.ReactNode };

export default function AuthOnly({ children }: Props) {
  // const context = useContext(AuthContext);
  const { authChecked, user } = useContext(AuthContext);
  const router = useRouter();
  const rootNav = useRootNavigationState();

  // wait until the root navigator exists
  if (!rootNav?.key) return null;

  if (authChecked && !user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!authChecked || !user) {
    return (
      <View style={{ flex:1, justifyContent:"center", alignItems:"center" }}>
        <ActivityIndicator size="large" />
        <Text>Loading2…</Text>
      </View>
    );
  }

  return children;
}
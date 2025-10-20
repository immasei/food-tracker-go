import React, { useContext, useEffect } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useRouter, useRootNavigationState, Redirect } from "expo-router";
import { Text, View, ActivityIndicator } from "react-native";

type Props = { children: React.ReactNode };

export default function NoAuthOnly({ children }: Props) {
  // const context = useContext(AuthContext);
  const { authChecked, user } = useContext(AuthContext);
  const router = useRouter();
  const rootNav = useRootNavigationState();

  // wait until the root navigator exists
  if (!rootNav?.key) return null;

  if (authChecked && user) {
    return <Redirect href="/(main)/tracker" />;
  }

  return children;
}
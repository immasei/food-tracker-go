import React, { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useRootNavigationState, Redirect } from "expo-router";
import Loading from "@/components/Loading"

type Props = { children: React.ReactNode };

export default function AuthOnly({ children }: Props) {
  const { authChecked, user } = useContext(AuthContext);
  const rootNav = useRootNavigationState();

  // wait until the root navigator exists
  if (!rootNav?.key) return null;

  if (authChecked && !user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!authChecked || !user) {
    return <Loading text="Checking auth..."/>;
  }

  return children;
}
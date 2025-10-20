import React, { useContext } from "react";
import { Stack } from "expo-router";
import { AuthContext } from "../../contexts/AuthContext";
import NoAuthOnly from "../../contexts/NoAuthOnly";

type Props = {};

const AuthLayout = (props: Props) => {
  const context = useContext(AuthContext);
  console.log(context.user);

  return (
    <NoAuthOnly>
      <Stack screenOptions={{ headerShown: false, animation: "none" }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
      </Stack>
    </NoAuthOnly>
  );
};

export default AuthLayout;
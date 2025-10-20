import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AuthOnly from "../../contexts/AuthOnly";

type Props = {};

const MainLayout = (props: Props) => {
  return (
    <AuthOnly>
      <Tabs>
				<Tabs.Screen
					name="tracker"
					options={{
						title: "Tracker",
						tabBarIcon: () => <Ionicons size={24} name="pizza-outline" />,
					}}
				/>
				<Tabs.Screen
					name="scanner"
					options={{
						title: "Scanner",
						tabBarIcon: () => <Ionicons size={24} name="scan-outline" />,
					}}
				/>
				<Tabs.Screen
					name="recipe"
					options={{
						title: "Recipe",
						tabBarIcon: () => <Ionicons size={24} name="sparkles-outline" />,
					}}
				/>
				<Tabs.Screen
					name="profile"
					options={{
						title: "Profile",
						tabBarIcon: () => <Ionicons size={24} name="person-outline" />,
					}}
				/>
			</Tabs>
    </AuthOnly>
  );
};

export default MainLayout;
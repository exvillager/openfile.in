import React from "react";
import { Tabs } from "expo-router";
import { Platform, View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AntDesign } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { COLORS } from "@/src/constant";

function TabIcon({
  name,
  focused,
  color,
}: {
  name: React.ComponentProps<typeof AntDesign>["name"];
  focused: boolean;
  color: string;
}) {
  return (
    <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
      <AntDesign name={name} size={20} color={color} />
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, Platform.OS === "ios" ? 16 : 8);
  const tabHeight = 56 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.brand,
        tabBarInactiveTintColor: COLORS.icon,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          letterSpacing: 0.3,
          marginTop: 1,
        },
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopColor: COLORS.border,
          height: tabHeight,
          paddingTop: 6,
          paddingBottom: bottomPadding,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.25,
          shadowRadius: 6,
        },
      }}
      screenListeners={{
        tabPress: () => {
          if (Platform.OS !== "web") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Create",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="plus" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="links"
        options={{
          title: "My Links",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="link" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="create-link" options={{ href: null }} />
      <Tabs.Screen
        name="(profile)"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="user" focused={focused} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 60,
    height: 30,
    borderRadius: 14,
    marginBottom: 2,
  },
  iconContainerFocused: {
    backgroundColor: "rgba(99, 102, 241, 0.15)",
  },
});

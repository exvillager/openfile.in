import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-gesture-handler";
import "react-native-reanimated";
import "./global.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { COLORS } from "@/src/constant";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" backgroundColor={COLORS.background} />
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
        </Stack>
      </QueryClientProvider>
    </>
  );
}

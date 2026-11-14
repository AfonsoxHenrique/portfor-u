import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar"
import { useEffect } from "react";
import { Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SystemUI from "expo-system-ui";
import * as NavigationBar from "expo-navigation-bar";
import { ThemeProvider, useTheme } from "../theme/ThemeContext";

const AppShell = () => {
  const { isDark , colors } = useTheme();
  
  useEffect(() => {
        SystemUI.setBackgroundColorAsync(colors.surface);
        if (Platform.OS === "android") {
            NavigationBar.setStyle(isDark ? "dark" : "light");
        }
    }, [isDark, colors.surface]);
    
  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(dashboard)" />
        <Stack.Screen name="(profile)" />
      </Stack>
    </>
  );
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppShell />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

import { Redirect, Stack } from "expo-router";
import { Platform } from "react-native";

export default function AuthLayout() {
    if (Platform.OS === "web") return <Redirect href="/" />;
    return <Stack screenOptions={{ headerShown: false, animation: none }} />;
}


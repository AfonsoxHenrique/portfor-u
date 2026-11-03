import { Stack } from "expo-router";

export const unstable_settings = {
  anchor: "profile",
};

export default function ProfileLayout() {
    return (
        <>
        <Stack screenOptions={{ headerShown: false, animation: "none" }} />
        </>
    )
}


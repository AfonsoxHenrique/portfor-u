import { Stack } from "expo-router";

export const unstable_settings = {
  anchor: "resume",
};

export default function ResumeLayout() {
    return (
        <>
        <Stack screenOptions={{ headerShown: false, animation: "none" }} />
        </>
    )
}


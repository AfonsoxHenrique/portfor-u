import { Stack } from "expo-router";

export const unstable_settings = {
  anchor: "certificates",
};

export default function CertificateLayout() {
    return (
        <>
        <Stack screenOptions={{ headerShown: false, animation: "none" }} />
        </>
    )
}


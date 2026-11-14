import { Platform, View, ActivityIndicator } from "react-native";
import { Redirect, Stack } from "expo-router";
import { useAuthUser } from "../../hooks/useAuthUser";
import { useTheme } from "../../theme/ThemeContext";

export default function ProfileLayout() {
    const { user, initializing } = useAuthUser();
    const { colors } = useTheme();

    if (Platform.OS === "web") return <Redirect href="/" />;

    if (initializing) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
                <ActivityIndicator color={colors.accentBlue} />
            </View>
        );
    }

    if (!user) return <Redirect href="/" />;
    if (!user.emailVerified) return <Redirect href="/verify-email" />;

    return <Stack screenOptions={{ headerShown: false }} />;
}
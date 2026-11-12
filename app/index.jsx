import { useMemo } from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity, ActivityIndicator, Platform } from "react-native";
import { Redirect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../theme/ThemeContext";
import { useAuthUser } from "../hooks/useAuthUser";

import WebLanding from "../components/WebLanding";

const MobileWelcome = () => {
    const router = useRouter()
    const { user, initializing } = useAuthUser()
    const { colors, spacing, radius, isDark } = useTheme()
    const styles = useMemo(() => createStyles(colors, spacing, radius), [colors, spacing, radius])

    // Firebase is still restoring the saved session
    if (initializing) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator color={colors.navy} />
            </View>
        )
    }

    // Skip welcome screen if logged in
    if (user) {
        return <Redirect href={user.emailVerified ? "/home" : "/verify-email"} />
    }

    return (
        <SafeAreaView style={styles.container}>
            <Image
                style={styles.illustration}
                source={
                    isDark ?
                    require('../assets/Portfor-3W.png') : require('../assets/Portfor-3.png')}
                resizeMode="contain"
            />
            <Text style={styles.headline}>Your Professional Launchpad</Text>
            <Text style={styles.description}>
                Organize your resume, log your project experience, showcase certificates and badges,
                and learn from the guidelines.
            </Text>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.primaryButton}
                    activeOpacity={0.85}
                    onPress={() => router.push("/signup")}
                >
                    <Text style={styles.primaryButtonText}>Create a new Account</Text>
                    <Ionicons name="arrow-forward" size={18} color={colors.white} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.secondaryButton}
                    activeOpacity={0.85}
                    onPress={() => router.push("/login")}
                >
                    <Text style={styles.secondaryButtonText}>Sign In</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
};


export default function Index(){
     return Platform.OS === "web" ? <WebLanding /> : <MobileWelcome />;
}

const createStyles = (colors, spacing, radius) => StyleSheet.create({
    loading: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.background,
    },
    container: {
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        justifyContent: "space-between",
    },
    illustration: {
        width: "100%",
        height: 240,
        marginTop: 36,
    },
    headline: {
        fontSize: 22,
        fontWeight: "700",
        color: colors.textPrimary,
        textAlign: "center",
        marginTop: spacing.lg,
    },
    description: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: "center",
        marginTop: spacing.sm,
        lineHeight: 20,
        paddingHorizontal: spacing.sm,
    },
    actions: {
        marginBottom: spacing.lg,
    },
    primaryButton: {
        flexDirection: "row",
        backgroundColor: colors.navy,
        borderRadius: radius.md,
        paddingVertical: 14,
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.sm,
    },
    primaryButtonText: {
        color: colors.white,
        fontSize: 15,
        fontWeight: "700",
    },
    secondaryButton: {
        borderWidth: 1.5,
        borderColor: colors.border,
        borderRadius: radius.md,
        paddingVertical: 14,
        alignItems: "center",
        justifyContent: "center",
        marginTop: spacing.sm,
    },
    secondaryButtonText: {
        color: colors.textPrimary,
        fontSize: 15,
        fontWeight: "700",
    },
})
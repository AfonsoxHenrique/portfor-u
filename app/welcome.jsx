import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../theme/colors";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

const Welcome = () => {
    const router = useRouter()

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <Image 
                    style={styles.illustration} 
                    source={require('../assets/Portfor-3.png')}
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
                        onPress={() => router.push("signup")}
                    >
                        <Text style={styles.primaryButtonText}>Create a new Account</Text>
                        <Ionicons name="arrow-forward" size={18} color={colors.white} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.secondaryButton}
                        activeOpacity={0.85}
                        onPress={() => router.push("login")}
                    >
                        <Text style={styles.secondaryButtonText}>Sign In</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    )
}

export default Welcome

const styles = StyleSheet.create({
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

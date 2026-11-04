import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Alert, AppState } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { sendEmailVerification } from "firebase/auth";

import { auth } from "../../firebase/firebase";
import { useTheme } from "../../theme/ThemeContext";

const VerifyEmail = () => {
    const router = useRouter();
    const { colors, spacing, radius } = useTheme();
    const styles = useMemo(() => createStyles(colors, spacing, radius), [colors, spacing, radius]);

    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);

    // Auto-check when the user comes back from their email app
    useEffect(() => {
        const sub = AppState.addEventListener("change", async (state) => {
            if (state !== "active" || !auth.currentUser) return;
            try {
                await auth.currentUser.reload();
                if (auth.currentUser?.emailVerified) router.replace("/home");
            } catch (error) {
                console.log("Auto verification check failed:", error);
            }
        });
        return () => sub.remove();
    }, []);

    const checkVerification = async () => {
        try {
            setLoading(true);

            const user = auth.currentUser;
            if (!user) {
                Alert.alert("Session expired", "Please sign in again.");
                router.replace("/login");
                return;
            }

            await user.reload();

            if (auth.currentUser?.emailVerified) {
                router.replace("/home");
            } else {
                Alert.alert(
                    "Email not verified",
                    "Please check your email and click the verification link."
                );
            }
        } catch (error) {
            console.log("Verification check error:", error);
            Alert.alert("Something went wrong", "We couldn't check your verification status.");
        } finally {
            setLoading(false);
        }
    };

    const resendVerificationEmail = async () => {
        try {
            setResending(true);

            const user = auth.currentUser;
            if (!user) {
                router.replace("/login");
                return;
            }

            await sendEmailVerification(user);
            Alert.alert("Email sent", "A new verification email has been sent. Please check your inbox.");
        } catch (error) {
            console.log("Resend verification error:", error);

            if (error.code === "auth/too-many-requests") {
                Alert.alert("Slow down", "You've requested a few emails already. Please wait a minute and try again.");
            } else {
                Alert.alert("Unable to send email", "Please try again later.");
            }
        } finally {
            setResending(false);
        }
    };

    const useDifferentEmail = async () => {
        await auth.signOut();
        router.replace("/signup");
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconChip}>
                    <Ionicons name="mail-unread-outline" size={34} color={colors.accentBlue} />
                </View>

                <Text style={styles.title}>Verify Your Email</Text>
                <Text style={styles.subtitle}>We've sent a verification link to:</Text>
                <Text style={styles.email}>{auth.currentUser?.email}</Text>

                <Text style={styles.description}>
                    Please check your inbox (and spam folder) and click the verification link to activate your account.
                </Text>

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    activeOpacity={0.85}
                    onPress={checkVerification}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>
                        {loading ? "Checking..." : "I've Verified My Email"}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={resendVerificationEmail}
                    disabled={resending}
                >
                    <Text style={[styles.secondaryButtonText, resending && styles.buttonDisabled]}>
                        {resending ? "Sending..." : "Resend Verification Email"}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={useDifferentEmail}>
                    <Text style={styles.changeAccountText}>Use a different email</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default VerifyEmail;

const createStyles = (colors, spacing, radius) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: spacing.lg,
    },
    iconChip: {
        width: 72,
        height: 72,
        borderRadius: radius.pill,
        backgroundColor: colors.lightBlueTint,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: spacing.md,
    },
    title: {
        fontSize: 26,
        fontWeight: "800",
        color: colors.textPrimary,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: spacing.md,
        textAlign: "center",
    },
    email: {
        fontSize: 15,
        fontWeight: "700",
        color: colors.textPrimary,
        marginTop: spacing.xs,
        textAlign: "center",
    },
    description: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: "center",
        lineHeight: 21,
        marginTop: spacing.lg,
        marginBottom: spacing.xl,
    },
    button: {
        width: "100%",
        backgroundColor: colors.navy,
        borderRadius: radius.md,
        paddingVertical: 14,
        alignItems: "center",
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: colors.white,
        fontSize: 15,
        fontWeight: "700",
    },
    secondaryButton: {
        marginTop: spacing.md,
        paddingVertical: 10,
    },
    secondaryButtonText: {
        color: colors.accentBlue,
        fontSize: 14,
        fontWeight: "600",
    },
    changeAccountText: {
        color: colors.textSecondary,
        fontSize: 13,
        marginTop: spacing.lg,
    },
});
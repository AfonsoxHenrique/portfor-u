import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Alert,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { sendEmailVerification } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { colors, spacing, radius } from "../theme/colors";
import {
    SafeAreaProvider,
    SafeAreaView,
} from "react-native-safe-area-context";

const VerifyEmail = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);

    const checkVerification = async () => {
        try {
            setLoading(true);

            const user = auth.currentUser;

            if (!user) {
                Alert.alert(
                    "Session expired",
                    "Please sign in again."
                );
                router.replace("/login");
                return;
            }

            await user.reload();

            if (auth.currentUser.emailVerified) {
                router.replace("/home");
            } else {
                Alert.alert(
                    "Email not verified",
                    "Please check your email and click the verification link."
                );
            }
        } catch (error) {
            console.log("Verification check error:", error);

            Alert.alert(
                "Something went wrong",
                "We couldn't check your verification status."
            );
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

            Alert.alert(
                "Email sent",
                "A new verification email has been sent. Please check your inbox."
            );
        } catch (error) {
            console.log("Resend verification error:", error);

            Alert.alert(
                "Unable to send email",
                "Please try again later."
            );
        } finally {
            setResending(false);
        }
    };

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <View style={styles.content}>

                    <Text style={styles.icon}>✉️</Text>

                    <Text style={styles.title}>
                        Verify Your Email
                    </Text>

                    <Text style={styles.subtitle}>
                        We've sent a verification link to:
                    </Text>

                    <Text style={styles.email}>
                        {auth.currentUser?.email}
                    </Text>

                    <Text style={styles.description}>
                        Please check your inbox and click the
                        verification link to activate your account.
                    </Text>

                    <TouchableOpacity
                        style={[
                            styles.button,
                            loading && styles.buttonDisabled,
                        ]}
                        onPress={checkVerification}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>
                            {loading
                                ? "Checking..."
                                : "I've Verified My Email"}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={resendVerificationEmail}
                        disabled={resending}
                    >
                        <Text style={styles.secondaryButtonText}>
                            {resending
                                ? "Sending..."
                                : "Resend Verification Email"}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={async () => {
                            await auth.signOut();
                            router.replace("/signup");
                        }}
                    >
                        <Text style={styles.changeAccountText}>
                            Use a different email
                        </Text>
                    </TouchableOpacity>

                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    );
};

export default VerifyEmail;

const styles = StyleSheet.create({
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

    icon: {
        fontSize: 48,
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
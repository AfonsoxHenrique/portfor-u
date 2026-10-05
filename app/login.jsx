import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    Alert,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../theme/colors";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebase";

const Login = () => {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const emailValid = email.includes("@") && email.includes(".");
    const passwordValid = password.length >= 6;

    const handleSignIn = async () => {
        if (!email || !password) {
            Alert.alert(
                "Missing information",
                "Please enter your email and password."
            );
            return;
        }

        if (!emailValid) {
            Alert.alert(
                "Invalid email",
                "Please enter a valid email address."
            );
            return;
        }

        try {
            setLoading(true);

            const userCredential = await signInWithEmailAndPassword(
                auth,
                email.trim(),
                password
            );

            const user = userCredential.user;

            if (!user.emailVerified) {
                router.replace("/verify-email");
                return;
            }

            router.replace("/home");
        } catch (error) {
            console.log("Sign in error:", error);

            if (
                error.code === "auth/invalid-credential" ||
                error.code === "auth/wrong-password" ||
                error.code === "auth/user-not-found"
            ) {
                Alert.alert(
                    "Sign in failed",
                    "Incorrect email or password."
                );
            } else if (error.code === "auth/invalid-email") {
                Alert.alert(
                    "Invalid email",
                    "Please enter a valid email address."
                );
            } else if (error.code === "auth/too-many-requests") {
                Alert.alert(
                    "Too many attempts",
                    "Too many unsuccessful login attempts. Please try again later."
                );
            } else {
                Alert.alert(
                    "Sign in failed",
                    "Something went wrong. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <Text style={styles.title}>Welcome Back</Text>

                <Text style={styles.subtitle}>
                    Access your student achievements portfolio.
                </Text>

                <Text style={styles.label}>Email Address</Text>

                <View style={styles.inputRow}>
                    <TextInput
                        placeholder="Email"
                        placeholderTextColor={colors.textMuted}
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType="email-address"
                    />

                    {emailValid && (
                        <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color={colors.success}
                            style={styles.checkIcon}
                        />
                    )}
                </View>

                <Text style={styles.label}>Password</Text>

                <View style={styles.inputRow}>
                    <TextInput
                        placeholder="Password"
                        placeholderTextColor={colors.textMuted}
                        secureTextEntry={!showPassword}
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />

                    <View style={styles.passwordActions}>
                        {passwordValid && (
                            <Ionicons
                                name="checkmark-circle"
                                size={20}
                                color={colors.success}
                            />
                        )}

                        <TouchableOpacity
                            onPress={() =>
                                setShowPassword((previous) => !previous)
                            }
                            style={styles.eyeButton}
                            accessibilityRole="button"
                            accessibilityLabel={
                                showPassword
                                    ? "Hide password"
                                    : "Show password"
                            }
                        >
                            <Ionicons
                                name={
                                    showPassword
                                        ? "eye-off-outline"
                                        : "eye-outline"
                                }
                                size={21}
                                color={colors.textSecondary}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.forgotLink}
                    onPress={() => router.push("/forgot-password")}
                >
                    <Text style={styles.forgotText}>
                        Forgot Password?
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.button,
                        loading && styles.buttonDisabled,
                    ]}
                    activeOpacity={0.85}
                    onPress={handleSignIn}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>
                        {loading ? "Signing In..." : "Sign In"}
                    </Text>
                </TouchableOpacity>

                <View style={styles.toggleRow}>
                    <Text style={styles.toggleText}>
                        Don't have an account?{" "}
                    </Text>

                    <TouchableOpacity
                        onPress={() => router.push("/signup")}
                    >
                        <Text style={styles.toggleLink}>
                            Sign Up
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    );
};

export default Login;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
    },

    title: {
        fontSize: 26,
        fontWeight: "800",
        color: colors.textPrimary,
    },

    subtitle: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: spacing.xs,
        marginBottom: spacing.lg,
    },

    label: {
        fontSize: 13,
        fontWeight: "600",
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },

    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        backgroundColor: colors.surface,
        marginBottom: spacing.md,
    },

    input: {
        flex: 1,
        paddingHorizontal: spacing.md,
        paddingVertical: 12,
        fontSize: 15,
        color: colors.textPrimary,
    },

    checkIcon: {
        marginRight: spacing.md,
    },

    passwordActions: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: spacing.sm,
    },

    eyeButton: {
        padding: spacing.xs,
        marginLeft: spacing.xs,
    },

    forgotLink: {
        alignSelf: "flex-end",
        marginBottom: spacing.md,
    },

    forgotText: {
        color: colors.accentBlue,
        fontSize: 13,
        fontWeight: "600",
    },

    button: {
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

    toggleRow: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: spacing.md,
    },

    toggleText: {
        fontSize: 13,
        color: colors.textSecondary,
    },

    toggleLink: {
        fontSize: 13,
        color: colors.accentBlue,
    },
});


import { useMemo, useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

import { auth, db } from "../../firebase/firebase";
import { useTheme } from "../../theme/ThemeContext";

const SignUp = () => {
    const router = useRouter();
    const { colors, spacing, radius } = useTheme();
    const styles = useMemo(() => createStyles(colors, spacing, radius), [colors, spacing, radius]);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const emailValid = email.includes("@") && email.includes(".");

    const handleSignUp = async () => {
        if (!firstName.trim() || !lastName.trim() || !email || !password || !confirmPassword) {
            Alert.alert("Missing information", "Please fill in all fields.");
            return;
        }

        if (!emailValid) {
            Alert.alert("Invalid email", "Please enter a valid email address.");
            return;
        }

        if (password.length < 8) {
            Alert.alert("Invalid password", "Password must be at least 8 characters long.");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Passwords do not match", "Please make sure both passwords are the same.");
            return;
        }

        try {
            setLoading(true);

            const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password);

            // Save the profile first, so it exists even if the email step fails
            await setDoc(doc(db, "users", user.uid), {
                userId: user.uid,
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim().toLowerCase(),
                role: "user",
                createdAt: serverTimestamp(),
            });

            // If this fails, they can resend from the verify screen
            try {
                await sendEmailVerification(user);
            } catch (emailError) {
                console.log("Verification email failed:", emailError);
            }

            router.replace("/verify-email");
        } catch (error) {
            console.log("Sign up error:", error);

            if (error.code === "auth/email-already-in-use") {
                Alert.alert("Email already registered", "An account with this email already exists.");
            } else if (error.code === "auth/invalid-email") {
                Alert.alert("Invalid email", "Please enter a valid email address.");
            } else if (error.code === "auth/weak-password") {
                Alert.alert("Weak password", "Please choose a stronger password.");
            } else {
                Alert.alert("Sign up failed", "Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>
                        Join Portfor-U and get career ready today.
                    </Text>

                    <Text style={styles.label}>First Name</Text>
                    <TextInput
                        placeholder="e.g. Alex"
                        placeholderTextColor={colors.textMuted}
                        style={styles.input}
                        value={firstName}
                        onChangeText={setFirstName}
                        autoCapitalize="words"
                        autoComplete="given-name"
                        textContentType="givenName"
                    />

                    <Text style={styles.label}>Last Name</Text>
                    <TextInput
                        placeholder="e.g. Mary"
                        placeholderTextColor={colors.textMuted}
                        style={styles.input}
                        value={lastName}
                        onChangeText={setLastName}
                        autoCapitalize="words"
                        autoComplete="family-name"
                        textContentType="familyName"
                    />

                    <Text style={styles.label}>Email Address</Text>
                    <TextInput
                        placeholder="e.g. example@gmail.com"
                        placeholderTextColor={colors.textMuted}
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType="email-address"
                        autoComplete="email"
                        textContentType="emailAddress"
                    />

                    <Text style={styles.label}>Password</Text>
                    <View style={styles.inputRow}>
                        <TextInput
                            placeholder="Minimum 8 characters"
                            placeholderTextColor={colors.textMuted}
                            secureTextEntry={!showPassword}
                            style={styles.rowInput}
                            value={password}
                            onChangeText={setPassword}
                            autoCapitalize="none"
                            autoCorrect={false}
                            autoComplete="new-password"
                            textContentType="newPassword"
                        />
                        <TouchableOpacity
                            onPress={() => setShowPassword((prev) => !prev)}
                            style={styles.eyeButton}
                            accessibilityRole="button"
                            accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                        >
                            <Ionicons
                                name={showPassword ? "eye-off-outline" : "eye-outline"}
                                size={21}
                                color={colors.textSecondary}
                            />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.label}>Confirm Password</Text>
                    <View style={styles.inputRow}>
                        <TextInput
                            placeholder="Repeat password"
                            placeholderTextColor={colors.textMuted}
                            secureTextEntry={!showPassword}
                            style={styles.rowInput}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            autoCapitalize="none"
                            autoCorrect={false}
                            autoComplete="new-password"
                            textContentType="newPassword"
                            returnKeyType="go"
                            onSubmitEditing={handleSignUp}
                        />
                        {!!confirmPassword && (
                            <Ionicons
                                name={confirmPassword === password ? "checkmark-circle" : "close-circle"}
                                size={20}
                                color={confirmPassword === password ? colors.success : colors.red}
                                style={styles.matchIcon}
                            />
                        )}
                    </View>

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        activeOpacity={0.85}
                        onPress={handleSignUp}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? "Creating Account..." : "Sign Up"}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.toggleRow}>
                        <Text style={styles.toggleText}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => router.replace("/login")}>
                            <Text style={styles.toggleLink}>Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default SignUp;

const createStyles = (colors, spacing, radius) => StyleSheet.create({
    flex: { flex: 1 },
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
        paddingBottom: spacing.xl,
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
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: 12,
        fontSize: 15,
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        marginBottom: spacing.md,
    },
    rowInput: {
        flex: 1,
        paddingHorizontal: spacing.md,
        paddingVertical: 12,
        fontSize: 15,
        color: colors.textPrimary,
    },
    eyeButton: {
        padding: spacing.xs,
        marginRight: spacing.sm,
    },
    matchIcon: {
        marginRight: spacing.md,
    },
    button: {
        backgroundColor: colors.navy,
        borderRadius: radius.md,
        paddingVertical: 14,
        alignItems: "center",
        marginTop: spacing.xs,
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
        marginTop: spacing.lg,
    },
    toggleText: {
        fontSize: 13,
        color: colors.textSecondary,
    },
    toggleLink: {
        fontSize: 13,
        color: colors.accentBlue,
        fontWeight: "700",
    },
});
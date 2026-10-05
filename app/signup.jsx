import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { colors, spacing, radius } from "../theme/colors";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";

const SignUp = () => {
    const router = useRouter();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSignUp = async () => {
        // Check required fields
        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            Alert.alert("Missing information", "Please fill in all fields.");
            return;
        }

        // Check password length
        if (password.length < 8) {
            Alert.alert(
                "Invalid password",
                "Password must be at least 8 characters long."
            );
            return;
        }

        // Check passwords match
        if (password !== confirmPassword) {
            Alert.alert(
                "Passwords do not match",
                "Please make sure both passwords are the same."
            );
            return;
        }

        try {
            setLoading(true);

            // Create Firebase Authentication account
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email.trim(),
                password
            );

            const user = userCredential.user;

            // Save additional user information in Firestore
            await setDoc(doc(db, "users", user.uid), {
                userId: user.uid,
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim(),
                role: "user",
                createdAt: new Date(),
            });

            // Go to Home after successful registration
            router.replace("/home");

        } catch (error) {
            console.log("Sign up error:", error);

            if (error.code === "auth/email-already-in-use") {
                Alert.alert(
                    "Email already registered",
                    "An account with this email already exists."
                );
            } else if (error.code === "auth/invalid-email") {
                Alert.alert(
                    "Invalid email",
                    "Please enter a valid email address."
                );
            } else if (error.code === "auth/weak-password") {
                Alert.alert(
                    "Weak password",
                    "Please choose a stronger password."
                );
            } else {
                Alert.alert(
                    "Sign up failed",
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
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
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
                    />

                    <Text style={styles.label}>Last Name</Text>
                    <TextInput
                        placeholder="e.g. Mary"
                        placeholderTextColor={colors.textMuted}
                        style={styles.input}
                        value={lastName}
                        onChangeText={setLastName}
                        autoCapitalize="words"
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
                    />

                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        placeholder="Minimum 8 characters"
                        placeholderTextColor={colors.textMuted}
                        secureTextEntry
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        autoCapitalize="none"
                    />

                    <Text style={styles.label}>Confirm Password</Text>
                    <TextInput
                        placeholder="Repeat password"
                        placeholderTextColor={colors.textMuted}
                        secureTextEntry
                        style={styles.input}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        autoCapitalize="none"
                    />

                    <TouchableOpacity
                        style={[
                            styles.button,
                            loading && styles.buttonDisabled,
                        ]}
                        activeOpacity={0.85}
                        onPress={handleSignUp}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? "Creating Account..." : "Sign Up"}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.toggleRow}>
                        <Text style={styles.toggleText}>
                            Already have an account?{" "}
                        </Text>

                        <TouchableOpacity onPress={() => router.push("/login")}>
                            <Text style={styles.toggleLink}>Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </SafeAreaProvider>
    );
};

export default SignUp;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.surface,
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
        backgroundColor: colors.background,
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: 12,
        fontSize: 15,
        color: colors.textPrimary,
        marginBottom: spacing.md,
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
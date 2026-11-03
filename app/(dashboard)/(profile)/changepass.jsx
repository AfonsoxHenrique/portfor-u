
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { updatePassword } from "firebase/auth";
import { auth } from "../../../firebase/firebase";
import { colors, spacing, radius } from "../../../theme/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader   from "../../../components/ScreenHeader"

const ChangePassword = () => {
    const router = useRouter();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleChangePassword = async () => {
        const user = auth.currentUser;

        if (!user) {
            Alert.alert("Sign in required", "Please sign in again.");
            router.replace("/login");
            return;
        }

        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert("Missing fields", "Please complete all password fields.");
            return;
        }

        if (newPassword.length < 8) {
            Alert.alert(
                "Password too short",
                "Your new password must contain at least 8 characters."
            );
            return;
        }

        if (!/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
            Alert.alert(
                "Weak password",
                "Use a mixture of letters and numbers. A symbol is also recommended."
            );
            return;
        }

        if (newPassword === currentPassword) {
            Alert.alert(
                "Choose a new password",
                "Your new password must be different from your current password."
            );
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert(
                "Passwords don't match",
                "Please make sure both new password fields match."
            );
            return;
        }

        setSaving(true);

        try {
            // Firebase requires recent authentication for sensitive changes.
            const { EmailAuthProvider, reauthenticateWithCredential } =
                await import("firebase/auth");

            if (!user.email) {
                Alert.alert(
                    "Unable to verify account",
                    "This account does not have an email address for password verification."
                );
                return;
            }

            const credential = EmailAuthProvider.credential(
                user.email,
                currentPassword
            );

            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

            Alert.alert("Success", "Your password has been changed.");
        } catch (error) {
            console.error("Change password error:", error);

            if (
                error.code === "auth/invalid-credential" ||
                error.code === "auth/wrong-password" ||
                error.code === "auth/invalid-login-credentials"
            ) {
                Alert.alert(
                    "Incorrect password",
                    "Your current password is incorrect."
                );
            } else if (error.code === "auth/weak-password") {
                Alert.alert(
                    "Weak password",
                    "Please choose a stronger password."
                );
            } else if (error.code === "auth/requires-recent-login") {
                Alert.alert(
                    "Sign in again",
                    "Your session has expired. Please sign in again and retry."
                );
            } else {
                Alert.alert(
                    "Update failed",
                    "Could not change your password. Please try again."
                );
            }
        } finally {
            setSaving(false);
        }
    };

    const PasswordField = ({
        label,
        value,
        onChangeText,
        visible,
        onToggleVisibility,
        placeholder = "Enter password",
        returnKeyType = "next",
    }) => (
        <View style={styles.fieldGroup}>
            <Text style={styles.label}>{label}</Text>

            <View style={styles.passwordInputContainer}>
                <TextInput
                    style={styles.passwordInput}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry={!visible}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType={returnKeyType}
                />

                <TouchableOpacity
                    style={styles.visibilityButton}
                    onPress={onToggleVisibility}
                    accessibilityLabel={visible ? "Hide password" : "Show password"}
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name={visible ? "eye-outline" : "eye-off-outline"}
                        size={20}
                        color={colors.textMuted}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <ScreenHeader
                        title={"Change Password"}
                        subtitle={"KEEP YOUR ACCOUNT SECURE"}
                        bg={colors.lightBlueTint}
                        subtitleColor={colors.accentBlue}
                    />

                <View style={styles.formCard}>
                    <PasswordField
                        label="Current password"
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        visible={showCurrent}
                        onToggleVisibility={() => setShowCurrent((value) => !value)}
                        placeholder="Enter current password"
                    />

                    <PasswordField
                        label="New password"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        visible={showNew}
                        onToggleVisibility={() => setShowNew((value) => !value)}
                        placeholder="Enter new password"
                    />

                    <PasswordField
                        label="Confirm new password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        visible={showConfirm}
                        onToggleVisibility={() => setShowConfirm((value) => !value)}
                        placeholder="Confirm new password"
                        returnKeyType="done"
                    />
                </View>

                <View style={styles.securityCard}>
                    <Ionicons
                        name="shield-checkmark-outline"
                        size={21}
                        color={colors.custom13}
                    />

                    <View style={styles.securityTextContainer}>
                        <Text style={styles.securityTitle}>
                            Choose a strong password
                        </Text>
                        <Text style={styles.securityDescription}>
                            Use at least 8 characters with a mix of letters,
                            numbers and symbols.
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.saveButton, saving && styles.disabledButton]}
                    onPress={handleChangePassword}
                    disabled={saving}
                    activeOpacity={0.8}
                >
                    {saving ? (
                        <ActivityIndicator color={colors.white} />
                    ) : (
                        <Text style={styles.saveButtonText}>Change Password</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

export default ChangePassword;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scroll: {
        flex: 1,
    },
    content: {
        paddingBottom: spacing.lg,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.lightBlueTint,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        gap: spacing.sm,
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: radius.md,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        fontSize: 21,
        fontWeight: "800",
        color: colors.textPrimary,
    },
    headerSubtitle: {
        fontSize: 11,
        fontWeight: "700",
        color: colors.accentBlue,
        letterSpacing: 0.8,
        marginTop: 3,
    },
    formCard: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.lg,
        marginHorizontal: spacing.lg,
        marginTop: spacing.md,
        padding: spacing.md,
    },
    fieldGroup: {
        marginBottom: spacing.md,
    },
    label: {
        fontSize: 13,
        fontWeight: "600",
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    passwordInputContainer: {
        minHeight: 48,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        backgroundColor: colors.white,
    },
    passwordInput: {
        flex: 1,
        minHeight: 46,
        paddingHorizontal: spacing.md,
        fontSize: 14,
        color: colors.textPrimary,
    },
    visibilityButton: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
    },
    securityCard: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: spacing.sm,
        backgroundColor: colors.lightBlueTint,
        borderRadius: radius.lg,
        marginHorizontal: spacing.lg,
        marginTop: spacing.md,
        padding: spacing.md,
    },
    securityTextContainer: {
        flex: 1,
    },
    securityTitle: {
        fontSize: 13,
        fontWeight: "700",
        color: colors.custom13,
        marginBottom: spacing.xs,
    },
    securityDescription: {
        fontSize: 12.5,
        lineHeight: 19,
        color: colors.textSecondary,
    },
    saveButton: {
        minHeight: 54,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.custom13,
        borderRadius: radius.md,
        marginHorizontal: spacing.lg,
        marginTop: spacing.md,
    },
    disabledButton: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: colors.white,
        fontSize: 15,
        fontWeight: "700",
    },
});

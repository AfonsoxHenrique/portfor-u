import {StyleSheet,Text,View,TextInput,TouchableOpacity,ScrollView,Alert,} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../theme/colors";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../components/ScreenHeader";
import {EmailAuthProvider,reauthenticateWithCredential,updatePassword,} from "firebase/auth";
import { auth } from "../firebase/firebase";

const ChangePassword = () => {
    const router = useRouter();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [saving, setSaving] = useState(false);

    const handleChangePassword = async () => {
        const user = auth.currentUser;

        if (!user) {
            Alert.alert("Error", "Please log in first.");
            return;
        }

        if (!user.email) {
            Alert.alert(
                "Error",
                "Your account does not have an email address."
            );
            return;
        }

        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert(
                "Missing information",
                "Please complete all password fields."
            );
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert(
                "Invalid password",
                "Your new password must be at least 6 characters long."
            );
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert(
                "Password mismatch",
                "The new passwords do not match."
            );
            return;
        }

        if (currentPassword === newPassword) {
            Alert.alert(
                "Invalid password",
                "Your new password must be different from your current password."
            );
            return;
        }

        setSaving(true);

        try {
            const credential = EmailAuthProvider.credential(
                user.email,
                currentPassword
            );

            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);

            Alert.alert(
                "Success",
                "Your password has been changed successfully.",
                [
                    {
                        text: "OK",
                        onPress: () => router.back(),
                    },
                ]
            );
        } catch (error) {
            console.error("Error changing password:", error);

            if (
                error.code === "auth/invalid-credential" ||
                error.code === "auth/wrong-password" ||
                error.code === "auth/invalid-login-credentials"
            ) {
                Alert.alert(
                    "Incorrect password",
                    "Your current password is incorrect. Please try again."
                );
            } else if (error.code === "auth/weak-password") {
                Alert.alert(
                    "Weak password",
                    "Please choose a stronger password."
                );
            } else if (error.code === "auth/requires-recent-login") {
                Alert.alert(
                    "Please log in again",
                    "For security reasons, please log in again before changing your password."
                );
            } else {
                Alert.alert(
                    "Error",
                    "Could not change your password. Please try again."
                );
            }
        } finally {
            setSaving(false);
        }
    };

    const renderPasswordField = (
        label,
        placeholder,
        value,
        onChangeText,
        visible,
        toggleVisible
    ) => (
        <>
            <Text style={styles.label}>{label}</Text>

            <View style={styles.passwordInputWrapper}>
                <TextInput
                    style={styles.passwordInput}
                    placeholder={placeholder}
                    placeholderTextColor={colors.textMuted}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={!visible}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!saving}
                />

                <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => toggleVisible(!visible)}
                    activeOpacity={0.7}
                    accessibilityLabel={
                        visible ? "Hide password" : "Show password"
                    }
                >
                    <Ionicons
                        name={visible ? "eye-off-outline" : "eye-outline"}
                        size={20}
                        color={colors.textSecondary}
                    />
                </TouchableOpacity>
            </View>
        </>
    );

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <ScreenHeader
                        title="Change Password"
                        subtitle="ACCOUNT SECURITY"
                        bg={colors.lightBlueTint}
                        subtitleColor={colors.accentBlue}
                    />

                    <View style={styles.body}>
                        <View style={styles.intro}>
                            <View style={styles.iconCircle}>
                                <Ionicons
                                    name="shield-checkmark-outline"
                                    size={28}
                                    color={colors.navy}
                                />
                            </View>

                            <Text style={styles.heading}>
                                Keep Your Account Secure
                            </Text>

                            <Text style={styles.description}>
                                Choose a strong password to help protect your
                                Portfor U account.
                            </Text>
                        </View>

                        {renderPasswordField(
                            "Current Password",
                            "Enter your current password",
                            currentPassword,
                            setCurrentPassword,
                            showCurrentPassword,
                            setShowCurrentPassword
                        )}

                        {renderPasswordField(
                            "New Password",
                            "Enter your new password",
                            newPassword,
                            setNewPassword,
                            showNewPassword,
                            setShowNewPassword
                        )}

                        {renderPasswordField(
                            "Confirm New Password",
                            "Re-enter your new password",
                            confirmPassword,
                            setConfirmPassword,
                            showConfirmPassword,
                            setShowConfirmPassword
                        )}

                        <View style={styles.passwordTip}>
                            <Ionicons
                                name="information-circle-outline"
                                size={18}
                                color={colors.accentBlue}
                            />
                            <Text style={styles.passwordTipText}>
                                Use at least 6 characters. Make sure your new
                                password matches the confirmation field.
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.saveButton,
                                saving && styles.disabledButton,
                            ]}
                            activeOpacity={0.85}
                            onPress={handleChangePassword}
                            disabled={saving}
                        >
                            <Text style={styles.saveButtonText}>
                                {saving ? "Updating..." : "Update Password"}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.cancelButton}
                            activeOpacity={0.7}
                            onPress={() => router.back()}
                            disabled={saving}
                        >
                            <Text style={styles.cancelButtonText}>
                                Cancel
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </SafeAreaProvider>
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
    scrollContent: {
        paddingBottom: spacing.lg,
    },
    body: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
    },
    intro: {
        alignItems: "center",
        marginBottom: spacing.xl,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.lightBlueTint,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: spacing.md,
    },
    heading: {
        fontSize: 18,
        fontWeight: "800",
        color: colors.textPrimary,
        textAlign: "center",
        marginBottom: spacing.xs,
    },
    description: {
        fontSize: 14,
        lineHeight: 21,
        color: colors.textSecondary,
        textAlign: "center",
    },
    label: {
        fontSize: 13,
        fontWeight: "600",
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    passwordInputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        marginBottom: spacing.md,
    },
    passwordInput: {
        flex: 1,
        paddingHorizontal: spacing.md,
        paddingVertical: 12,
        fontSize: 14,
        color: colors.textPrimary,
    },
    eyeButton: {
        paddingHorizontal: spacing.md,
        paddingVertical: 12,
    },
    passwordTip: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: spacing.sm,
        backgroundColor: colors.lightBlueTint,
        borderRadius: radius.md,
        padding: spacing.md,
        marginTop: spacing.xs,
        marginBottom: spacing.lg,
    },
    passwordTipText: {
        flex: 1,
        fontSize: 12,
        lineHeight: 18,
        color: colors.textSecondary,
    },
    saveButton: {
        backgroundColor: colors.navy,
        borderRadius: radius.md,
        paddingVertical: 14,
        alignItems: "center",
    },
    disabledButton: {
        opacity: 0.6,
    },
    saveButtonText: {
        color: colors.white,
        fontSize: 15,
        fontWeight: "700",
    },
    cancelButton: {
        alignItems: "center",
        paddingVertical: spacing.md,
    },
    cancelButtonText: {
        color: colors.textSecondary,
        fontSize: 14,
        fontWeight: "600",
    },
});

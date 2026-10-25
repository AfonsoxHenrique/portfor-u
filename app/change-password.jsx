import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { useAppTheme } from "../theme/ThemeContext";
import { spacing, radius } from "../theme/colors";

export default function ChangePassword() {
    const router = useRouter();
    const { colors } = useAppTheme();
    const styles = createStyles(colors);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleChangePassword = async () => {
        const user = auth.currentUser;
        if (!user || !user.email) {
            Alert.alert("Unable to change password", "Please sign in again with your email and password.");
            return;
        }
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert("Missing information", "Please complete all password fields.");
            return;
        }
        if (newPassword.length < 6) {
            Alert.alert("Password too short", "Your new password must contain at least 6 characters.");
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert("Passwords don't match", "Please make sure the new passwords match.");
            return;
        }
        if (newPassword === currentPassword) {
            Alert.alert("Choose a new password", "Your new password must be different from your current password.");
            return;
        }

        setSaving(true);
        try {
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            Alert.alert("Password updated", "Your password has been changed successfully.", [
                { text: "OK", onPress: () => router.back() },
            ]);
        } catch (error) {
            console.error("Password update error:", error);
            if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password") {
                Alert.alert("Incorrect current password", "Please check your current password and try again.");
            } else if (error.code === "auth/weak-password") {
                Alert.alert("Password too weak", "Please choose a stronger password with at least 6 characters.");
            } else if (error.code === "auth/requires-recent-login") {
                Alert.alert("Please sign in again", "For your security, sign out and sign in again before changing your password.");
            } else {
                Alert.alert("Update failed", "We couldn't change your password. Please try again.");
            }
        } finally {
            setSaving(false);
        }
    };

    const renderPasswordField = (label, value, onChangeText, visible, setVisible, placeholder, autoComplete) => (
        <>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.inputRow}>
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry={!visible}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete={autoComplete}
                    editable={!saving}
                />
                <TouchableOpacity style={styles.eyeButton} onPress={() => setVisible(!visible)} accessibilityLabel={visible ? "Hide password" : "Show password"}>
                    <Ionicons name={visible ? "eye-off-outline" : "eye-outline"} size={20} color={colors.textMuted} />
                </TouchableOpacity>
            </View>
        </>
    );

    return (
        <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
            <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton} accessibilityLabel="Go back">
                        <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Change Password</Text>
                    <View style={styles.headerSpacer} />
                </View>
                <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                    <View style={styles.introIcon}>
                        <Ionicons name="shield-checkmark-outline" size={30} color={colors.navy} />
                    </View>
                    <Text style={styles.title}>Keep your account secure</Text>
                    <Text style={styles.subtitle}>Enter your current password, then choose a new one.</Text>

                    <View style={styles.formCard}>
                        {renderPasswordField("Current password", currentPassword, setCurrentPassword, showCurrent, setShowCurrent, "Enter current password", "current-password")}
                        {renderPasswordField("New password", newPassword, setNewPassword, showNew, setShowNew, "At least 6 characters", "new-password")}
                        {renderPasswordField("Confirm new password", confirmPassword, setConfirmPassword, showConfirm, setShowConfirm, "Re-enter new password", "new-password")}
                        <View style={styles.passwordHint}>
                            <Ionicons name="information-circle-outline" size={17} color={colors.accentBlue} />
                            <Text style={styles.hintText}>Use at least 6 characters and avoid reusing your old password.</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={[styles.saveButton, saving && styles.disabledButton]} onPress={handleChangePassword} disabled={saving} activeOpacity={0.85}>
                        {saving ? <ActivityIndicator color="#FFFFFF" /> : <Ionicons name="lock-closed-outline" size={18} color="#FFFFFF" />}
                        <Text style={styles.saveButtonText}>{saving ? "Updating..." : "Update Password"}</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const createStyles = (colors) => StyleSheet.create({
    flex: { flex: 1 },
    safeArea: { flex: 1, backgroundColor: colors.background },
    header: { minHeight: 56, flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
    backButton: { width: 40, height: 40, justifyContent: "center" },
    headerTitle: { flex: 1, textAlign: "center", fontSize: 18, fontWeight: "800", color: colors.textPrimary },
    headerSpacer: { width: 40 },
    content: { padding: spacing.lg, paddingBottom: spacing.xl },
    introIcon: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center", backgroundColor: colors.lightBlueTint, alignSelf: "center", marginBottom: spacing.md },
    title: { fontSize: 21, fontWeight: "800", color: colors.textPrimary, textAlign: "center" },
    subtitle: { color: colors.textMuted, fontSize: 14, lineHeight: 20, textAlign: "center", marginTop: 6, marginBottom: spacing.lg },
    formCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md },
    label: { fontSize: 13, fontWeight: "700", color: colors.textPrimary, marginTop: spacing.sm, marginBottom: 7 },
    inputRow: { minHeight: 48, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.background },
    input: { flex: 1, minHeight: 46, paddingHorizontal: 13, fontSize: 15, color: colors.textPrimary },
    eyeButton: { minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" },
    passwordHint: { flexDirection: "row", alignItems: "flex-start", gap: 7, marginTop: spacing.md, padding: spacing.sm, borderRadius: radius.md, backgroundColor: colors.lightBlueTint },
    hintText: { flex: 1, fontSize: 12, lineHeight: 18, color: colors.textSecondary },
    saveButton: { marginTop: spacing.lg, minHeight: 50, borderRadius: radius.md, backgroundColor: colors.navy, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 9 },
    disabledButton: { opacity: 0.6 },
    saveButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
});

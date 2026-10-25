
import { useEffect, useState } from "react";
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
import { doc, getDoc, setDoc } from "firebase/firestore";
import { updateEmail, updateProfile } from "firebase/auth";
import { auth, db } from "../firebase/firebase";
import { colors, spacing, radius } from "../theme/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader   from "../components/ScreenHeader"

const EditProfile = () => {
    const router = useRouter();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [originalEmail, setOriginalEmail] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const loadProfile = async () => {
            const user = auth.currentUser;

            if (!user) {
                setLoading(false);
                Alert.alert("Sign in required", "Please sign in again.");
                router.replace("/login");
                return;
            }

            try {
                const snapshot = await getDoc(doc(db, "users", user.uid));
                const data = snapshot.exists() ? snapshot.data() : {};

                const name =
                    data.fullName ||
                    [data.firstName, data.lastName].filter(Boolean).join(" ") ||
                    user.displayName ||
                    "";

                setFullName(name);
                setEmail(data.email || user.email || "");
                setOriginalEmail(user.email || "");
            } catch (error) {
                console.error("Load profile error:", error);
                Alert.alert("Error", "Could not load your profile.");
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, []);

    const handleSave = async () => {
        const user = auth.currentUser;
        const trimmedName = fullName.trim();
        const trimmedEmail = email.trim().toLowerCase();

        if (!user) {
            Alert.alert("Sign in required", "Please sign in again.");
            return;
        }

        if (!trimmedName) {
            Alert.alert("Missing name", "Please enter your full name.");
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(trimmedEmail)) {
            Alert.alert("Invalid email", "Please enter a valid email address.");
            return;
        }

        const nameParts = trimmedName.split(/\s+/);
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(" ");

        setSaving(true);

        try {
            // Updating an email may require recent authentication.
            if (trimmedEmail !== originalEmail) {
                await updateEmail(user, trimmedEmail);
            }

            await updateProfile(user, {
                displayName: trimmedName,
            });

            await setDoc(
                doc(db, "users", user.uid),
                {
                    fullName: trimmedName,
                    firstName,
                    lastName,
                    email: trimmedEmail,
                    updatedAt: new Date(),
                },
                { merge: true }
            );

            setOriginalEmail(trimmedEmail);

            Alert.alert("Success", "Your profile has been updated.");
        } catch (error) {
            console.error("Save profile error:", error);

            if (error.code === "auth/requires-recent-login") {
                Alert.alert(
                    "Sign in again",
                    "For security, please sign in again before changing your email."
                );
            } else if (error.code === "auth/email-already-in-use") {
                Alert.alert("Email unavailable", "That email is already in use.");
            } else if (error.code === "auth/invalid-email") {
                Alert.alert("Invalid email", "Please enter a valid email address.");
            } else {
                Alert.alert("Update failed", "Could not save your profile. Please try again.");
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.accentBlue} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <ScreenHeader
                        title={"Edit Profile"}
                        subtitle={"YOUR ACCOUNT DETAILS"}
                        bg={colors.lightBlueTint}
                        subtitleColor={colors.accentBlue}
                    />

                <View style={styles.photoCard}>
                    <TouchableOpacity
                        style={styles.avatarContainer}
                        activeOpacity={0.7}
                        onPress={() =>
                            Alert.alert(
                                "Profile photo",
                                "Connect an image picker to enable photo uploads."
                            )
                        }
                    >
                        <View style={styles.avatar}>
                            <Ionicons
                                name="person-outline"
                                size={40}
                                color={colors.accentBlue}
                            />
                        </View>
                        <View style={styles.cameraButton}>
                            <Ionicons name="camera" size={18} color={colors.white} />
                        </View>
                    </TouchableOpacity>

                    <Text style={styles.photoAction}>Change profile photo</Text>
                    <Text style={styles.photoHint}>PNG or JPEG Â· Max 5 MB</Text>
                </View>

                <View style={styles.formCard}>
                    <Text style={styles.label}>Full name</Text>
                    <TextInput
                        style={styles.input}
                        value={fullName}
                        onChangeText={setFullName}
                        placeholder="Enter your full name"
                        placeholderTextColor={colors.textMuted}
                        autoCapitalize="words"
                        returnKeyType="next"
                    />

                    <Text style={styles.label}>Email address</Text>
                    <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Enter your email address"
                        placeholderTextColor={colors.textMuted}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.saveButton, saving && styles.disabledButton]}
                    onPress={handleSave}
                    disabled={saving}
                    activeOpacity={0.8}
                >
                    {saving ? (
                        <ActivityIndicator color={colors.white} />
                    ) : (
                        <Text style={styles.saveButtonText}>Save Changes</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

export default EditProfile;

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
    loadingContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
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
    photoCard: {
        alignItems: "center",
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.lg,
        marginHorizontal: spacing.lg,
        marginTop: spacing.md,
        paddingVertical: spacing.lg,
    },
    avatarContainer: {
        width: 96,
        height: 96,
        alignItems: "center",
        justifyContent: "center",
    },
    avatar: {
        width: 94,
        height: 94,
        borderRadius: 47,
        borderWidth: 2,
        borderColor: colors.accentBlue,
        backgroundColor: colors.lightBlueTint,
        alignItems: "center",
        justifyContent: "center",
    },
    cameraButton: {
        position: "absolute",
        right: -2,
        bottom: 0,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: colors.accentBlue,
        borderWidth: 2,
        borderColor: colors.white,
        alignItems: "center",
        justifyContent: "center",
    },
    photoAction: {
        color: colors.accentBlue,
        fontSize: 14,
        fontWeight: "600",
        marginTop: spacing.sm,
    },
    photoHint: {
        color: colors.textSecondary,
        fontSize: 12,
        marginTop: spacing.xs,
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
    label: {
        color: colors.textSecondary,
        fontSize: 13,
        fontWeight: "600",
        marginBottom: spacing.xs,
    },
    input: {
        minHeight: 48,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        color: colors.textPrimary,
        fontSize: 14,
        backgroundColor: colors.white,
        marginBottom: spacing.md,
    },
    saveButton: {
        minHeight: 54,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.navy,
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
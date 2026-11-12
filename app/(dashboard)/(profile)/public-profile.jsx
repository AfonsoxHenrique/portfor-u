import { useEffect, useMemo, useState } from "react";
import {
    StyleSheet, Text, View, TextInput, ScrollView, Pressable, Switch, Alert,
    ActivityIndicator, Share, KeyboardAvoidingView, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "../../../theme/ThemeContext";
import ScreenHeader from "../../../components/ScreenHeader";
import {
    getPublicSettings, savePublicSettings, claimUsername, isUsernameAvailable,
    publishProfile, unpublishProfile, normalizeUsername, validateUsername,
    getPublicProfileUrl, USERNAME_RULES,
} from "../../../services/publicProfile";
import { useRouter } from "expo-router";


const PROJECT_OPTIONS = [
    { value: "featured", label: "Featured" },
    { value: "all", label: "All" },
    { value: "none", label: "Hidden" },
];

export default function PublicProfileSettings() {
    const { colors, spacing, radius } = useTheme();
    const styles = useMemo(() => createStyles(colors, spacing, radius), [colors, spacing, radius]);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState(null);
    const [wasVisible, setWasVisible] = useState(false);
    const [savedUsername, setSavedUsername] = useState(null);
    const [usernameInput, setUsernameInput] = useState("");
    const [availability, setAvailability] = useState("idle"); // idle | checking | available | taken | invalid
    const [usernameError, setUsernameError] = useState("");

    const update = (key) => (value) => setSettings((s) => ({ ...s, [key]: value }));
    const handle = normalizeUsername(usernameInput);
    const isLive = wasVisible && !!savedUsername;

    // Load current settings
    useEffect(() => {
        (async () => {
            try {
                const { settings: loaded } = await getPublicSettings();
                setSettings(loaded);
                setWasVisible(loaded.visible);
                setSavedUsername(loaded.username);
                setUsernameInput(loaded.username ?? "");
            } catch (error) {
                console.error("Load public settings error:", error);
                Alert.alert("Error", "Could not load your public profile settings.");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // Check username availability as they type (debounced)
    useEffect(() => {
        if (!handle) {
            setAvailability("idle");
            return;
        }

        const error = validateUsername(handle);
        if (error) {
            setAvailability("invalid");
            setUsernameError(error);
            return;
        }

        if (handle === savedUsername) {
            setAvailability("available");
            return;
        }

        setAvailability("checking");
        let cancelled = false;

        const timer = setTimeout(async () => {
            try {
                const free = await isUsernameAvailable(handle);
                if (!cancelled) setAvailability(free ? "available" : "taken");
            } catch {
                if (!cancelled) setAvailability("idle");
            }
        }, 400);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [handle, savedUsername]);

    const handleSave = async () => {
        if (settings.visible) {
            if (!handle) {
                Alert.alert("Choose a username", "You need a username to make your portfolio public.");
                return;
            }
            if (availability === "checking") {
                Alert.alert("One sec", "Still checking if that username is available.");
                return;
            }
            if (availability === "invalid" || availability === "taken") {
                Alert.alert("Username not available", availability === "taken" ? "Someone already has that username." : usernameError);
                return;
            }
        }

        try {
            setSaving(true);

            let username = savedUsername;
            if (handle && handle !== savedUsername && availability === "available") {
                await claimUsername(handle);
                username = handle;
                setSavedUsername(handle);
            }

            await savePublicSettings({ ...settings, username });

            if (settings.visible) {
                await publishProfile();
            } else if (wasVisible) {
                await unpublishProfile();
            }

            setWasVisible(settings.visible);

            Alert.alert(
                settings.visible ? "Your portfolio is live" : "Saved",
                settings.visible
                    ? `Anyone with the link can now see it:\n${getPublicProfileUrl(username)}`
                    : "Your portfolio is private."
            );
        } catch (error) {
            console.error("Save public profile error:", error);
            if (error.message === "USERNAME_TAKEN") {
                setAvailability("taken");
                Alert.alert("Username taken", "Someone just grabbed that one. Try another.");
            } else {
                Alert.alert("Error", "Could not save your public profile. Please try again.");
            }
        } finally {
            setSaving(false);
        }
    };

    const shareLink = async () => {
        const url = getPublicProfileUrl(savedUsername);
        try {
            await Share.share({ message: `Check out my portfolio: ${url}`, url });
        } catch (error) {
            console.error("Share error:", error);
        }
    }; 

    if (loading || !settings) {
        return (
            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                <View style={styles.center}>
                    <ActivityIndicator color={colors.accentBlue} />
                </View>
            </SafeAreaView>
        );
    }

    const statusIcon = {
        checking: <ActivityIndicator size="small" color={colors.textMuted} />,
        available: <Ionicons name="checkmark-circle" size={20} color={colors.success} />,
        taken: <Ionicons name="close-circle" size={20} color={colors.red} />,
        invalid: <Ionicons name="alert-circle" size={20} color={colors.amber} />,
        idle: null,
    }[availability];

    const helperText =
        availability === "taken" ? "Someone already has that username."
        : availability === "invalid" ? usernameError
        : availability === "available" && handle !== savedUsername ? "Nice, that one's available."
        : USERNAME_RULES;

    const helperColor =
        availability === "taken" ? colors.red
        : availability === "invalid" ? colors.amber
        : availability === "available" && handle !== savedUsername ? colors.success
        : colors.textMuted;

    return (
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
            <ScreenHeader
                title="Public Profile"
                subtitle="CONTROL WHAT OTHERS SEE"
                bg={colors.lightBlueTint}
                subtitleColor={colors.accentBlue}
            />

            <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                <ScrollView
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Visibility */}
                    <View style={styles.card}>
                        <View style={styles.switchRow}>
                            <View style={styles.flex}>
                                <Text style={styles.cardTitle}>Make my portfolio public</Text>
                                <Text style={styles.hint}>Anyone with your link can view it. No login needed.</Text>
                            </View>
                            <Switch
                                value={settings.visible}
                                onValueChange={update("visible")}
                                trackColor={{ true: colors.accentBlue, false: colors.border }}
                                thumbColor={colors.white}
                            />
                        </View>

                        <View style={[styles.statusPill, isLive ? styles.statusLive : styles.statusPrivate]}>
                            <View style={[styles.statusDot, { backgroundColor: isLive ? colors.success : colors.textMuted }]} />
                            <Text style={[styles.statusText, { color: isLive ? colors.success : colors.textSecondary }]} numberOfLines={1}>
                                {isLive ? `Live at ${getPublicProfileUrl(savedUsername).replace(/^https?:\/\//, "")}` : "Private: only you can see it"}
                            </Text>
                        </View>
                    </View>

                    {/* Username */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Your link</Text>
                        <View style={styles.usernameRow}>
                            <Text style={styles.prefix}>…/u/</Text>
                            <TextInput
                                value={usernameInput}
                                onChangeText={(v) => setUsernameInput(v.toLowerCase())}
                                placeholder="your-name"
                                placeholderTextColor={colors.textMuted}
                                autoCapitalize="none"
                                autoCorrect={false}
                                maxLength={20}
                                style={styles.usernameInput}
                            />
                            {statusIcon}
                        </View>
                        <Text style={[styles.helper, { color: helperColor }]}>{helperText}</Text>
                    </View>

                    {/* What to show */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>What to show</Text>

                        <Text style={styles.optionLabel}>Projects</Text>
                        <View style={styles.segment}>
                            {PROJECT_OPTIONS.map((opt) => {
                                const active = settings.projects === opt.value;
                                return (
                                    <Pressable
                                        key={opt.value}
                                        onPress={() => update("projects")(opt.value)}
                                        style={[styles.segmentItem, active && styles.segmentItemActive]}
                                    >
                                        <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                                            {opt.label}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>

                        {[
                            { key: "showExperience", label: "Work experience" },
                            { key: "showCertificates", label: "Certificates" },
                            { key: "showEmail", label: "Email address", hint: "Off is safer. Recruiters can use LinkedIn instead." },
                        ].map((row) => (
                            <View key={row.key} style={[styles.switchRow, styles.optionRow]}>
                                <View style={styles.flex}>
                                    <Text style={styles.switchLabel}>{row.label}</Text>
                                    {!!row.hint && <Text style={styles.hint}>{row.hint}</Text>}
                                </View>
                                <Switch
                                    value={settings[row.key]}
                                    onValueChange={update(row.key)}
                                    trackColor={{ true: colors.accentBlue, false: colors.border }}
                                    thumbColor={colors.white}
                                />
                            </View>
                        ))}
                    </View>

                    <Pressable
                        style={[styles.saveBtn, saving && styles.disabled]}
                        onPress={handleSave}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator color={colors.white} />
                        ) : (
                            <Text style={styles.saveBtnText}>
                                {settings.visible ? "Save & publish" : wasVisible ? "Save & make private" : "Save"}
                            </Text>
                        )}
                    </Pressable>

                    {isLive && (
                        <>
                        <Pressable style={styles.shareBtn} onPress={() => router.push(`/u/${savedUsername}`)}>
                            <Ionicons name="eye-outline" size={18} color={colors.accentBlue} />
                            <Text style={styles.shareBtnText}>View as public</Text>
                        </Pressable>

                        <Pressable style={styles.shareBtn} onPress={shareLink}>
                            <Ionicons name="share-social-outline" size={18} color={colors.accentBlue} />
                            <Text style={styles.shareBtnText}>Share my link</Text>
                        </Pressable>
                        </>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const createStyles = (colors, spacing, radius) => StyleSheet.create({
    flex: { flex: 1 },
    safeArea: { flex: 1, backgroundColor: colors.background },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
    content: { padding: spacing.lg, paddingBottom: spacing.xl, gap: spacing.md },
    card: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        padding: spacing.md,
    },
    cardTitle: { fontSize: 14.5, fontWeight: "700", color: colors.textPrimary },
    hint: { fontSize: 12, color: colors.textMuted, marginTop: 2, lineHeight: 17 },
    switchRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: spacing.md,
    },
    optionRow: { marginTop: spacing.md },
    switchLabel: { fontSize: 14, fontWeight: "600", color: colors.textPrimary },
    statusPill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        alignSelf: "flex-start",
        maxWidth: "100%",
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: radius.pill,
        marginTop: spacing.md,
    },
    statusLive: { backgroundColor: colors.successTint },
    statusPrivate: { backgroundColor: colors.background },
    statusDot: { width: 7, height: 7, borderRadius: 4 },
    statusText: { flexShrink: 1, fontSize: 12, fontWeight: "600" },
    usernameRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.xs,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        backgroundColor: colors.background,
        paddingHorizontal: spacing.md,
        marginTop: spacing.sm,
    },
    prefix: { fontSize: 14, color: colors.textMuted },
    usernameInput: { flex: 1, paddingVertical: 12, fontSize: 14, color: colors.textPrimary },
    helper: { fontSize: 12, marginTop: spacing.xs },
    optionLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: colors.textPrimary,
        marginTop: spacing.md,
        marginBottom: spacing.xs,
    },
    segment: {
        flexDirection: "row",
        backgroundColor: colors.border,
        borderRadius: radius.pill,
        padding: 3,
    },
    segmentItem: {
        flex: 1,
        alignItems: "center",
        paddingVertical: spacing.sm,
        borderRadius: radius.pill,
    },
    segmentItemActive: { backgroundColor: colors.surface },
    segmentText: { fontSize: 13, fontWeight: "700", color: colors.textSecondary },
    segmentTextActive: { color: colors.accentBlue },
    saveBtn: {
        backgroundColor: colors.navy,
        borderRadius: radius.md,
        paddingVertical: 14,
        alignItems: "center",
        marginTop: spacing.sm,
    },
    saveBtnText: { color: colors.white, fontSize: 15, fontWeight: "700" },
    disabled: { opacity: 0.6 },
    shareBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.xs,
        borderWidth: 1.5,
        borderColor: colors.accentBlue,
        borderRadius: radius.md,
        paddingVertical: 13,
    },
    shareBtnText: { color: colors.accentBlue, fontSize: 15, fontWeight: "700" },
});
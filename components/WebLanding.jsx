import { useMemo, useState } from "react";
import { View, Text, Image, TextInput, Pressable, ScrollView, StyleSheet } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";
import { normalizeUsername } from "../services/publicProfile";

const FEATURES = [
    {
        icon: "briefcase-outline",
        title: "Everything in one place",
        text: "Projects, work experience, certificates and resumes, organised on your phone.",
    },
    {
        icon: "color-palette-outline",
        title: "Not just for developers",
        text: "Designers, writers, marketers, researchers: showcase any kind of work.",
    },
    {
        icon: "link-outline",
        title: "One link to share",
        text: "Send a single link to your portfolio. No app or login needed to view it.",
    },
];

export default function WebLanding() {
    const router = useRouter();
    const { colors, spacing, radius, isDark } = useTheme();
    const styles = useMemo(() => createStyles(colors, spacing, radius), [colors, spacing, radius]);

    const [username, setUsername] = useState("");
    const handle = normalizeUsername(username);

    const viewPortfolio = () => {
        if (handle) router.push(`/u/${handle}`);
    };

    return (
        <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>
            <Stack.Screen options={{ title: "Portfor-U · Your portfolio, in your pocket" }} />

            <View style={styles.container}>
                {/* Hero */}
                <View style={styles.hero}>
                    <Image
                        source={
                    isDark ?
                    require('../assets/Portfor-3W.png') : require('../assets/Portfor-3.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.headline}>Your portfolio, in your pocket</Text>
                    <Text style={styles.subhead}>
                        Portfor-U is a mobile app that helps students and jobseekers organise their work and share it
                        with employers through one simple link.
                    </Text>
                </View>

                {/* Find a portfolio */}
                <View style={styles.findCard}>
                    <Text style={styles.findTitle}>Got a Portfor-U link?</Text>
                    <Text style={styles.findText}>Enter the username to view their portfolio.</Text>

                    <View style={styles.findRow}>
                        <View style={styles.inputWrap}>
                            <Text style={styles.prefix}>portfor-u.web.app/u/</Text>
                            <TextInput
                                value={username}
                                onChangeText={setUsername}
                                onSubmitEditing={viewPortfolio}
                                placeholder="username"
                                placeholderTextColor={colors.textMuted}
                                autoCapitalize="none"
                                autoCorrect={false}
                                style={styles.input}
                            />
                        </View>
                        <Pressable
                            style={[styles.findBtn, !handle && styles.disabled]}
                            onPress={viewPortfolio}
                            disabled={!handle}
                        >
                            <Text style={styles.findBtnText}>View</Text>
                            <Ionicons name="arrow-forward" size={16} color={colors.white} />
                        </Pressable>
                    </View>
                </View>

                {/* Features */}
                <View style={styles.features}>
                    {FEATURES.map((f) => (
                        <View key={f.title} style={styles.feature}>
                            <View style={styles.featureIcon}>
                                <Ionicons name={f.icon} size={22} color={colors.accentBlue} />
                            </View>
                            <Text style={styles.featureTitle}>{f.title}</Text>
                            <Text style={styles.featureText}>{f.text}</Text>
                        </View>
                    ))}
                </View>

                <Text style={styles.footer}>© {new Date().getFullYear()} Portfor-U</Text>
            </View>
        </ScrollView>
    );
}

const createStyles = (colors, spacing, radius) => StyleSheet.create({
    page: { flex: 1, backgroundColor: colors.background },
    pageContent: { paddingVertical: spacing.xl * 2, paddingHorizontal: spacing.lg },
    container: { width: "100%", maxWidth: 960, alignSelf: "center" },
    hero: { alignItems: "center", maxWidth: 640, alignSelf: "center" },
    logo: { width: 180, height: 140, marginBottom: spacing.lg },
    headline: {
        fontSize: 36,
        fontWeight: "800",
        color: colors.textPrimary,
        textAlign: "center",
    },
    subhead: {
        fontSize: 16,
        lineHeight: 24,
        color: colors.textSecondary,
        textAlign: "center",
        marginTop: spacing.md,
    },

    findCard: {
        width: "100%",
        maxWidth: 560,
        alignSelf: "center",
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.lg,
        padding: spacing.lg,
        marginTop: spacing.xl * 1.5,
    },
    findTitle: { fontSize: 17, fontWeight: "800", color: colors.textPrimary },
    findText: { fontSize: 13.5, color: colors.textSecondary, marginTop: 4 },
    findRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.md },
    inputWrap: {
        flex: 1,
        minWidth: 240,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        backgroundColor: colors.background,
        paddingHorizontal: spacing.md,
    },
    prefix: { fontSize: 14, color: colors.textMuted },
    input: { flex: 1, paddingVertical: 12, fontSize: 14, color: colors.textPrimary },
    findBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        backgroundColor: colors.navy,
        borderRadius: radius.md,
        paddingHorizontal: spacing.lg,
        paddingVertical: 12,
    },
    findBtnText: { color: colors.white, fontSize: 14.5, fontWeight: "700" },
    disabled: { opacity: 0.5 },
    features: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: spacing.md,
        marginTop: spacing.xl * 1.5,
    },
    feature: {
        flexGrow: 1,
        flexBasis: 260,
        maxWidth: 310,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.lg,
        padding: spacing.lg,
    },
    featureIcon: {
        width: 44,
        height: 44,
        borderRadius: radius.md,
        backgroundColor: colors.lightBlueTint,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: spacing.md,
    },
    featureTitle: { fontSize: 15.5, fontWeight: "800", color: colors.textPrimary },
    featureText: { fontSize: 13.5, lineHeight: 20, color: colors.textSecondary, marginTop: 4 },
    footer: {
        textAlign: "center",
        fontSize: 12,
        color: colors.textMuted,
        marginTop: spacing.xl * 2,
    },
});
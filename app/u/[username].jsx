import { useEffect, useMemo, useState } from "react";
import {
    StyleSheet, Text, View, ScrollView, Image, Pressable,
    ActivityIndicator, Linking, Share, Platform,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "../../theme/ThemeContext";
import { useAuthUser } from "../../hooks/useAuthUser";
import { subscribeToPublicProfile, getPublicProfileUrl } from "../../services/publicProfile";
import { formatRange } from "../../utils/dates";
import { getLinkMeta } from "../../utils/links";
import ProjectCard from "../../components/experience/ProjectCard";
import ProjectPreviewModal from "../../components/public/ProjectPreviewModal";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Certificates may store dates differently, so only format "YYYY-MM"
const formatCertDate = (value) => {
    if (!value) return null;
    if (/^\d{4}-\d{2}$/.test(value)) {
        const [y, m] = value.split("-").map(Number);
        return `${MONTHS[m - 1]} ${y}`;
    }
    return String(value);
};

const getInitials = (name = "") =>
    name.split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";

// ProjectCard expects images as [{ url, path }]; the public copy stores plain URLs
const toCardShape = (p) => ({ ...p, images: (p.images ?? []).map((url) => ({ url, path: url })) });

// ---------- Small building blocks (outside the screen so they don't remount) ----------

const Section = ({ title, count, styles, children }) => (
    <View style={styles.section}>
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {count != null && <Text style={styles.sectionCount}>{count}</Text>}
        </View>
        {children}
    </View>
);

const ExperienceItem = ({ item, isLast, styles }) => {
    const dateRange = item.startDate
        ? formatRange(item.startDate, item.currentlyWorkHere ? null : item.endDate)
        : null;
    const place = [item.location, item.workArrangement].filter(Boolean).join(" · ");

    return (
        <View style={styles.timelineItem}>
            <View style={styles.timelineRail}>
                <View style={[styles.timelineDot, item.currentlyWorkHere && styles.timelineDotCurrent]} />
                {!isLast && <View style={styles.timelineLine} />}
            </View>
            <View style={styles.timelineContent}>
                <Text style={styles.jobTitle}>{item.jobTitle}</Text>
                <Text style={styles.company}>{item.company}</Text>
                {!!dateRange && <Text style={styles.meta}>{dateRange}</Text>}
                {!!place && <Text style={styles.meta}>{place}</Text>}
                {!!item.description && <Text style={styles.body}>{item.description}</Text>}
            </View>
        </View>
    );
};

const CertificateItem = ({ cert, styles, colors, onOpen }) => {
    const date = formatCertDate(cert.dateEarned);
    return (
        <View style={styles.certRow}>
            {cert.logoUrl ? (
                <Image source={{ uri: cert.logoUrl }} style={styles.certLogo} resizeMode="contain" />
            ) : (
                <View style={[styles.certLogo, styles.certLogoPlaceholder]}>
                    <Ionicons name="ribbon-outline" size={20} color={colors.amber} />
                </View>
            )}
            <View style={styles.flex}>
                <Text style={styles.certName}>{cert.name}</Text>
                <Text style={styles.meta}>
                    {[cert.issuer, date && `Earned ${date}`].filter(Boolean).join(" · ")}
                </Text>
            </View>
            {!!cert.credentialUrl && (
                <Pressable style={styles.verifyBtn} onPress={() => onOpen(cert.credentialUrl)} hitSlop={6}>
                    <Text style={styles.verifyText}>Verify</Text>
                    <Ionicons name="open-outline" size={12} color={colors.accentBlue} />
                </Pressable>
            )}
        </View>
    );
};

// ---------- Screen ----------

export default function PublicPortfolio() {
    const router = useRouter();
    const { username } = useLocalSearchParams();
    const { user } = useAuthUser();

    const { colors, spacing, radius } = useTheme();
    const styles = useMemo(() => createStyles(colors, spacing, radius), [colors, spacing, radius]);

    const [profile, setProfile] = useState(undefined); // undefined = loading, null = not found
    const [selectedProject, setSelectedProject] = useState(null);

    useEffect(() => {
    if (!username) return;
    setProfile(undefined);

    const unsubscribe = subscribeToPublicProfile(
        String(username),
        setProfile,
        (error) => {
            console.error("Load public profile error:", error);
            setProfile(null);
        }
    );

    return unsubscribe;
}, [username]);

    const openUrl = async (url) => {
        try {
            await Linking.openURL(url);
        } catch {
            console.warn("Couldn't open", url);
        }
    };

    const shareProfile = async () => {
        const url = getPublicProfileUrl(profile.username);
        try {
            await Share.share({ message: `${profile.displayName}'s portfolio: ${url}`, url });
        } catch (error) {
            console.error("Share error:", error);
        }
    };

    const canGoBack = router.canGoBack();
    const isOwner = !!user && profile?.uid === user.uid;

    const topBar = (
        <View style={styles.topBar}>
            {canGoBack ? (
                <Pressable onPress={() => router.back()} style={styles.iconBtn} hitSlop={8} accessibilityLabel="Go back">
                    <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
                </Pressable>
            ) : (
                <Text style={styles.brand}>Portfor-U</Text>
            )}
            {profile && Platform.OS !== "web" && (
                <Pressable onPress={shareProfile} style={styles.iconBtn} hitSlop={8} accessibilityLabel="Share portfolio">
                    <Ionicons name="share-outline" size={19} color={colors.textPrimary} />
                </Pressable>
            )}
        </View>
    );

    // Loading
    if (profile === undefined) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <Stack.Screen options={{ title: "Portfor-U" }} />
                {topBar}
                <View style={styles.center}>
                    <ActivityIndicator color={colors.accentBlue} />
                </View>
            </SafeAreaView>
        );
    }

    // Private or doesn't exist
    if (profile === null) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <Stack.Screen options={{ title: "Portfolio not found · Portfor-U" }} />
                {topBar}
                <View style={styles.center}>
                    <View style={styles.notFoundIcon}>
                        <Ionicons name="lock-closed-outline" size={28} color={colors.accentBlue} />
                    </View>
                    <Text style={styles.notFoundTitle}>This portfolio isn't available</Text>
                    <Text style={styles.notFoundText}>
                        It might be private, or the link could be wrong.
                    </Text>
                    {!user && (
                        <Pressable style={styles.primaryBtn} onPress={() => router.replace("/")}>
                            <Text style={styles.primaryBtnText}>Go to Portfor-U</Text>
                        </Pressable>
                    )}
                </View>
            </SafeAreaView>
        );
    }

    const projects = profile.projects ?? [];
    const experience = profile.experience ?? [];
    const certificates = profile.certificates ?? [];
    const { email, linkedin } = profile.contact ?? {};

    return (
        <SafeAreaView style={styles.safeArea}>
            <Stack.Screen options={{ title: `${profile.displayName} · Portfor-U` }} />
            {topBar}

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.container}>
                    {/* Owner preview banner */}
                    {isOwner && (
                        <View style={styles.ownerBanner}>
                            <Ionicons name="eye-outline" size={16} color={colors.accentBlue} />
                            <Text style={styles.ownerBannerText}>This is how others see your portfolio.</Text>
                            <Pressable onPress={() => router.push("/public-profile")} hitSlop={6}>
                                <Text style={styles.ownerBannerLink}>Edit</Text>
                            </Pressable>
                        </View>
                    )}

                    {/* Hero */}
                    <View style={styles.hero}>
                        {profile.photoURL ? (
                            <Image source={{ uri: profile.photoURL }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                <Text style={styles.avatarInitials}>{getInitials(profile.displayName)}</Text>
                            </View>
                        )}

                        <Text style={styles.name}>{profile.displayName}</Text>
                        {!!profile.headline && <Text style={styles.headline}>{profile.headline}</Text>}
                        {!!profile.location && (
                            <View style={styles.locationRow}>
                                <Ionicons name="location-outline" size={13} color={colors.textMuted} />
                                <Text style={styles.meta}>{profile.location}</Text>
                            </View>
                        )}

                        {(!!email || !!linkedin) && (
                            <View style={styles.contactRow}>
                                {!!email && (
                                    <Pressable style={styles.contactBtn} onPress={() => openUrl(`mailto:${email}`)}>
                                        <Ionicons name="mail-outline" size={16} color={colors.white} />
                                        <Text style={styles.contactBtnText}>Email</Text>
                                    </Pressable>
                                )}
                                {!!linkedin && (
                                    <Pressable
                                        style={[styles.contactBtn, styles.contactBtnOutline]}
                                        onPress={() => openUrl(linkedin)}
                                    >
                                        <Ionicons name={getLinkMeta(linkedin).icon} size={16} color={colors.accentBlue} />
                                        <Text style={[styles.contactBtnText, styles.contactBtnOutlineText]}>LinkedIn</Text>
                                    </Pressable>
                                )}
                            </View>
                        )}
                    </View>

                    {/* About */}
                    {!!profile.about && (
                        <Section title="About" styles={styles}>
                            <Text style={styles.body}>{profile.about}</Text>
                        </Section>
                    )}

                    {/* Projects */}
                    {projects.length > 0 && (
                        <Section title="Projects" count={projects.length} styles={styles}>
                            <View style={styles.projectList}>
                                {projects.map((p) => (
                                    <ProjectCard
                                        key={p.id}
                                        project={toCardShape(p)}
                                        onPress={() => setSelectedProject(p)}
                                    />
                                ))}
                            </View>
                        </Section>
                    )}

                    {/* Experience */}
                    {experience.length > 0 && (
                        <Section title="Experience" count={experience.length} styles={styles}>
                            <View style={styles.card}>
                                {experience.map((item, index) => (
                                    <ExperienceItem
                                        key={`${item.company}-${item.jobTitle}-${index}`}
                                        item={item}
                                        isLast={index === experience.length - 1}
                                        styles={styles}
                                    />
                                ))}
                            </View>
                        </Section>
                    )}

                    {/* Certificates */}
                    {certificates.length > 0 && (
                        <Section title="Certificates" count={certificates.length} styles={styles}>
                            <View style={styles.card}>
                                {certificates.map((cert, index) => (
                                    <CertificateItem
                                        key={`${cert.name}-${index}`}
                                        cert={cert}
                                        styles={styles}
                                        colors={colors}
                                        onOpen={openUrl}
                                    />
                                ))}
                            </View>
                        </Section>
                    )}

                    {/* Nothing shared yet */}
                    {!profile.about && !projects.length && !experience.length && !certificates.length && (
                        <Text style={[styles.body, styles.emptyText]}>
                            {profile.displayName} hasn't added anything to their portfolio yet.
                        </Text>
                    )}

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Built with Portfor-U</Text>
                        {!user && (
                            <Pressable onPress={() => router.replace("/")} hitSlop={6}>
                                <Text style={styles.footerLink}>Create your own portfolio →</Text>
                            </Pressable>
                        )}
                    </View>
                </View>
            </ScrollView>

            <ProjectPreviewModal
                project={selectedProject}
                onClose={() => setSelectedProject(null)}
                onOpenLink={openUrl}
            />
        </SafeAreaView>
    );
}

const createStyles = (colors, spacing, radius) => StyleSheet.create({
    flex: { flex: 1 },
    safeArea: { flex: 1, backgroundColor: colors.background },
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: spacing.lg,
        gap: spacing.sm,
    },
    topBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        minHeight: 52,
    },
    brand: { fontSize: 16, fontWeight: "800", color: colors.navy },
    iconBtn: {
        width: 36,
        height: 36,
        borderRadius: radius.md,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: "center",
        justifyContent: "center",
    },
    scrollContent: { paddingBottom: spacing.xl },
    // Keeps it readable on wide web screens
    container: {
        width: "100%",
        maxWidth: 720,
        alignSelf: "center",
        paddingHorizontal: spacing.lg,
    },
    ownerBanner: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        backgroundColor: colors.lightBlueTint,
        borderRadius: radius.md,
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    ownerBannerText: { flex: 1, fontSize: 12.5, fontWeight: "600", color: colors.textPrimary },
    ownerBannerLink: { fontSize: 13, fontWeight: "800", color: colors.accentBlue },
    hero: {
        alignItems: "center",
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.lg,
        padding: spacing.lg,
    },
    avatar: { width: 88, height: 88, borderRadius: 44, marginBottom: spacing.md },
    avatarPlaceholder: {
        backgroundColor: colors.lightBlueTint,
        alignItems: "center",
        justifyContent: "center",
    },
    avatarInitials: { fontSize: 30, fontWeight: "800", color: colors.accentBlue },
    name: { fontSize: 24, fontWeight: "800", color: colors.textPrimary, textAlign: "center" },
    headline: {
        fontSize: 14.5,
        color: colors.textSecondary,
        textAlign: "center",
        marginTop: spacing.xs,
        lineHeight: 20,
    },
    locationRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: spacing.sm },
    contactRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md },
    contactBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: colors.navy,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radius.pill,
    },
    contactBtnText: { fontSize: 13.5, fontWeight: "700", color: colors.white },
    contactBtnOutline: {
        backgroundColor: "transparent",
        borderWidth: 1.5,
        borderColor: colors.accentBlue,
    },
    contactBtnOutlineText: { color: colors.accentBlue },
    section: { marginTop: spacing.xl },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "baseline",
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    sectionTitle: { fontSize: 18, fontWeight: "800", color: colors.textPrimary },
    sectionCount: { fontSize: 13, fontWeight: "700", color: colors.textMuted },
    body: { fontSize: 14, color: colors.textSecondary, lineHeight: 21 },
    meta: { fontSize: 12.5, color: colors.textMuted, marginTop: 2 },
    projectList: { gap: spacing.md },
    card: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        padding: spacing.md,
    },
    timelineItem: { flexDirection: "row", gap: spacing.md },
    timelineRail: { alignItems: "center", width: 12 },
    timelineDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: colors.success,
        backgroundColor: colors.surface,
        marginTop: 4,
    },
    timelineDotCurrent: { backgroundColor: colors.success },
    timelineLine: { flex: 1, width: 2, backgroundColor: colors.border, marginVertical: 4 },
    timelineContent: { flex: 1, paddingBottom: spacing.lg },
    jobTitle: { fontSize: 15, fontWeight: "800", color: colors.textPrimary },
    company: { fontSize: 13.5, fontWeight: "600", color: colors.success, marginTop: 1 },
    certRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        paddingVertical: spacing.sm,
    },
    certLogo: { width: 40, height: 40, borderRadius: radius.sm },
    certLogoPlaceholder: {
        backgroundColor: colors.amberTint,
        alignItems: "center",
        justifyContent: "center",
    },
    certName: { fontSize: 14, fontWeight: "700", color: colors.textPrimary },
    verifyBtn: { flexDirection: "row", alignItems: "center", gap: 3 },
    verifyText: { fontSize: 12.5, fontWeight: "700", color: colors.accentBlue },
    emptyText: { textAlign: "center", marginTop: spacing.xl },
    notFoundIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.lightBlueTint,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: spacing.sm,
    },
    notFoundTitle: { fontSize: 18, fontWeight: "800", color: colors.textPrimary, textAlign: "center" },
    notFoundText: { fontSize: 14, color: colors.textSecondary, textAlign: "center" },
    primaryBtn: {
        backgroundColor: colors.navy,
        borderRadius: radius.md,
        paddingVertical: 12,
        paddingHorizontal: spacing.lg,
        marginTop: spacing.md,
    },
    primaryBtnText: { color: colors.white, fontSize: 14.5, fontWeight: "700" },
    footer: { alignItems: "center", gap: spacing.xs, marginTop: spacing.xl },
    footerText: { fontSize: 12, color: colors.textMuted },
    footerLink: { fontSize: 13, fontWeight: "700", color: colors.accentBlue },
});
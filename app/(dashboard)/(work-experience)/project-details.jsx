import { useEffect, useMemo, useState } from "react";
import {
    StyleSheet, Text, View, ScrollView, Image, Pressable, Alert,
    ActivityIndicator, Linking, useWindowDimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "../../../theme/ThemeContext";
import ScreenHeader from "../../../components/ScreenHeader";
import { subscribeToProject, deleteProject, setProjectFeatured } from "../../../services/projects";
import { formatRange } from "../../../utils/dates";

export default function ProjectDetails() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { width } = useWindowDimensions();

    const { colors, spacing, radius } = useTheme();
    const styles = useMemo(() => createStyles(colors, spacing, radius), [colors, spacing, radius]);

    const [project, setProject] = useState(undefined); // undefined = loading, null = not found
    const [activeImage, setActiveImage] = useState(0);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (!id) return;
        const unsubscribe = subscribeToProject(id, setProject, (error) => {
            console.error("Load project error:", error);
            setProject(null);
        });
        return unsubscribe;
    }, [id]);

    const openLink = async (url) => {
        try {
            await Linking.openURL(url);
        } catch {
            Alert.alert("Couldn't open link", url);
        }
    };

    const toggleFeatured = async () => {
        try {
            await setProjectFeatured(id, !project.featured);
        } catch (error) {
            console.error("Feature toggle error:", error);
            Alert.alert("Error", "Could not update this project.");
        }
    };

    const handleDelete = () => {
        Alert.alert("Delete project?", `"${project.title}" and its screenshots will be removed.`, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        setDeleting(true);
                        await deleteProject(project);
                        router.back();
                    } catch (error) {
                        console.error("Delete project error:", error);
                        Alert.alert("Error", "Could not delete this project.");
                        setDeleting(false);
                    }
                },
            },
        ]);
    };

    if (project === undefined || deleting) {
        return (
            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                <View style={styles.center}>
                    <ActivityIndicator color={colors.success} />
                </View>
            </SafeAreaView>
        );
    }

    if (project === null) {
        return (
            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                <ScreenHeader title="Project" bg={colors.successTint} />
                <View style={styles.center}>
                    <Ionicons name="alert-circle-outline" size={28} color={colors.textMuted} />
                    <Text style={styles.muted}>This project doesn't exist anymore.</Text>
                </View>
            </SafeAreaView>
        );
    }

    const images = project.images ?? [];
    const dateRange = formatRange(project.startDate, project.endDate);
    const tags = project.techStack ?? [];

    return (
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
            <ScreenHeader
                title={project.title}
                subtitle={project.source === "github" ? "IMPORTED FROM GITHUB" : "PROJECT DETAILS"}
                bg={colors.successTint}
                subtitleColor={colors.success}
            />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Gallery */}
                {images.length > 0 ? (
                    <View>
                        <ScrollView
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onMomentumScrollEnd={(e) =>
                                setActiveImage(Math.round(e.nativeEvent.contentOffset.x / width))
                            }
                        >
                            {images.map((img) => (
                                <Image
                                    key={img.path}
                                    source={{ uri: img.url }}
                                    style={[styles.galleryImage, { width }]}
                                    resizeMode="cover"
                                />
                            ))}
                        </ScrollView>

                        {images.length > 1 && (
                            <View style={styles.dots}>
                                {images.map((img, i) => (
                                    <View key={img.path} style={[styles.dot, i === activeImage && styles.dotActive]} />
                                ))}
                            </View>
                        )}
                    </View>
                ) : (
                    <View style={styles.galleryPlaceholder}>
                        <Ionicons name="code-slash" size={36} color={colors.success} />
                    </View>
                )}

                <View style={styles.body}>
                    {/* Title row */}
                    <View style={styles.titleRow}>
                        <View style={styles.flex}>
                            <Text style={styles.title}>{project.title}</Text>
                            {!!project.role && <Text style={styles.role}>{project.role}</Text>}
                        </View>
                        <Pressable
                            onPress={toggleFeatured}
                            style={[styles.featureBtn, project.featured && styles.featureBtnActive]}
                            accessibilityLabel={project.featured ? "Unfeature project" : "Feature project"}
                            hitSlop={6}
                        >
                            <Ionicons
                                name={project.featured ? "star" : "star-outline"}
                                size={18}
                                color={colors.amber}
                            />
                        </Pressable>
                    </View>

                    {!!dateRange && (
                        <View style={styles.metaRow}>
                            <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
                            <Text style={styles.meta}>{dateRange}</Text>
                        </View>
                    )}

                    {!!project.summary && <Text style={styles.summary}>{project.summary}</Text>}

                    {/* Links */}
                    {(!!project.links?.github || !!project.links?.demo) && (
                        <View style={styles.linkRow}>
                            {!!project.links?.github && (
                                <Pressable style={styles.linkBtn} onPress={() => openLink(project.links.github)}>
                                    <Ionicons name="logo-github" size={16} color={colors.textPrimary} />
                                    <Text style={styles.linkText}>GitHub</Text>
                                </Pressable>
                            )}
                            {!!project.links?.demo && (
                                <Pressable style={styles.linkBtn} onPress={() => openLink(project.links.demo)}>
                                    <Ionicons name="globe-outline" size={16} color={colors.textPrimary} />
                                    <Text style={styles.linkText}>Live demo</Text>
                                </Pressable>
                            )}
                        </View>
                    )}

                    {/* Tech stack */}
                    {tags.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Tech stack</Text>
                            <View style={styles.tagRow}>
                                {tags.map((tag) => (
                                    <View key={tag} style={styles.tag}>
                                        <Text style={styles.tagText}>{tag}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Description */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>About this project</Text>
                        <Text style={styles.description}>
                            {project.description || "No description yet. Tap Edit to add one."}
                        </Text>
                    </View>

                    {/* Actions */}
                    <Pressable
                        style={styles.editBtn}
                        onPress={() => router.push({ pathname: "/add-project", params: { id } })}
                    >
                        <Ionicons name="pencil" size={16} color={colors.white} />
                        <Text style={styles.editBtnText}>Edit project</Text>
                    </Pressable>

                    <Pressable style={styles.deleteBtn} onPress={handleDelete}>
                        <Text style={styles.deleteBtnText}>Delete project</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (colors, spacing, radius) => StyleSheet.create({
    flex: { flex: 1 },
    safeArea: { flex: 1, backgroundColor: colors.background },
    center: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.sm },
    muted: { color: colors.textSecondary },
    scrollContent: { paddingBottom: spacing.xl },
    galleryImage: { height: 220, backgroundColor: colors.surface },
    galleryPlaceholder: {
        height: 160,
        backgroundColor: colors.successTint,
        alignItems: "center",
        justifyContent: "center",
    },
    dots: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 6,
        marginTop: spacing.sm,
    },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.border },
    dotActive: { width: 16, backgroundColor: colors.success },
    body: { padding: spacing.lg },
    titleRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md },
    title: { fontSize: 22, fontWeight: "800", color: colors.textPrimary },
    role: { fontSize: 14, fontWeight: "600", color: colors.success, marginTop: 2 },
    featureBtn: {
        width: 36,
        height: 36,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: "center",
        justifyContent: "center",
    },
    featureBtnActive: { backgroundColor: colors.amberTint, borderColor: colors.amberTint },
    metaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: spacing.sm },
    meta: { fontSize: 13, color: colors.textMuted, fontWeight: "600" },
    summary: {
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 20,
        marginTop: spacing.md,
    },
    linkRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md },
    linkBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
    },
    linkText: { fontSize: 13, fontWeight: "700", color: colors.textPrimary },
    section: { marginTop: spacing.lg },
    sectionTitle: {
        fontSize: 15,
        fontWeight: "800",
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
    tag: {
        backgroundColor: colors.successTint,
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: radius.pill,
    },
    tagText: { fontSize: 12, fontWeight: "600", color: colors.success },
    description: { fontSize: 14, color: colors.textSecondary, lineHeight: 21 },
    editBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.xs,
        backgroundColor: colors.navy,
        borderRadius: radius.md,
        paddingVertical: 14,
        marginTop: spacing.xl,
    },
    editBtnText: { color: colors.white, fontSize: 15, fontWeight: "700" },
    deleteBtn: {
        backgroundColor: colors.redTint,
        borderRadius: radius.md,
        paddingVertical: 14,
        alignItems: "center",
        marginTop: spacing.sm,
    },
    deleteBtnText: { color: colors.red, fontSize: 15, fontWeight: "700" },
});
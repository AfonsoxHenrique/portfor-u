import { useMemo, useState } from "react";
import {
    Modal, View, Text, ScrollView, Image, Pressable, StyleSheet, useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../theme/ThemeContext";
import { formatRange } from "../../utils/dates";
import { getCategory } from "../../theme/projectCategories";
import { getLinkMeta } from "../../utils/links";

const MAX_WIDTH = 720;

export default function ProjectPreviewModal({ project, onClose, onOpenLink }) {
    const { colors, spacing, radius } = useTheme();
    const styles = useMemo(() => createStyles(colors, spacing, radius), [colors, spacing, radius]);
    const { width: screenWidth } = useWindowDimensions();
    const width = Math.min(screenWidth, MAX_WIDTH);
    const [activeImage, setActiveImage] = useState(0);

    if (!project) return null;

    const category = getCategory(project.category);
    const images = project.images ?? []; // plain URLs in the public copy
    const links = project.links ?? [];
    const tags = project.techStack ?? [];
    const dateRange = formatRange(project.startDate, project.endDate);

    return (
        <Modal
            visible={!!project}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
            onShow={() => setActiveImage(0)}
        >
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.topBar}>
                    <Text style={styles.topBarTitle} numberOfLines={1}>{project.title}</Text>
                    <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8} accessibilityLabel="Close">
                        <Ionicons name="close" size={20} color={colors.textPrimary} />
                    </Pressable>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={[styles.container, { maxWidth: MAX_WIDTH }]}>
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
                                    {images.map((url) => (
                                        <Image
                                            key={url}
                                            source={{ uri: url }}
                                            style={[styles.galleryImage, { width }]}
                                            resizeMode="cover"
                                        />
                                    ))}
                                </ScrollView>
                                {images.length > 1 && (
                                    <View style={styles.dots}>
                                        {images.map((url, i) => (
                                            <View key={url} style={[styles.dot, i === activeImage && styles.dotActive]} />
                                        ))}
                                    </View>
                                )}
                            </View>
                        ) : (
                            <View style={styles.galleryPlaceholder}>
                                <Ionicons name={category.icon} size={36} color={colors.success} />
                            </View>
                        )}

                        <View style={styles.body}>
                            <View style={styles.categoryChip}>
                                <Ionicons name={category.icon} size={12} color={colors.success} />
                                <Text style={styles.categoryChipText}>{category.label}</Text>
                            </View>

                            <Text style={styles.title}>{project.title}</Text>
                            {!!project.role && <Text style={styles.role}>{project.role}</Text>}
                            {!!dateRange && <Text style={styles.meta}>{dateRange}</Text>}

                            {!!project.summary && <Text style={styles.summary}>{project.summary}</Text>}

                            {links.length > 0 && (
                                <View style={styles.linkRow}>
                                    {links.map((url) => {
                                        const meta = getLinkMeta(url);
                                        return (
                                            <Pressable key={url} style={styles.linkBtn} onPress={() => onOpenLink(url)}>
                                                <Ionicons name={meta.icon} size={16} color={colors.textPrimary} />
                                                <Text style={styles.linkText} numberOfLines={1}>{meta.label}</Text>
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            )}

                            {tags.length > 0 && (
                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>{category.skillsLabel}</Text>
                                    <View style={styles.tagRow}>
                                        {tags.map((tag) => (
                                            <View key={tag} style={styles.tag}>
                                                <Text style={styles.tagText}>{tag}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )}

                            {!!project.description && (
                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>About this project</Text>
                                    <Text style={styles.description}>{project.description}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </Modal>
    );
}

const createStyles = (colors, spacing, radius) => StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    topBar: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    topBarTitle: { flex: 1, fontSize: 16, fontWeight: "800", color: colors.textPrimary },
    closeBtn: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: "center",
        justifyContent: "center",
    },
    scrollContent: { paddingBottom: spacing.xl },
    container: { width: "100%", alignSelf: "center" },
    galleryImage: { height: 240, backgroundColor: colors.surface },
    galleryPlaceholder: {
        height: 160,
        backgroundColor: colors.successTint,
        alignItems: "center",
        justifyContent: "center",
    },
    dots: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: spacing.sm },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.border },
    dotActive: { width: 16, backgroundColor: colors.success },
    body: { padding: spacing.lg },
    categoryChip: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        gap: 4,
        backgroundColor: colors.successTint,
        paddingHorizontal: spacing.sm,
        paddingVertical: 3,
        borderRadius: radius.pill,
        marginBottom: spacing.xs,
    },
    categoryChipText: { fontSize: 11, fontWeight: "700", color: colors.success },
    title: { fontSize: 22, fontWeight: "800", color: colors.textPrimary },
    role: { fontSize: 14, fontWeight: "600", color: colors.success, marginTop: 2 },
    meta: { fontSize: 13, color: colors.textMuted, fontWeight: "600", marginTop: spacing.xs },
    summary: { fontSize: 14, color: colors.textSecondary, lineHeight: 20, marginTop: spacing.md },
    linkRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.md },
    linkBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        maxWidth: "100%",
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
    },
    linkText: { flexShrink: 1, fontSize: 13, fontWeight: "700", color: colors.textPrimary },
    section: { marginTop: spacing.lg },
    sectionTitle: { fontSize: 15, fontWeight: "800", color: colors.textPrimary, marginBottom: spacing.sm },
    tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
    tag: {
        backgroundColor: colors.successTint,
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: radius.pill,
    },
    tagText: { fontSize: 12, fontWeight: "600", color: colors.success },
    description: { fontSize: 14, color: colors.textSecondary, lineHeight: 21 },
});
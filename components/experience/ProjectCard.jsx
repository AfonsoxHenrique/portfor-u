import { useMemo } from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/ThemeContext";
import { formatRange } from "../../utils/dates";

const MAX_TAGS = 3;

export default function ProjectCard({ project, onPress }) {
    const { colors, spacing, radius } = useTheme();
    const styles = useMemo(() => createStyles(colors, spacing, radius), [colors, spacing, radius]);

    const cover = project.images?.[0]?.url;
    const tags = project.techStack ?? [];
    const extraTags = tags.length - MAX_TAGS;
    const dateRange = formatRange(project.startDate, project.endDate);

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
        >
            {cover ? (
                <Image source={{ uri: cover }} style={styles.cover} resizeMode="cover" />
            ) : (
                <View style={[styles.cover, styles.coverPlaceholder]}>
                    <Ionicons name="code-slash" size={28} color={colors.success} />
                </View>
            )}

            {project.featured && (
                <View style={styles.featuredBadge}>
                    <Ionicons name="star" size={11} color={colors.amber} />
                    <Text style={styles.featuredText}>Featured</Text>
                </View>
            )}

            <View style={styles.body}>
                <Text style={styles.title} numberOfLines={1}>{project.title}</Text>

                {!!project.summary && (
                    <Text style={styles.summary} numberOfLines={2}>{project.summary}</Text>
                )}

                {tags.length > 0 && (
                    <View style={styles.tagRow}>
                        {tags.slice(0, MAX_TAGS).map((tag) => (
                            <View key={tag} style={styles.tag}>
                                <Text style={styles.tagText}>{tag}</Text>
                            </View>
                        ))}
                        {extraTags > 0 && (
                            <View style={styles.tag}>
                                <Text style={styles.tagText}>+{extraTags}</Text>
                            </View>
                        )}
                    </View>
                )}

                <View style={styles.metaRow}>
                    {dateRange && <Text style={styles.meta}>{dateRange}</Text>}
                    <View style={styles.metaIcons}>
                        {!!project.links?.github && (
                            <Ionicons name="logo-github" size={15} color={colors.textSecondary} />
                        )}
                        {!!project.links?.demo && (
                            <Ionicons name="globe-outline" size={15} color={colors.textSecondary} />
                        )}
                    </View>
                </View>
            </View>
        </Pressable>
    );
}

const createStyles = (colors, spacing, radius) => StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    cover: {
        width: "100%",
        height: 140,
    },
    coverPlaceholder: {
        backgroundColor: colors.successTint,
        alignItems: "center",
        justifyContent: "center",
    },
    featuredBadge: {
        position: "absolute",
        top: spacing.sm,
        right: spacing.sm,
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.sm,
        paddingVertical: 3,
        borderRadius: radius.pill,
    },
    featuredText: {
        fontSize: 11,
        fontWeight: "700",
        color: colors.amber,
    },
    body: {
        padding: spacing.md,
    },
    title: {
        fontSize: 15,
        fontWeight: "800",
        color: colors.textPrimary,
        marginBottom: 4,
    },
    summary: {
        fontSize: 12.5,
        color: colors.textSecondary,
        lineHeight: 18,
        marginBottom: spacing.sm,
    },
    tagRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 6,
        marginBottom: spacing.sm,
    },
    tag: {
        backgroundColor: colors.successTint,
        paddingHorizontal: spacing.sm,
        paddingVertical: 3,
        borderRadius: radius.pill,
    },
    tagText: {
        fontSize: 11,
        fontWeight: "600",
        color: colors.success,
    },
    metaRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    meta: {
        fontSize: 11.5,
        fontWeight: "600",
        color: colors.textMuted,
    },
    metaIcons: {
        flexDirection: "row",
        gap: spacing.sm,
    },
});
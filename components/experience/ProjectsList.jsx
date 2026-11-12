import { useEffect, useMemo, useState } from "react";
import { View, Text, FlatList, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "../../theme/ThemeContext";
import { subscribeToProjects } from "../../services/projects";

import ProjectCard from "./ProjectCard";
import { useAuthUser } from "../../hooks/useAuthUser";

export default function ProjectsList({ onCountChange }) {
    const router = useRouter();
    const { colors, spacing, radius } = useTheme();
    const styles = useMemo(() => createStyles(colors, spacing, radius), [colors, spacing, radius]);

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

       const { user, initializing } = useAuthUser();

   useEffect(() => {
       if (initializing) return;
       if (!user) {
           setProjects([]);
           setLoading(false);
           return;
       }
       const unsubscribe = subscribeToProjects(
           (data) => { setProjects(data); setLoading(false); },
           (err) => { setError(err.message); setLoading(false); }
       );
       return unsubscribe;
   }, [user, initializing]);

    useEffect(() => {
        onCountChange?.(projects.length);
    }, [projects.length]);

    // Featured first; within each group keeps newest-first from Firestore
    const sorted = useMemo(
        () => [...projects].sort((a, b) => Number(!!b.featured) - Number(!!a.featured)),
        [projects]
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator color={colors.success} />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.center}>
                <Ionicons name="alert-circle-outline" size={28} color={colors.red} />
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <FlatList
            data={sorted}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
                <ProjectCard
                    project={item}
                    onPress={() =>
                        router.push({ pathname: "/project-details", params: { id: item.id } })
                    }
                />
            )}
            ListEmptyComponent={
                <View style={styles.empty}>
                    <View style={styles.emptyIcon}>
                        <Ionicons name="code-slash" size={26} color={colors.success} />
                    </View>
                    <Text style={styles.emptyTitle}>No projects yet</Text>
                    <Text style={styles.emptyText}>
                        Show off what you've built. Add one manually or pull them straight from GitHub.
                    </Text>
                </View>
            }
            ListFooterComponent={
                <View style={styles.footer}>
                    <Pressable style={styles.addBtn} onPress={() => router.push("/add-project")}>
                        <Ionicons name="add" size={18} color={colors.success} />
                        <Text style={styles.addBtnText}>Add New Project</Text>
                    </Pressable>

                    <Pressable style={styles.githubBtn} onPress={() => router.push("/import-github")}>
                        <Ionicons name="logo-github" size={18} color={colors.textPrimary} />
                        <Text style={styles.githubBtnText}>Import from GitHub</Text>
                    </Pressable>
                </View>
            }
        />
    );
}

const createStyles = (colors, spacing, radius) => StyleSheet.create({
    listContent: {
        padding: spacing.lg,
        paddingBottom: spacing.xl,
        gap: spacing.md,
    },
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: spacing.lg,
        gap: spacing.sm,
    },
    errorText: {
        color: colors.textSecondary,
        textAlign: "center",
    },
    empty: {
        alignItems: "center",
        paddingVertical: spacing.xl,
        paddingHorizontal: spacing.lg,
    },
    emptyIcon: {
        width: 56,
        height: 56,
        borderRadius: radius.pill,
        backgroundColor: colors.successTint,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: spacing.md,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: "800",
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    emptyText: {
        fontSize: 13,
        color: colors.textSecondary,
        textAlign: "center",
        lineHeight: 19,
    },
    footer: {
        gap: spacing.sm,
        marginTop: spacing.sm,
    },
    addBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.xs,
        paddingVertical: spacing.md,
        borderRadius: radius.md,
        borderWidth: 1.5,
        borderStyle: "dashed",
        borderColor: colors.success,
    },
    addBtnText: {
        fontSize: 14,
        fontWeight: "700",
        color: colors.success,
    },
    githubBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.xs,
        paddingVertical: spacing.md,
        borderRadius: radius.md,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
    },
    githubBtnText: {
        fontSize: 14,
        fontWeight: "700",
        color: colors.textPrimary,
    },
});
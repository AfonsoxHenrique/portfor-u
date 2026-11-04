import { useEffect, useMemo, useState } from "react";
import {
    StyleSheet, Text, View, TextInput, FlatList, Pressable, Alert,
    ActivityIndicator, Keyboard,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "../../../theme/ThemeContext";
import ScreenHeader from "../../../components/ScreenHeader";
import { fetchGithubRepos } from "../../../services/github";
import { subscribeToProjects, importProjects } from "../../../services/projects";

export default function ImportGithub() {
    const router = useRouter();
    const { colors, spacing, radius } = useTheme();
    const styles = useMemo(() => createStyles(colors, spacing, radius), [colors, spacing, radius]);

    const [username, setUsername] = useState("");
    const [repos, setRepos] = useState(null); // null = haven't searched yet
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selected, setSelected] = useState(new Set());
    const [existing, setExisting] = useState([]);
    const [importing, setImporting] = useState(false);

    // Know which repos are already imported
    useEffect(() => {
        const unsubscribe = subscribeToProjects(setExisting, (e) => console.error(e));
        return unsubscribe;
    }, []);

    const importedIds = useMemo(
        () => new Set(existing.map((p) => p.githubRepoId).filter(Boolean)),
        [existing]
    );

    const available = useMemo(
        () => (repos ?? []).filter((r) => !importedIds.has(r.githubRepoId)),
        [repos, importedIds]
    );

    const allSelected = available.length > 0 && available.every((r) => selected.has(r.githubRepoId));

    const search = async () => {
        const name = username.trim().replace(/^@/, "");
        if (!name) return;

        Keyboard.dismiss();
        setLoading(true);
        setError(null);
        setSelected(new Set());

        try {
            setRepos(await fetchGithubRepos(name));
        } catch (e) {
            setRepos(null);
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const toggle = (repoId) => {
        setSelected((prev) => {
            const next = new Set(prev);
            next.has(repoId) ? next.delete(repoId) : next.add(repoId);
            return next;
        });
    };

    const toggleAll = () => {
        setSelected(allSelected ? new Set() : new Set(available.map((r) => r.githubRepoId)));
    };

    const handleImport = async () => {
        const chosen = repos.filter((r) => selected.has(r.githubRepoId));
        try {
            setImporting(true);
            const count = await importProjects(chosen, existing);
            Alert.alert(
                "Imported",
                `${count} project${count === 1 ? "" : "s"} added. Open each one to add screenshots and more details.`
            );
            router.back();
        } catch (e) {
            console.error("GitHub import error:", e);
            Alert.alert("Error", "Could not import these projects. Please try again.");
        } finally {
            setImporting(false);
        }
    };

    const header = (
        <View>
            <Text style={styles.label}>GitHub username</Text>
            <View style={styles.searchRow}>
                <View style={styles.inputWrap}>
                    <Ionicons name="logo-github" size={18} color={colors.textMuted} />
                    <TextInput
                        value={username}
                        onChangeText={setUsername}
                        onSubmitEditing={search}
                        placeholder="e.g. octocat"
                        placeholderTextColor={colors.textMuted}
                        autoCapitalize="none"
                        autoCorrect={false}
                        returnKeyType="search"
                        style={styles.input}
                    />
                </View>
                <Pressable
                    style={[styles.searchBtn, (!username.trim() || loading) && styles.disabled]}
                    onPress={search}
                    disabled={!username.trim() || loading}
                >
                    {loading ? (
                        <ActivityIndicator color={colors.white} size="small" />
                    ) : (
                        <Text style={styles.searchBtnText}>Find</Text>
                    )}
                </Pressable>
            </View>
            <Text style={styles.hint}>Only public repositories are shown. Forks are hidden.</Text>

            {!!error && (
                <View style={styles.errorBox}>
                    <Ionicons name="alert-circle-outline" size={16} color={colors.red} />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            {repos && repos.length > 0 && (
                <View style={styles.listHeader}>
                    <Text style={styles.listHeaderText}>
                        {repos.length} repo{repos.length === 1 ? "" : "s"}
                    </Text>
                    {available.length > 0 && (
                        <Pressable onPress={toggleAll} hitSlop={8}>
                            <Text style={styles.selectAll}>{allSelected ? "Clear all" : "Select all"}</Text>
                        </Pressable>
                    )}
                </View>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
            <ScreenHeader
                title="Import from GitHub"
                subtitle="PICK REPOS TO SHOWCASE"
                bg={colors.successTint}
                subtitleColor={colors.success}
            />

            <FlatList
                data={repos ?? []}
                keyExtractor={(item) => String(item.githubRepoId)}
                ListHeaderComponent={header}
                contentContainerStyle={styles.listContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    repos && !loading ? (
                        <Text style={styles.emptyText}>No public repositories found for this user.</Text>
                    ) : null
                }
                renderItem={({ item }) => {
                    const imported = importedIds.has(item.githubRepoId);
                    const checked = selected.has(item.githubRepoId);

                    return (
                        <Pressable
                            style={[styles.repoCard, checked && styles.repoCardChecked, imported && styles.disabled]}
                            onPress={() => !imported && toggle(item.githubRepoId)}
                            disabled={imported}
                        >
                            <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                                {checked && <Ionicons name="checkmark" size={14} color={colors.white} />}
                            </View>

                            <View style={styles.flex}>
                                <View style={styles.repoTitleRow}>
                                    <Text style={styles.repoTitle} numberOfLines={1}>{item.title}</Text>
                                    {imported && (
                                        <View style={styles.addedBadge}>
                                            <Text style={styles.addedBadgeText}>Added</Text>
                                        </View>
                                    )}
                                </View>

                                {!!item.summary && (
                                    <Text style={styles.repoSummary} numberOfLines={2}>{item.summary}</Text>
                                )}

                                <View style={styles.repoMeta}>
                                    {item.techStack.slice(0, 3).map((t) => (
                                        <Text key={t} style={styles.repoMetaText}>{t}</Text>
                                    ))}
                                    {item.stars > 0 && (
                                        <View style={styles.stars}>
                                            <Ionicons name="star" size={11} color={colors.amber} />
                                            <Text style={styles.repoMetaText}>{item.stars}</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </Pressable>
                    );
                }}
            />

            {selected.size > 0 && (
                <View style={styles.footer}>
                    <Pressable
                        style={[styles.importBtn, importing && styles.disabled]}
                        onPress={handleImport}
                        disabled={importing}
                    >
                        {importing ? (
                            <ActivityIndicator color={colors.white} />
                        ) : (
                            <Text style={styles.importBtnText}>
                                Import {selected.size} project{selected.size === 1 ? "" : "s"}
                            </Text>
                        )}
                    </Pressable>
                </View>
            )}
        </SafeAreaView>
    );
}

const createStyles = (colors, spacing, radius) => StyleSheet.create({
    flex: { flex: 1 },
    safeArea: { flex: 1, backgroundColor: colors.background },
    listContent: { padding: spacing.lg, paddingBottom: spacing.xl, gap: spacing.sm },
    label: {
        fontSize: 13,
        fontWeight: "600",
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    searchRow: { flexDirection: "row", gap: spacing.sm },
    inputWrap: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.md,
    },
    input: { flex: 1, paddingVertical: 12, fontSize: 14, color: colors.textPrimary },
    searchBtn: {
        backgroundColor: colors.navy,
        borderRadius: radius.md,
        paddingHorizontal: spacing.lg,
        alignItems: "center",
        justifyContent: "center",
        minWidth: 72,
    },
    searchBtnText: { color: colors.white, fontSize: 14, fontWeight: "700" },
    hint: { fontSize: 12, color: colors.textMuted, marginTop: spacing.xs },
    errorBox: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.xs,
        backgroundColor: colors.redTint,
        borderRadius: radius.md,
        padding: spacing.md,
        marginTop: spacing.md,
    },
    errorText: { flex: 1, fontSize: 13, color: colors.red, fontWeight: "600" },
    listHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: spacing.lg,
        marginBottom: spacing.xs,
    },
    listHeaderText: { fontSize: 13, fontWeight: "700", color: colors.textSecondary },
    selectAll: { fontSize: 13, fontWeight: "700", color: colors.success },
    emptyText: {
        textAlign: "center",
        color: colors.textSecondary,
        marginTop: spacing.lg,
    },
    repoCard: {
        flexDirection: "row",
        gap: spacing.md,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        padding: spacing.md,
    },
    repoCardChecked: { borderColor: colors.success },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: radius.sm,
        borderWidth: 1.5,
        borderColor: colors.border,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 1,
    },
    checkboxChecked: { backgroundColor: colors.success, borderColor: colors.success },
    repoTitleRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
    repoTitle: { flexShrink: 1, fontSize: 14.5, fontWeight: "800", color: colors.textPrimary },
    addedBadge: {
        backgroundColor: colors.successTint,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: radius.pill,
    },
    addedBadgeText: { fontSize: 10.5, fontWeight: "700", color: colors.success },
    repoSummary: {
        fontSize: 12.5,
        color: colors.textSecondary,
        lineHeight: 18,
        marginTop: 2,
    },
    repoMeta: {
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        gap: spacing.sm,
        marginTop: spacing.xs,
    },
    repoMetaText: { fontSize: 11.5, fontWeight: "600", color: colors.textMuted },
    stars: { flexDirection: "row", alignItems: "center", gap: 3 },
    footer: {
        padding: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.surface,
    },
    importBtn: {
        backgroundColor: colors.navy,
        borderRadius: radius.md,
        paddingVertical: 14,
        alignItems: "center",
    },
    importBtnText: { color: colors.white, fontSize: 15, fontWeight: "700" },
    disabled: { opacity: 0.55 },
});
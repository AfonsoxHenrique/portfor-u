import { useEffect, useMemo, useState } from "react";
import {
    StyleSheet, Text, View, TextInput, ScrollView, Pressable, Image, Switch,
    Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";

import { useTheme } from "../../../theme/ThemeContext";
import ScreenHeader from "../../../components/ScreenHeader";
import MonthYearField from "../../../components/MonthYearField";
import TagInput from "../../../components/TagInput";
import LinkListInput from "../../../components/LinkListInput";
import { addProject, getProject, updateProject } from "../../../services/projects";
import { PROJECT_CATEGORIES, getCategory } from "../../../theme/projectCategories";
import { normalizeUrl } from "../../../utils/links";

const MAX_IMAGES = 5;
const SUMMARY_MAX = 120;

const EMPTY_FORM = {
    category: null,
    title: "",
    summary: "",
    description: "",
    role: "",
    techStack: [],
    links: [],
    startDate: null,
    endDate: null,
    ongoing: false,
    featured: false,
};

const FormField = ({ label, styles, colors, multiline, ...inputProps }) => (
    <View style={styles.field}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
            placeholderTextColor={colors.textMuted}
            style={[styles.input, multiline && styles.inputMultiline]}
            multiline={multiline}
            textAlignVertical={multiline ? "top" : "center"}
            {...inputProps}
        />
    </View>
);

export default function AddProject() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const isEdit = !!id;

    const { colors, spacing, radius } = useTheme();
    const styles = useMemo(() => createStyles(colors, spacing, radius), [colors, spacing, radius]);

    const [form, setForm] = useState(EMPTY_FORM);
    const [keptImages, setKeptImages] = useState([]);
    const [removedImages, setRemovedImages] = useState([]);
    const [newImageUris, setNewImageUris] = useState([]);
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);

    const category = getCategory(form.category);
    const update = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

    useEffect(() => {
        if (!isEdit) return;
        (async () => {
            try {
                const p = await getProject(id);
                if (!p) {
                    Alert.alert("Not found", "This project no longer exists.");
                    router.back();
                    return;
                }
                setForm({
                    category: p.category ?? "other",
                    title: p.title ?? "",
                    summary: p.summary ?? "",
                    description: p.description ?? "",
                    role: p.role ?? "",
                    techStack: p.techStack ?? [],
                    links: Array.isArray(p.links) ? p.links : [],
                    startDate: p.startDate ?? null,
                    endDate: p.endDate ?? null,
                    ongoing: !!p.startDate && !p.endDate,
                    featured: !!p.featured,
                });
                setKeptImages(p.images ?? []);
            } catch (error) {
                console.error("Load project error:", error);
                Alert.alert("Error", "Could not load this project.");
                router.back();
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    const imageCount = keptImages.length + newImageUris.length;

    const pickImages = async () => {
        const remaining = MAX_IMAGES - imageCount;
        if (remaining <= 0) {
            Alert.alert("Limit reached", `You can add up to ${MAX_IMAGES} images.`);
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsMultipleSelection: true,
            selectionLimit: remaining,
            quality: 0.7,
        });

        if (result.canceled) return;

        const uris = result.assets.map((a) => a.uri);
        setNewImageUris((prev) => [...prev, ...uris].slice(0, MAX_IMAGES - keptImages.length));
    };

    const removeKept = (img) => {
        setKeptImages((prev) => prev.filter((i) => i.path !== img.path));
        setRemovedImages((prev) => [...prev, img]);
    };

    const removeNew = (uri) => setNewImageUris((prev) => prev.filter((u) => u !== uri));

    const thumbs = [
        ...keptImages.map((img) => ({ key: img.path, uri: img.url, onRemove: () => removeKept(img) })),
        ...newImageUris.map((uri) => ({ key: uri, uri, onRemove: () => removeNew(uri) })),
    ];

    const handleSave = async () => {
        if (!form.category) {
            Alert.alert("Pick a category", "Choose what kind of work this is.");
            return;
        }
        if (!form.title.trim()) {
            Alert.alert("Missing title", "Give your project a title.");
            return;
        }
        if (!form.ongoing && form.startDate && !form.endDate) {
            Alert.alert("Missing end date", 'Add an end date, or turn on "Still working on this".');
            return;
        }
        if (!form.ongoing && form.startDate && form.endDate && form.endDate < form.startDate) {
            Alert.alert("Check your dates", "The end date can't be before the start date.");
            return;
        }

        const data = {
            category: form.category,
            title: form.title.trim(),
            summary: form.summary.trim(),
            description: form.description.trim(),
            role: form.role.trim(),
            techStack: form.techStack,
            links: form.links.map(normalizeUrl).filter(Boolean),
            startDate: form.startDate,
            endDate: form.ongoing ? null : form.endDate,
            featured: form.featured,
        };

        try {
            setSaving(true);
            if (isEdit) {
                await updateProject(id, data, { keptImages, newImageUris, removedImages });
            } else {
                await addProject(data, newImageUris);
            }
            router.back();
        } catch (error) {
            console.error("Save project error:", error);
            Alert.alert("Error", "Could not save this project. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                <View style={styles.center}>
                    <ActivityIndicator color={colors.success} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
            <ScreenHeader
                title={isEdit ? "Edit Project" : "Add Project"}
                subtitle={isEdit ? "UPDATE YOUR WORK" : "SHOWCASE YOUR WORK"}
                bg={colors.successTint}
                subtitleColor={colors.success}
            />

            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Category */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>What kind of work is this?</Text>
                        <View style={styles.categoryGrid}>
                            {PROJECT_CATEGORIES.map((c) => {
                                const active = form.category === c.id;
                                return (
                                    <Pressable
                                        key={c.id}
                                        onPress={() => update("category")(c.id)}
                                        style={[styles.categoryChip, active && styles.categoryChipActive]}
                                        accessibilityRole="radio"
                                        accessibilityState={{ selected: active }}
                                    >
                                        <Ionicons
                                            name={c.icon}
                                            size={16}
                                            color={active ? colors.white : colors.success}
                                        />
                                        <Text style={[styles.categoryText, active && styles.categoryTextActive]}>
                                            {c.short}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>

                    {/* Images */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Images</Text>
                        <Text style={styles.hint}>
                            Screenshots, artwork, photos or thumbnails. The first one is the cover. Up to {MAX_IMAGES}.
                        </Text>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbRow}>
                            {thumbs.map((t, index) => (
                                <View key={t.key}>
                                    <Image source={{ uri: t.uri }} style={styles.thumb} />
                                    {index === 0 && (
                                        <View style={styles.coverBadge}>
                                            <Text style={styles.coverBadgeText}>Cover</Text>
                                        </View>
                                    )}
                                    <Pressable style={styles.thumbRemove} onPress={t.onRemove} hitSlop={6}>
                                        <Ionicons name="close" size={14} color={colors.white} />
                                    </Pressable>
                                </View>
                            ))}

                            {imageCount < MAX_IMAGES && (
                                <Pressable style={styles.addThumb} onPress={pickImages}>
                                    <Ionicons name="image-outline" size={22} color={colors.success} />
                                    <Text style={styles.addThumbText}>Add</Text>
                                </Pressable>
                            )}
                        </ScrollView>
                    </View>

                    {/* Basics */}
                    <View style={styles.card}>
                        <FormField
                            label="Title *"
                            styles={styles}
                            colors={colors}
                            value={form.title}
                            onChangeText={update("title")}
                            placeholder={category.titlePlaceholder}
                        />
                        <FormField
                            label={`Short summary (${form.summary.length}/${SUMMARY_MAX})`}
                            styles={styles}
                            colors={colors}
                            value={form.summary}
                            onChangeText={update("summary")}
                            placeholder="One line shown on the card"
                            maxLength={SUMMARY_MAX}
                        />
                        <FormField
                            label="Description"
                            styles={styles}
                            colors={colors}
                            value={form.description}
                            onChangeText={update("description")}
                            placeholder={category.descriptionPlaceholder}
                            multiline
                        />
                    </View>

                    {/* Skills */}
                    <View style={styles.card}>
                        <TagInput
                            label={category.skillsLabel}
                            tags={form.techStack}
                            onChange={update("techStack")}
                            placeholder={category.skillsPlaceholder}
                        />
                    </View>

                    {/* Dates */}
                    <View style={styles.card}>
                        <View style={styles.dateRow}>
                            <MonthYearField
                                label="Start date"
                                value={form.startDate}
                                onChange={update("startDate")}
                            />
                            <MonthYearField
                                label="End date"
                                value={form.endDate}
                                onChange={update("endDate")}
                                disabled={form.ongoing}
                            />
                        </View>

                        <View style={[styles.switchRow, styles.switchRowSpaced]}>
                            <Text style={styles.switchLabel}>Still working on this</Text>
                            <Switch
                                value={form.ongoing}
                                onValueChange={update("ongoing")}
                                trackColor={{ true: colors.success, false: colors.border }}
                                thumbColor={colors.white}
                            />
                        </View>
                    </View>

                    {/* Links */}
                    <View style={styles.card}>
                        <LinkListInput links={form.links} onChange={update("links")} />
                    </View>

                    {/* Featured */}
                    <View style={[styles.card, styles.switchRow]}>
                        <View style={styles.flex}>
                            <Text style={styles.switchLabel}>Feature this project</Text>
                            <Text style={styles.hint}>Featured projects show first.</Text>
                        </View>
                        <Switch
                            value={form.featured}
                            onValueChange={update("featured")}
                            trackColor={{ true: colors.amber, false: colors.border }}
                            thumbColor={colors.white}
                        />
                    </View>

                    <Pressable
                        style={[styles.saveBtn, saving && styles.disabled]}
                        onPress={handleSave}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator color={colors.white} />
                        ) : (
                            <Text style={styles.saveBtnText}>{isEdit ? "Save changes" : "Add project"}</Text>
                        )}
                    </Pressable>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const createStyles = (colors, spacing, radius) => StyleSheet.create({
    flex: { flex: 1 },
    safeArea: { flex: 1, backgroundColor: colors.background },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
    content: {
        padding: spacing.lg,
        paddingBottom: spacing.xl,
        gap: spacing.md,
    },
    card: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        padding: spacing.md,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: colors.textPrimary,
    },
    hint: {
        fontSize: 12,
        color: colors.textMuted,
        marginTop: 2,
    },
    categoryGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.sm,
        marginTop: spacing.md,
    },
    categoryChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.background,
    },
    categoryChipActive: {
        backgroundColor: colors.success,
        borderColor: colors.success,
    },
    categoryText: {
        fontSize: 13,
        fontWeight: "600",
        color: colors.textPrimary,
    },
    categoryTextActive: { color: colors.white },
    field: { marginBottom: spacing.md },
    label: {
        fontSize: 13,
        fontWeight: "600",
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        backgroundColor: colors.background,
        paddingHorizontal: spacing.md,
        paddingVertical: 12,
        fontSize: 14,
        color: colors.textPrimary,
    },
    inputMultiline: { minHeight: 110 },
    thumbRow: {
        gap: spacing.sm,
        paddingTop: spacing.md,
    },
    thumb: {
        width: 96,
        height: 96,
        borderRadius: radius.md,
        backgroundColor: colors.background,
    },
    coverBadge: {
        position: "absolute",
        left: 6,
        bottom: 6,
        backgroundColor: "rgba(0,0,0,0.6)",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: radius.sm,
    },
    coverBadgeText: { fontSize: 10, fontWeight: "700", color: colors.white },
    thumbRemove: {
        position: "absolute",
        top: 4,
        right: 4,
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: "rgba(0,0,0,0.6)",
        alignItems: "center",
        justifyContent: "center",
    },
    addThumb: {
        width: 96,
        height: 96,
        borderRadius: radius.md,
        borderWidth: 1.5,
        borderStyle: "dashed",
        borderColor: colors.success,
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
    },
    addThumbText: { fontSize: 12, fontWeight: "700", color: colors.success },
    dateRow: {
        flexDirection: "row",
        gap: spacing.md,
    },
    switchRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    switchRowSpaced: { marginTop: spacing.md },
    switchLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.textPrimary,
    },
    saveBtn: {
        backgroundColor: colors.navy,
        borderRadius: radius.md,
        paddingVertical: 14,
        alignItems: "center",
        marginTop: spacing.sm,
    },
    saveBtnText: { color: colors.white, fontSize: 15, fontWeight: "700" },
    disabled: { opacity: 0.6 },
});
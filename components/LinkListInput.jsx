import { useMemo } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";
import { getLinkMeta } from "../utils/links";

export default function LinkListInput({ links, onChange, max = 5 }) {
    const { colors, spacing, radius } = useTheme();
    const styles = useMemo(() => createStyles(colors, spacing, radius), [colors, spacing, radius]);

    const updateAt = (index, value) => onChange(links.map((l, i) => (i === index ? value : l)));
    const removeAt = (index) => onChange(links.filter((_, i) => i !== index));

    return (
        <View>
            <Text style={styles.label}>Links</Text>
            <Text style={styles.hint}>GitHub, Behance, YouTube, Google Drive, a live site…</Text>

            {links.map((url, index) => {
                const meta = getLinkMeta(url);
                return (
                    <View key={index} style={styles.row}>
                        <Ionicons name={meta.icon} size={18} color={colors.textSecondary} />
                        <TextInput
                            value={url}
                            onChangeText={(v) => updateAt(index, v)}
                            placeholder="Paste a link"
                            placeholderTextColor={colors.textMuted}
                            autoCapitalize="none"
                            autoCorrect={false}
                            keyboardType="url"
                            style={styles.input}
                        />
                        <Pressable onPress={() => removeAt(index)} hitSlop={8} accessibilityLabel="Remove link">
                            <Ionicons name="close-circle" size={20} color={colors.textMuted} />
                        </Pressable>
                    </View>
                );
            })}

            {links.length < max && (
                <Pressable style={styles.addBtn} onPress={() => onChange([...links, ""])}>
                    <Ionicons name="add" size={16} color={colors.success} />
                    <Text style={styles.addBtnText}>Add link</Text>
                </Pressable>
            )}
        </View>
    );
}

const createStyles = (colors, spacing, radius) => StyleSheet.create({
    label: {
        fontSize: 13,
        fontWeight: "600",
        color: colors.textPrimary,
    },
    hint: {
        fontSize: 12,
        color: colors.textMuted,
        marginTop: 2,
        marginBottom: spacing.sm,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        backgroundColor: colors.background,
        paddingHorizontal: spacing.md,
        marginBottom: spacing.sm,
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 14,
        color: colors.textPrimary,
    },
    addBtn: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        gap: 4,
        paddingVertical: spacing.xs,
    },
    addBtnText: {
        fontSize: 13.5,
        fontWeight: "700",
        color: colors.success,
    },
});
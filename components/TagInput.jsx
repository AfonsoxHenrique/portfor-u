import { useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";

export default function TagInput({ label, tags, onChange, placeholder = "Type and press enter" }) {
    const { colors, spacing, radius } = useTheme();
    const styles = useMemo(() => createStyles(colors, spacing, radius), [colors, spacing, radius]);
    const [text, setText] = useState("");

    const addTags = (raw) => {
        const parts = raw.split(",").map((t) => t.trim()).filter(Boolean);
        if (!parts.length) return setText("");

        const next = [...tags];
        parts.forEach((p) => {
            if (!next.some((t) => t.toLowerCase() === p.toLowerCase())) next.push(p);
        });
        onChange(next);
        setText("");
    };

    const handleChange = (value) => {
        if (value.includes(",")) addTags(value);
        else setText(value);
    };

    return (
        <View>
            {!!label && <Text style={styles.label}>{label}</Text>}

            {tags.length > 0 && (
                <View style={styles.chips}>
                    {tags.map((tag) => (
                        <View key={tag} style={styles.chip}>
                            <Text style={styles.chipText}>{tag}</Text>
                            <Pressable
                                onPress={() => onChange(tags.filter((t) => t !== tag))}
                                hitSlop={8}
                                accessibilityLabel={`Remove ${tag}`}
                            >
                                <Ionicons name="close" size={14} color={colors.success} />
                            </Pressable>
                        </View>
                    ))}
                </View>
            )}

            <TextInput
                value={text}
                onChangeText={handleChange}
                onSubmitEditing={() => addTags(text)}
                onBlur={() => addTags(text)}
                submitBehavior="submit"
                blurOnSubmit={false}
                placeholder={placeholder}
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                style={styles.input}
            />
        </View>
    );
}

const createStyles = (colors, spacing, radius) => StyleSheet.create({
    label: {
        fontSize: 13,
        fontWeight: "600",
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    chips: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 6,
        marginBottom: spacing.sm,
    },
    chip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: colors.successTint,
        paddingLeft: spacing.sm,
        paddingRight: 6,
        paddingVertical: 4,
        borderRadius: radius.pill,
    },
    chipText: { fontSize: 12, fontWeight: "600", color: colors.success },
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
});
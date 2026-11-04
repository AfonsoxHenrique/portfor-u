import { useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "../theme/ThemeContext";

export default function SegmentedToggle({ options, value, onChange, activeColor }) {
    const { colors, spacing, radius } = useTheme();
    const styles = useMemo(() => createStyles(colors, spacing, radius), [colors, spacing, radius]);

    return (
        <View style={styles.track} accessibilityRole="tablist">
            {options.map((opt) => {
                const active = opt.value === value;
                return (
                    <Pressable
                        key={opt.value}
                        onPress={() => onChange(opt.value)}
                        style={[styles.segment, active && styles.segmentActive]}
                        accessibilityRole="tab"
                        accessibilityState={{ selected: active }}
                    >
                        <Text style={[styles.label, active && { color: activeColor ?? colors.textPrimary }]}>
                            {opt.label}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}

const createStyles = (colors, spacing, radius) => StyleSheet.create({
    track: {
        flexDirection: "row",
        backgroundColor: colors.border,
        borderRadius: radius.pill,
        padding: 4,
        marginHorizontal: spacing.lg,
        marginTop: spacing.md,
    },
    segment: {
        flex: 1,
        paddingVertical: spacing.sm,
        borderRadius: radius.pill,
        alignItems: "center",
    },
    segmentActive: {
        backgroundColor: colors.surface,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
        elevation: 2,
    },
    label: {
        fontSize: 13.5,
        fontWeight: "700",
        color: colors.textSecondary,
    },
});
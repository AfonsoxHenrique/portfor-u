import { useMemo } from "react";
import { StyleSheet, Pressable, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";

const FloatingActionButton = ({
    icon = "add",
    label,                 
    onPress,
    color,                 
    accessibilityLabel,
    disabled = false,
    bottom,                
}) => {
    const { colors, spacing, radius } = useTheme();
    const styles = useMemo(() => createStyles(colors, spacing, radius), [colors, spacing, radius]);

    const bg = color ?? colors.accentBlue;

    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel ?? label ?? "Add"}
            style={({ pressed }) => [
                styles.fab,
                label ? styles.extended : styles.round,
                {
                    backgroundColor: bg,
                    shadowColor: bg,
                    bottom: bottom ?? spacing.lg,
                    transform: [{ scale: pressed ? 0.94 : 1 }],
                    opacity: disabled ? 0.5 : 1,
                },
            ]}
        >
            <Ionicons name={icon} size={label ? 20 : 26} color={colors.white} />
            {!!label && <Text style={styles.label}>{label}</Text>}
        </Pressable>
    );
};

export default FloatingActionButton;

const createStyles = (colors, spacing, radius) => StyleSheet.create({
    fab: {
        position: "absolute",
        right: spacing.lg,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        shadowOpacity: 0.35,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 6,
    },
    round: {
        width: 56,
        height: 56,
        borderRadius: 28,
    },
    extended: {
        height: 52,
        paddingHorizontal: spacing.lg,
        borderRadius: radius.pill,
        gap: spacing.xs,
    },
    label: {
        color: colors.white,
        fontSize: 14.5,
        fontWeight: "700",
    },
});